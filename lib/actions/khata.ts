"use server";

import { db } from "@/lib/db";
import { khataTransactions, customers, businesses, invoices } from "@/lib/schema";
import { khataTransactionSchema, type KhataTransactionInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, sql, and, gte } from "drizzle-orm";

export async function calculateLateFees(
  invoiceId: string,
  businessId: string
): Promise<number> {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });
  
  if (!business || !business.redemptionPeriodDays || !business.finePercentage || !business.fineFrequencyDays) {
    return 0;
  }
  
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  });
  
  if (!invoice || invoice.paymentStatus !== 'unpaid') {
    return 0;
  }
  
  const invoiceDate = new Date(invoice.invoiceDate);
  const today = new Date();
  
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + (business.redemptionPeriodDays || 30));
  
  if (today <= dueDate) {
    return 0;
  }
  
  const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const fineFrequencyDays = business.fineFrequencyDays || 7;
  const finePercentage = Number(business.finePercentage) || 2;
  
  const finePeriods = Math.floor(daysOverdue / fineFrequencyDays);
  const invoiceTotal = Number(invoice.total) || 0;
  
  return Math.round(invoiceTotal * (finePercentage / 100) * finePeriods * 100) / 100;
}

export async function createKhataTransaction(data: KhataTransactionInput) {
  try {
    const session = await requireBusinessSession();
    
    const validation = khataTransactionSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const customerCheck = await db.query.customers.findFirst({
      where: eq(customers.id, data.customerId),
    });

    if (!customerCheck || customerCheck.businessId !== session.id) {
      return { error: "Customer not found" };
    }

    const transaction = await db.transaction(async (tx) => {
      const customerRows = await tx.execute(
        sql`SELECT id, current_balance, credit_limit FROM customers WHERE id = ${data.customerId} FOR UPDATE`
      ) as unknown as { id: string; current_balance: number | null; credit_limit: number | null }[];
      const lockedCustomer = customerRows[0];
      
      if (!lockedCustomer) {
        throw new Error("Customer not found");
      }

      const [newTransaction] = await tx.insert(khataTransactions).values({
        id: crypto.randomUUID(),
        businessId: session.id,
        customerId: data.customerId,
        type: data.type,
        amount: data.amount,
        note: data.note || null,
      }).returning();

      const newBalance = data.type === 'credit'
        ? (lockedCustomer.current_balance ?? 0) + data.amount
        : (lockedCustomer.current_balance ?? 0) - data.amount;

      if (newBalance < 0) {
        throw new Error("Payment exceeds current balance");
      }

      if ((lockedCustomer.credit_limit ?? 0) > 0 && newBalance > lockedCustomer.credit_limit!) {
        throw new Error(`Credit limit exceeded. Limit: ₹${lockedCustomer.credit_limit}, Current: ₹${lockedCustomer.current_balance}, New: ₹${newBalance}`);
      }

      await tx.update(customers)
        .set({
          currentBalance: newBalance,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, data.customerId));

      return newTransaction;
    });

    return { success: true, transaction };
  } catch (error: any) {
    return { error: error.message || "Failed to create transaction" };
  }
}

export async function getKhataTransactions(customerId?: string) {
  try {
    const session = await requireBusinessSession();

    const transactions = await db.query.khataTransactions.findMany({
      where: customerId 
        ? eq(khataTransactions.customerId, customerId)
        : undefined,
      orderBy: (khataTransactions, { desc }) => [desc(khataTransactions.createdAt)],
    });

    const filtered = transactions.filter((t: any) => t.businessId === session.id);

    return { success: true, transactions: filtered };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch transactions" };
  }
}

export async function getKhataStatement(customerId: string) {
  try {
    const session = await requireBusinessSession();

    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, customerId),
    });

    if (!customer || customer.businessId !== session.id) {
      return { error: "Customer not found" };
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, session.id),
    });

    const transactions = await db.query.khataTransactions.findMany({
      where: eq(khataTransactions.customerId, customerId),
      orderBy: (khataTransactions, { asc }) => [asc(khataTransactions.createdAt)],
    });

    const invoicesList = await db.query.invoices.findMany({
      where: and(
        eq(invoices.customerId, customerId),
        eq(invoices.paymentStatus, 'unpaid')
      ),
    });

    let totalAccruedFines = 0;
    const invoiceFines: Record<string, number> = {};
    
    if (business && invoicesList.length > 0) {
      for (const inv of invoicesList) {
        const fine = await calculateLateFees(inv.id, session.id);
        if (fine > 0) {
          invoiceFines[inv.id] = fine;
          totalAccruedFines += fine;
        }
      }
    }

    let runningBalance = 0;
    const statementWithBalance = transactions.map(t => {
      const prevBalance = runningBalance;
      if (t.type === 'credit') {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      let accruedFine = 0;
      if (t.referenceInvoiceId && invoiceFines[t.referenceInvoiceId]) {
        accruedFine = invoiceFines[t.referenceInvoiceId];
      }
      return {
        ...t,
        prevBalance,
        runningBalance,
        accruedFine,
      };
    });

    const statement = statementWithBalance.reverse();

    const totalBalanceWithFines = (customer.currentBalance ?? 0) + totalAccruedFines;

    return {
      success: true,
      customer,
      statement,
      currentBalance: customer.currentBalance,
      accruedFines: totalAccruedFines,
      totalBalanceDue: totalBalanceWithFines,
    };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch khata statement" };
  }
}

export async function deleteKhataTransaction(id: string) {
  try {
    const session = await requireBusinessSession();

    const transaction = await db.query.khataTransactions.findFirst({
      where: eq(khataTransactions.id, id),
    });

    if (!transaction || transaction.businessId !== session.id) {
      return { error: "Transaction not found" };
    }

    if (transaction.referenceInvoiceId) {
      return { error: "Cannot delete invoice-linked transactions" };
    }

    await db.transaction(async (tx) => {
      const balanceAdjustment = transaction.type === 'credit'
        ? -transaction.amount
        : transaction.amount;

      const customerRows = await tx.execute(
        sql`SELECT id, current_balance FROM customers WHERE id = ${transaction.customerId} FOR UPDATE`
      ) as unknown as { id: string; current_balance: number | null }[];
      const customer = customerRows[0];
      
      if (customer) {
        await tx.update(customers)
          .set({
            currentBalance: (customer.current_balance ?? 0) + balanceAdjustment,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, transaction.customerId));
      }

      await tx.delete(khataTransactions)
        .where(eq(khataTransactions.id, id));
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete transaction" };
  }
}
