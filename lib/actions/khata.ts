"use server";

import { Decimal } from 'decimal.js';

import { db } from "@/lib/db";
import { khataTransactions, customers, businesses, invoices } from "@/lib/schema";
import { khataTransactionSchema, type KhataTransactionInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, sql, and, asc } from "drizzle-orm";
import { revalidateLocalizedPaths, revalidateDashboardCache } from "@/lib/revalidate";
import { allocatePaymentAcrossInvoices, calculateLateFee } from "@/lib/accounting";
import { checkActionRateLimit } from "@/lib/rate-limit";

type KhataTransactionRow = typeof khataTransactions.$inferSelect;

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function createKhataTransaction(data: KhataTransactionInput) {
  try {
    const session = await requireBusinessSession();

    const rateCheck = await checkActionRateLimit(session.id, 'createKhataTransaction', 20, '60 s');
    if (!rateCheck.success) return { error: "Too many requests. Please try again later." };

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

      const amountToProcess = new Decimal(data.amount).toDecimalPlaces(2);

      const newBalance = data.type === 'credit'
        ? currentBalance.plus(amountToProcess)
        : currentBalance.minus(amountToProcess);

      
      if (data.type === 'credit' && lockedCustomer.credit_limit !== null) {
        const creditLimit = new Decimal(lockedCustomer.credit_limit);
        if (newBalance.greaterThan(creditLimit)) {
          const available = Decimal.max(0, creditLimit.minus(currentBalance));
          throw new Error(`Credit limit exceeded. Limit: ₹${creditLimit.toFixed(2)}, Current Owed: ₹${currentBalance.toFixed(2)}, Available: ₹${available.toFixed(2)}, Requested: ₹${amountToProcess.toFixed(2)}`);
        }
      }

      
      

      const [newTransaction] = await tx.insert(khataTransactions).values({
        id: crypto.randomUUID(),
        businessId: session.id,
        customerId: data.customerId,
        type: data.type,
        amount: amountToProcess.toNumber(),
        paymentMethod: data.paymentMethod || null,
        note: data.note || null,
      }).returning();

      
      let remainingAmount = 0;
      if (data.type === 'debit') {
        
        const pendingInvoicesRows = await tx.execute(
          sql`SELECT id, total, amount_paid FROM invoices 
              WHERE customer_id = ${data.customerId} 
              AND business_id = ${session.id}
              AND payment_status IN ('unpaid', 'partial')
              AND status = 'active'
              ORDER BY invoice_date ASC, created_at ASC 
              FOR UPDATE`
        ) as unknown as { id: string; total: number | null; amount_paid: number | null }[];

        const result = allocatePaymentAcrossInvoices(
          pendingInvoicesRows,
          amountToProcess
        );
        const invoicesToUpdate = result.updates;
        remainingAmount = result.remaining;

        
        if (invoicesToUpdate.length > 0) {
          const ids = invoicesToUpdate.map(inv => inv.id);
          const sqlIds = sql.join(ids.map(id => sql`${id}`), sql`, `);

          
          
          
          const amountPaidCases = sql.join(
            invoicesToUpdate.map(inv => sql`WHEN id = ${inv.id} THEN ${inv.amountPaid}::numeric`),
            sql` `
          );

          const statusCases = sql.join(
            invoicesToUpdate.map(inv => sql`WHEN id = ${inv.id} THEN ${inv.status}::text`),
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
          currentBalance: newBalance.toDecimalPlaces(2).toNumber(),
          updatedAt: new Date(),
        })
        .where(eq(customers.id, data.customerId));

      return { transaction: newTransaction, overpayment: data.type === 'debit' ? remainingAmount : 0 };
    });

    revalidateLocalizedPaths(['/dashboard/khata', '/dashboard']);
    revalidateDashboardCache(session.id);
    const resultData = transaction as { transaction: typeof khataTransactions.$inferSelect; overpayment: number };
    return { success: true, transaction: resultData.transaction, overpayment: resultData.overpayment };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to create transaction") };
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
      orderBy: [asc(khataTransactions.createdAt)],
    });

    const invoicesList = await db.query.invoices.findMany({
      where: and(
        eq(invoices.customerId, customerId),
        eq(invoices.businessId, session.id),
        sql`${invoices.paymentStatus} IN ('unpaid', 'partial')`,
        eq(invoices.status, 'active'),
        sql`${invoices.finesCollectedAt} IS NULL`
      ),
    });

    
    let totalAccruedFines = 0;
    const invoiceFines: Record<string, number> = {};

    if (business && invoicesList.length > 0) {
      for (const inv of invoicesList) {
        const fine = calculateLateFee(inv, business);
        if (fine > 0) {
          invoiceFines[inv.id] = fine;
          totalAccruedFines += fine;
        }
      }
    }

    const statementWithAll = allTransactions.map((t) => {
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

    let runningBalance = new Decimal(0);

    const sortedTransactions = [...allTransactions].sort((a, b) =>
      new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
    );

    const transactionBalances: Record<string, number> = {};

    for (const t of sortedTransactions) {
      if (t.status === 'cancelled') {
        transactionBalances[t.id] = runningBalance.toDecimalPlaces(2).toNumber();
      } else if (t.type === 'credit') {
        runningBalance = runningBalance.plus(t.amount);
        transactionBalances[t.id] = runningBalance.toDecimalPlaces(2).toNumber();
      } else {
        runningBalance = runningBalance.minus(t.amount);
        transactionBalances[t.id] = runningBalance.toDecimalPlaces(2).toNumber();
      }
    }

    const statement = statementWithAll.map((t) => ({
      ...t,
      runningBalance: transactionBalances[t.id] ?? 0,
    })).reverse();

    const totalBalanceWithFines = (customer.currentBalance ?? 0) + totalAccruedFines;

    return {
      success: true,
      customer,
      statement,
      currentBalance: customer.currentBalance,
      accruedFines: totalAccruedFines,
      totalBalanceDue: totalBalanceWithFines,
    };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to fetch khata statement") };
  }
}

