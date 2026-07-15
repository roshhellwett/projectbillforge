"use server";

import { db } from "@/lib/db";
import { customers, khataTransactions, invoices } from "@/lib/schema";
import { customerSchema, type CustomerInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, and, desc, sql, gt } from "drizzle-orm";
import { revalidateLocalizedPaths } from "@/lib/revalidate";
import { checkActionRateLimit } from "@/lib/rate-limit";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function createCustomer(data: CustomerInput) {
  try {
    const session = await requireBusinessSession();

    const rateCheck = await checkActionRateLimit(session.id, 'createCustomer', 20, '60 s');
    if (!rateCheck.success) return { error: "Too many requests. Please try again later." };

    const validation = customerSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const [customer] = await db.insert(customers).values({
      id: crypto.randomUUID(),
      businessId: session.id,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      gstin: data.gstin || null,
      address: data.address,
      creditLimit: data.creditLimit,
      currentBalance: 0,
    }).returning();

    revalidateLocalizedPaths(['/dashboard/customers', '/dashboard/khata']);
    return { success: true, customer };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to create customer") };
  }
}

export async function updateCustomer(id: string, data: Partial<CustomerInput>) {
  try {
    const session = await requireBusinessSession();

    const validation = customerSchema.partial().safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const existingCustomer = await db.query.customers.findFirst({
      where: and(eq(customers.id, id), eq(customers.businessId, session.id)),
    });

    if (!existingCustomer) {
      return { error: "Customer not found" };
    }

    const updateFields: {
      updatedAt: Date;
      name?: string;
      phone?: string | null;
      email?: string | null;
      gstin?: string | null;
      address?: string | null;
      creditLimit?: number;
    } = { updatedAt: new Date() };
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.phone !== undefined) updateFields.phone = data.phone;
    if ('email' in data) updateFields.email = data.email ?? null;
    if ('gstin' in data) updateFields.gstin = data.gstin ?? null;
    if (data.address !== undefined) updateFields.address = data.address;
    if (data.creditLimit !== undefined) updateFields.creditLimit = data.creditLimit;

    const [customer] = await db.update(customers)
      .set(updateFields)
      .where(and(eq(customers.id, id), eq(customers.businessId, session.id)))
      .returning();

    revalidateLocalizedPaths(['/dashboard/customers', '/dashboard/khata']);
    return { success: true, customer };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to update customer") };
  }
}

export async function deleteCustomer(id: string) {
  try {
    const session = await requireBusinessSession();

    const [customer] = await db.select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.businessId, session.id)))
      .limit(1);

    if (!customer) {
      return { error: "Customer not found" };
    }

    const currentBalance = Number(customer.currentBalance ?? 0);
    if (Math.abs(currentBalance) > 0.01) {
      return { error: "Action blocked: Cannot delete customer with a non-zero Khata balance. Please settle dues first." };
    }

    const [[invoiceHistory], [khataHistory]] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` })
        .from(invoices)
        .where(and(eq(invoices.customerId, id), eq(invoices.businessId, session.id))),
      db.select({ count: sql<number>`COUNT(*)` })
        .from(khataTransactions)
        .where(and(eq(khataTransactions.customerId, id), eq(khataTransactions.businessId, session.id))),
    ]);

    if (Number(invoiceHistory?.count ?? 0) > 0 || Number(khataHistory?.count ?? 0) > 0) {
      return { error: "Cannot delete customer with invoice or Khata history. Keep the customer for audit records." };
    }

    await db.delete(customers)
      .where(and(eq(customers.id, id), eq(customers.businessId, session.id)));

    revalidateLocalizedPaths(['/dashboard/customers', '/dashboard/khata']);
    return { success: true };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to delete customer") };
  }
}

export async function getCustomers(limit = 50, offset = 0) {
  limit = Math.max(1, Math.min(limit, 200));
  offset = Math.max(0, offset);
  try {
    const session = await requireBusinessSession();

    const [customerList, [countResult]] = await Promise.all([
      db.query.customers.findMany({
        where: eq(customers.businessId, session.id),
        orderBy: [desc(customers.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`COUNT(*)` })
        .from(customers)
        .where(eq(customers.businessId, session.id)),
    ]);

    return { success: true, customers: customerList, total: Number(countResult.count) };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to fetch customers") };
  }
}

export async function getTopReceivables(limit = 5) {
  try {
    const session = await requireBusinessSession();
    const rows = await db
      .select({ id: customers.id, name: customers.name, currentBalance: customers.currentBalance })
      .from(customers)
      .where(and(eq(customers.businessId, session.id), gt(customers.currentBalance, 0)))
      .orderBy(desc(customers.currentBalance))
      .limit(limit);
    return { success: true, customers: rows };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to fetch top receivables") };
  }
}
