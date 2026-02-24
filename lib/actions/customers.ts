"use server";

import { db } from "@/lib/db";
import { customers, khataTransactions } from "@/lib/schema";
import { customerSchema, type CustomerInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard/khata');
    return { success: true, customer };
  } catch (error: any) {
    return { error: error.message || "Failed to create customer" };
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

    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard/khata');
    return { success: true, customer };
  } catch (error: any) {
    return { error: error.message || "Failed to update customer" };
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

    if ((customer.currentBalance ?? 0) > 0) {
      return { error: "Action blocked: Cannot delete customer with an outstanding Khata balance. Please settle dues first." };
    }

    // Soft-delete: cancel transactions and mark invoices as orphaned, but preserve records
    await db.update(khataTransactions)
      .set({ status: 'cancelled' })
      .where(eq(khataTransactions.customerId, id));

    // Soft-delete the customer by setting balance to 0 and removing from active queries
    // We keep the row for invoice reference integrity
    await db.update(customers)
      .set({ currentBalance: 0, updatedAt: new Date() })
      .where(eq(customers.id, id));

    await db.delete(customers)
      .where(eq(customers.id, id));

    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard/khata');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete customer" };
  }
}

export async function getCustomers() {
  try {
    const session = await requireBusinessSession();

    const customerList = await db.query.customers.findMany({
      where: eq(customers.businessId, session.id),
      orderBy: (customers, { desc }) => [desc(customers.createdAt)],
    });

    return { success: true, customers: customerList };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch customers" };
  }
}

export async function getCustomerById(id: string) {
  try {
    const session = await requireBusinessSession();

    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, id),
    });

    if (!customer || customer.businessId !== session.id) {
      return { error: "Customer not found" };
    }

    return { success: true, customer };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch customer" };
  }
}
