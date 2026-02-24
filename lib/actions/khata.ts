"use server";

import { db } from "@/lib/db";
import { khataTransactions, customers, businesses, invoices } from "@/lib/schema";
import { khataTransactionSchema, type KhataTransactionInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, sql, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

      const currentBalance = Number(lockedCustomer.current_balance) || 0;
      const creditLimit = Number(lockedCustomer.credit_limit) || 0;

      const newBalance = data.type === 'credit'
        ? currentBalance + data.amount
        : currentBalance - data.amount;

      // Credit limit enforcement: check BEFORE inserting
      if (data.type === 'credit' && creditLimit > 0 && newBalance > creditLimit) {
        const available = Math.max(0, creditLimit - currentBalance);
        throw new Error(`Credit limit exceeded. Limit: ₹${creditLimit.toLocaleString('en-IN')}, Current Owed: ₹${currentBalance.toLocaleString('en-IN')}, Available: ₹${available.toLocaleString('en-IN')}, Requested: ₹${data.amount.toLocaleString('en-IN')}`);
      }

      // For payments (debit): allow overpayment, resulting in negative balance (credit in customer's favor)
      // No clamping to 0 — negative balance means customer has advance credit

      const [newTransaction] = await tx.insert(khataTransactions).values({
        id: crypto.randomUUID(),
        businessId: session.id,
        customerId: data.customerId,
        type: data.type,
        amount: data.amount,
        note: data.note || null,
      }).returning();

      await tx.update(customers)
        .set({
          currentBalance: newBalance,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, data.customerId));

      return newTransaction;
    });

    revalidatePath('/dashboard/khata');
    revalidatePath('/dashboard');
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

    const allTransactions = await db.query.khataTransactions.findMany({
      where: eq(khataTransactions.customerId, customerId),
      orderBy: (khataTransactions, { asc }) => [asc(khataTransactions.createdAt)],
    });
    
    const transactions = allTransactions.filter(t => t.status !== 'cancelled');

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

    const statementWithAll = allTransactions.map(t => {
      let accruedFine = 0;
      if (t.referenceInvoiceId && invoiceFines[t.referenceInvoiceId]) {
        accruedFine = invoiceFines[t.referenceInvoiceId];
      }
      return {
        ...t,
        runningBalance: 0,
        accruedFine,
      };
    });

    let runningBalance = 0;
    
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
    );
    
    const transactionBalances: Record<string, number> = {};
    
    for (const t of sortedTransactions) {
      if (t.type === 'credit') {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      transactionBalances[t.id] = runningBalance;
    }

    const statement = statementWithAll.map(t => {
      if (t.status === 'cancelled') {
        return { ...t };
      }
      return {
        ...t,
        runningBalance: transactionBalances[t.id] ?? 0,
      };
    }).reverse();

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

    if (transaction.status === 'cancelled') {
      return { error: "Transaction already cancelled" };
    }

    if (transaction.referenceInvoiceId) {
      return { error: "Cannot cancel invoice-linked transactions" };
    }

    await db.transaction(async (tx) => {
      // Cancelling a debit (payment) → add the amount back (debt restored)
      // Cancelling a credit (sale) → subtract the amount (debt removed)
      const balanceAdjustment = transaction.type === 'debit'
        ? transaction.amount
        : -transaction.amount;

      const customerRows = await tx.execute(
        sql`SELECT id, current_balance FROM customers WHERE id = ${transaction.customerId} FOR UPDATE`
      ) as unknown as { id: string; current_balance: number | null }[];
      const customer = customerRows[0];
      
      if (customer) {
        const currentBalance = Number(customer.current_balance) || 0;
        const newBalance = currentBalance + balanceAdjustment;
        // No Math.max(0) clamping — preserve true accounting balance
        await tx.update(customers)
          .set({
            currentBalance: newBalance,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, transaction.customerId));
      }

      await tx.update(khataTransactions)
        .set({ status: 'cancelled' })
        .where(eq(khataTransactions.id, id));
    });

    revalidatePath('/dashboard/khata');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to cancel transaction" };
  }
}

export async function recalculateCustomerBalance(customerId: string) {
  try {
    const session = await requireBusinessSession();

    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, customerId),
    });

    if (!customer || customer.businessId !== session.id) {
      return { error: "Customer not found" };
    }

    const allTransactions = await db.query.khataTransactions.findMany({
      where: eq(khataTransactions.customerId, customerId),
    });

    const transactions = allTransactions.filter(t => t.status !== 'cancelled');

    let calculatedBalance = 0;
    for (const t of transactions) {
      if (t.type === 'credit') {
        calculatedBalance += Number(t.amount) || 0;
      } else {
        calculatedBalance -= Number(t.amount) || 0;
      }
    }

    // No Math.max(0) — allow negative balance (customer overpaid / has advance credit)

    await db.update(customers)
      .set({ currentBalance: calculatedBalance, updatedAt: new Date() })
      .where(eq(customers.id, customerId));

    revalidatePath('/dashboard/khata');
    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard');
    return { success: true, newBalance: calculatedBalance };
  } catch (error: any) {
    return { error: error.message || "Failed to recalculate balance" };
  }
}