export async function chargeLateFees(customerId: string) {
  try {
    const session = await requireBusinessSession();

    const customer = await db.query.customers.findFirst({
      where: and(eq(customers.id, customerId), eq(customers.businessId, session.id)),
    });
    if (!customer) return { error: "Customer not found" };

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, session.id),
    });
    if (!business) return { error: "Business not found" };

    const result = await db.transaction(async (tx) => {
      const overdueInvoices = await tx.query.invoices.findMany({
        where: and(
          eq(invoices.customerId, customerId),
          eq(invoices.businessId, session.id),
          sql`${invoices.paymentStatus} IN ('unpaid', 'partial')`,
          eq(invoices.status, 'active'),
          sql`${invoices.finesCollectedAt} IS NULL`
        ),
      });

      let totalFine = 0;
      const finePerInvoice: { id: string; fine: number }[] = [];

      for (const inv of overdueInvoices) {
        const fine = calculateLateFee(inv, business);
        if (fine > 0) {
          totalFine += fine;
          finePerInvoice.push({ id: inv.id, fine });
        }
      }

      if (finePerInvoice.length === 0) {
        return { charged: 0, count: 0 };
      }

      totalFine = new Decimal(totalFine).toDecimalPlaces(2).toNumber();

      const customerRows = await tx.execute(
        sql`SELECT id, current_balance, credit_limit FROM customers WHERE id = ${customerId} FOR UPDATE`
      ) as unknown as { id: string; current_balance: number | null; credit_limit: number | null }[];
      const lockedCustomer = customerRows[0];

      const currentBalance = new Decimal(lockedCustomer.current_balance || 0);
      const newBalance = currentBalance.plus(totalFine);

      if (lockedCustomer.credit_limit !== null) {
        const creditLimit = new Decimal(lockedCustomer.credit_limit);
        if (newBalance.greaterThan(creditLimit)) {
          const available = Decimal.max(0, creditLimit.minus(currentBalance));
          throw new Error(`Fine exceeds credit limit. Limit: ₹${creditLimit.toFixed(2)}, Available: ₹${available.toFixed(2)}, Fine: ₹${totalFine.toFixed(2)}`);
        }
      }

      await tx.insert(khataTransactions).values({
        id: crypto.randomUUID(),
        businessId: session.id,
        customerId,
        type: 'credit',
        amount: totalFine,
        note: `Late fees charged - ${finePerInvoice.length} invoice(s)`,
      });

      const ids = finePerInvoice.map(f => f.id);
      const sqlIds = sql.join(ids.map(id => sql`${id}`), sql`, `);
      await tx.execute(sql`
        UPDATE invoices
        SET fines_collected_at = NOW()
        WHERE id IN (${sqlIds})
      `);

      await tx.update(customers)
        .set({
          currentBalance: newBalance.toNumber(),
          updatedAt: new Date(),
        })
        .where(eq(customers.id, customerId));

      return { charged: totalFine, count: finePerInvoice.length };
    });

    revalidateLocalizedPaths(['/dashboard/khata', '/dashboard']);
    revalidateDashboardCache(session.id);
    return { success: true, ...result };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to charge late fees") };
  }
}

export async function getOverdueCustomerIds() {
  try {
    const session = await requireBusinessSession();

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, session.id),
    });
    const redemptionDays = business?.redemptionPeriodDays ?? 30;

    const overdueInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.businessId, session.id),
        eq(invoices.status, 'active'),
        sql`${invoices.paymentStatus} IN ('unpaid', 'partial')`,
        sql`${invoices.invoiceDate} < CURRENT_DATE - INTERVAL '${sql.raw(String(redemptionDays))} days'`
      ),
      columns: { customerId: true, id: true, invoiceDate: true },
    });

    const overdueMap = new Map<string, { daysOverdue: number; invoiceCount: number }>();
    for (const inv of overdueInvoices) {
      if (!inv.customerId) continue;
      const days = Math.floor((Date.now() - new Date(inv.invoiceDate).getTime()) / (1000 * 60 * 60 * 24)) - redemptionDays;
      const existing = overdueMap.get(inv.customerId);
      if (existing) {
        existing.invoiceCount++;
        if (days > existing.daysOverdue) existing.daysOverdue = days;
      } else {
        overdueMap.set(inv.customerId, { daysOverdue: Math.max(0, days), invoiceCount: 1 });
      }
    }

    return {
      success: true,
      overdueIds: Array.from(overdueMap.keys()),
      daysOverdue: Object.fromEntries(overdueMap.entries()),
    };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to fetch overdue customers") };
  }
}

