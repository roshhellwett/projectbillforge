"use server";

import { Decimal } from 'decimal.js';

import { db } from "@/lib/db";
import { khataTransactions, customers, businesses, invoices } from "@/lib/schema";
import { khataTransactionSchema, type KhataTransactionInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Calculate late fees using pre-fetched data (no extra DB queries)
function calculateLateFeesFromData(
  invoice: { invoiceDate: string; paymentStatus: string | null; total: number | null },
  business: { redemptionPeriodDays: number | null; finePercentage: number | null; fineFrequencyDays: number | null }
): number {
  if (!business.redemptionPeriodDays || !business.finePercentage || !business.fineFrequencyDays) {
    return 0;
  }
  if (invoice.paymentStatus !== 'unpaid') {
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

      const currentBalance = new Decimal(lockedCustomer.current_balance || 0);
      const creditLimit = new Decimal(lockedCustomer.credit_limit || 0);

      const amountToProcess = new Decimal(data.amount);

      const newBalance = data.type === 'credit'
        ? currentBalance.plus(amountToProcess)
        : currentBalance.minus(amountToProcess);

      // Credit limit enforcement: check BEFORE inserting
      if (data.type === 'credit' && creditLimit.greaterThan(0) && newBalance.greaterThan(creditLimit)) {
        const available = Decimal.max(0, creditLimit.minus(currentBalance));
        throw new Error(`Credit limit exceeded. Limit: ${creditLimit.toFixed(2)}, Current Owed: ${currentBalance.toFixed(2)}, Available: ${available.toFixed(2)}, Requested: ${amountToProcess.toFixed(2)}`);
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

      // FIFO Invoice Auto-Settlement Logic
      if (data.type === 'debit') {
        let remainingPayment = amountToProcess;

        // Fetch all unpaid or partially paid invoices for this customer, oldest first
        const pendingInvoicesRows = await tx.execute(
          sql`SELECT id, total, amount_paid FROM invoices 
              WHERE customer_id = ${data.customerId} 
              AND business_id = ${session.id}
              AND payment_status IN ('unpaid', 'partial')
              AND status = 'active'
              ORDER BY invoice_date ASC, created_at ASC 
              FOR UPDATE`
        ) as unknown as { id: string; total: number | null; amount_paid: number | null }[];

        const invoicesToUpdate: { id: string; amountPaid: number; status: 'paid' | 'partial' }[] = [];

        for (const inv of pendingInvoicesRows) {
          if (remainingPayment.lessThanOrEqualTo(0)) break;

          const invTotal = new Decimal(inv.total || 0);
          const invPaid = new Decimal(inv.amount_paid || 0);
          const amountDue = invTotal.minus(invPaid);

          if (amountDue.lessThanOrEqualTo(0)) continue; // Safety check

          if (remainingPayment.greaterThanOrEqualTo(amountDue)) {
            invoicesToUpdate.push({
              id: inv.id,
              amountPaid: invTotal.toNumber(),
              status: 'paid'
            });
            remainingPayment = remainingPayment.minus(amountDue);
          } else {
            invoicesToUpdate.push({
              id: inv.id,
              amountPaid: invPaid.plus(remainingPayment).toNumber(),
              status: 'partial'
            });
            remainingPayment = new Decimal(0);
          }
        }

        // Execute batch updates using CASE statement to avoid N+1 queries
        if (invoicesToUpdate.length > 0) {
          const ids = invoicesToUpdate.map(inv => inv.id);
          const sqlIds = sql.join(ids.map(id => sql`${id}`), sql`, `);

          // Build dynamic CASE queries
          const amountPaidCases = sql.join(
            invoicesToUpdate.map(inv => sql`WHEN id = ${inv.id} THEN ${inv.amountPaid}`),
            sql` `
          );

          const statusCases = sql.join(
            invoicesToUpdate.map(inv => sql`WHEN id = ${inv.id} THEN ${inv.status}`),
            sql` `
          );

          await tx.execute(sql`
            UPDATE invoices 
            SET 
              amount_paid = CASE ${amountPaidCases} END,
              payment_status = CASE ${statusCases} END,
              updated_at = NOW()
            WHERE id IN (${sqlIds})
          `);
        }
      }

      await tx.update(customers)
        .set({
          currentBalance: newBalance.toNumber(),
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


export async function getKhataStatement(customerId: string) {
  try {
    const session = await requireBusinessSession();

    const customer = await db.query.customers.findFirst({
      where: and(eq(customers.id, customerId), eq(customers.businessId, session.id)),
    });

    if (!customer) {
      return { error: "Customer not found" };
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, session.id),
    });

    const allTransactions = await db.query.khataTransactions.findMany({
      where: and(eq(khataTransactions.customerId, customerId), eq(khataTransactions.businessId, session.id)),
      orderBy: (khataTransactions, { asc }) => [asc(khataTransactions.createdAt)],
    });

    const transactions = allTransactions.filter(t => t.status !== 'cancelled');

    const invoicesList = await db.query.invoices.findMany({
      where: and(
        eq(invoices.customerId, customerId),
        eq(invoices.businessId, session.id),
        eq(invoices.paymentStatus, 'unpaid'),
        eq(invoices.status, 'active')
      ),
    });

    // Calculate fines inline — no N+1 queries
    let totalAccruedFines = 0;
    const invoiceFines: Record<string, number> = {};

    if (business && invoicesList.length > 0) {
      for (const inv of invoicesList) {
        const fine = calculateLateFeesFromData(inv, business);
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

    const calculatedBalance = await db.transaction(async (tx) => {
      // Lock the customer row to prevent concurrent modifications
      const customerRows = await tx.execute(
        sql`SELECT id, business_id, current_balance FROM customers WHERE id = ${customerId} FOR UPDATE`
      ) as unknown as { id: string; business_id: string; current_balance: number | null }[];
      const customer = customerRows[0];

      if (!customer || customer.business_id !== session.id) {
        throw new Error("Customer not found");
      }

      const allTransactions = await tx.query.khataTransactions.findMany({
        where: and(eq(khataTransactions.customerId, customerId), eq(khataTransactions.businessId, session.id)),
      });

      const transactions = allTransactions.filter(t => t.status !== 'cancelled');

      let balance = 0;
      for (const t of transactions) {
        if (t.type === 'credit') {
          balance += Number(t.amount) || 0;
        } else {
          balance -= Number(t.amount) || 0;
        }
      }

      await tx.update(customers)
        .set({ currentBalance: balance, updatedAt: new Date() })
        .where(eq(customers.id, customerId));

      return balance;
    });

    revalidatePath('/dashboard/khata');
    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard');
    return { success: true, newBalance: calculatedBalance };
  } catch (error: any) {
    return { error: error.message || "Failed to recalculate balance" };
  }
}
