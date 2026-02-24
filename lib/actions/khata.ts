"use server";

import { db } from "@/lib/db";
import { khataTransactions, customers } from "@/lib/schema";
import { khataTransactionSchema, type KhataTransactionInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, sql } from "drizzle-orm";

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

    let query: any = db.query.khataTransactions.findMany({
      orderBy: (khataTransactions, { desc }) => [desc(khataTransactions.createdAt)],
    });

    let transactions = await query;

    transactions = transactions.filter((t: any) => 
      t.businessId === session.id && 
      (!customerId || t.customerId === customerId)
    );

    return { success: true, transactions };
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

    const transactions = await db.query.khataTransactions.findMany({
      where: eq(khataTransactions.customerId, customerId),
      orderBy: (khataTransactions, { asc }) => [asc(khataTransactions.createdAt)],
    });

    let runningBalance = 0;
    const statement = transactions.map(t => {
      runningBalance += t.type === 'credit' ? t.amount : -t.amount;
      return {
        ...t,
        runningBalance,
      };
    });

    return {
      success: true,
      customer,
      statement,
      currentBalance: customer.currentBalance,
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