export async function deleteKhataTransaction(id: string) {
  try {
    const session = await requireBusinessSession();

    const rateCheck = await checkActionRateLimit(session.id, 'deleteKhataTransaction', 10, '60 s');
    if (!rateCheck.success) return { error: "Too many requests. Please try again later." };

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
      
      
      const balanceAdjustment = transaction.type === 'debit'
        ? transaction.amount
        : -transaction.amount;

      const customerRows = await tx.execute(
        sql`SELECT id, current_balance FROM customers WHERE id = ${transaction.customerId} FOR UPDATE`
      ) as unknown as { id: string; current_balance: number | null }[];
      const customer = customerRows[0];

      if (customer) {
        const currentBalance = new Decimal(customer.current_balance || 0);
        const newBalance = currentBalance.plus(balanceAdjustment).toDecimalPlaces(2);
        
        await tx.update(customers)
          .set({
            currentBalance: newBalance.toNumber(),
            updatedAt: new Date(),
          })
          .where(eq(customers.id, transaction.customerId));
      }

      
      
      if (transaction.type === 'debit') {
        const paidInvoiceRows = await tx.execute(
          sql`SELECT id, total, amount_paid FROM invoices
              WHERE customer_id = ${transaction.customerId}
              AND business_id = ${session.id}
              AND status = 'active'
              AND amount_paid > 0
              ORDER BY invoice_date DESC, created_at DESC
              FOR UPDATE`
        ) as unknown as { id: string; total: number | null; amount_paid: number | null }[];

        
        
        let remaining = new Decimal(transaction.amount).toDecimalPlaces(2);
        const invoiceUpdates: { id: string; amountPaid: number; status: string }[] = [];

        for (const inv of paidInvoiceRows) {
          if (remaining.lessThanOrEqualTo(0)) break;
          const paid = new Decimal(inv.amount_paid ?? 0);
          if (paid.lessThanOrEqualTo(0)) continue;

          const clawback = Decimal.min(remaining, paid);
          const newPaid = paid.minus(clawback).toDecimalPlaces(2);
          const total = new Decimal(inv.total ?? 0);

          let newStatus: string;
          if (newPaid.lessThanOrEqualTo(0)) {
            newStatus = 'unpaid';
          } else if (newPaid.greaterThanOrEqualTo(total)) {
            newStatus = 'paid';
          } else {
            newStatus = 'partial';
          }

          invoiceUpdates.push({
            id: inv.id,
            amountPaid: newPaid.toNumber(),
            status: newStatus,
          });
          remaining = remaining.minus(clawback);
        }

        if (invoiceUpdates.length > 0) {
          const ids = invoiceUpdates.map(inv => inv.id);
          const sqlIds = sql.join(ids.map(id => sql`${id}`), sql`, `);

          const amountPaidCases = sql.join(
            invoiceUpdates.map(inv => sql`WHEN id = ${inv.id} THEN ${inv.amountPaid}::numeric`),
            sql` `
          );

          const statusCases = sql.join(
            invoiceUpdates.map(inv => sql`WHEN id = ${inv.id} THEN ${inv.status}::text`),
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

      await tx.update(khataTransactions)
        .set({ status: 'cancelled' })
        .where(eq(khataTransactions.id, id));
    });

    revalidateLocalizedPaths(['/dashboard/khata', '/dashboard']);
    return { success: true };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to cancel transaction") };
  }
}

export async function recalculateCustomerBalance(customerId: string) {
  try {
    const session = await requireBusinessSession();

    const calculatedBalance = await db.transaction(async (tx) => {
      
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

      const transactions: KhataTransactionRow[] = allTransactions.filter((t) => t.status !== 'cancelled');

      let balance = new Decimal(0);
      for (const t of transactions) {
        if (t.type === 'credit') {
          balance = balance.plus(Number(t.amount) || 0);
        } else {
          balance = balance.minus(Number(t.amount) || 0);
        }
      }

      await tx.update(customers)
        .set({ currentBalance: balance.toDecimalPlaces(2).toNumber(), updatedAt: new Date() })
        .where(eq(customers.id, customerId));

      return balance.toDecimalPlaces(2).toNumber();
    });

    revalidateLocalizedPaths(['/dashboard/khata', '/dashboard/customers', '/dashboard']);
    return { success: true, newBalance: calculatedBalance };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to recalculate balance") };
  }
}
