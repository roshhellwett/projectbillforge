"use server";

import { db } from "@/lib/db";
import { customers, khataTransactions, invoices } from "@/lib/schema";
import { customerSchema, type CustomerInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidateLocalizedPaths } from "@/lib/revalidate";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function createCustomer(data: CustomerInput) {
  try {
    const session = await requireBusinessSession();

    const validation = customerSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const [customer] = await db.insert(customers).values({
      id: crypto.randomUUID(),
      businessId: session.id,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      gstin: data.gstin || null,
      address: data.address || null,
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

    const [customer] = await db.update(customers)
      .set({ ...data, updatedAt: new Date() })
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
    if (Math.abs(currentBalance) > 0.0049) {
      return { error: "Action blocked: Cannot delete customer with a non-zero Khata balance. Please settle dues first." };
    }

    const [invoiceHistory] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(invoices)
      .where(and(eq(invoices.customerId, id), eq(invoices.businessId, session.id)));

    const [khataHistory] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(khataTransactions)
      .where(and(eq(khataTransactions.customerId, id), eq(khataTransactions.businessId, session.id)));

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

export async function getCustomers() {
  try {
    const session = await requireBusinessSession();

    const customerList = await db.query.customers.findMany({
      where: eq(customers.businessId, session.id),
      orderBy: [desc(customers.createdAt)],
    });

    return { success: true, customers: customerList };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to fetch customers") };
  }
}
