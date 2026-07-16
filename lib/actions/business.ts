"use server";

import { db } from "@/lib/db";
import { businesses, customers, invoices, khataResets } from "@/lib/schema";
import { businessProfileSchema } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, sql } from "drizzle-orm";
import { revalidateLocalizedPaths, revalidateDashboardCache } from "@/lib/revalidate";
import { serializeError } from "@/lib/errors";

export async function getBusinessProfile() {
  try {
    const session = await requireBusinessSession();

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, session.id),
    });

    if (!business) {
      return { error: "Business not found" };
    }

    return { success: true, business };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}

export async function updateBusinessProfile(data: {
  name?: string;
  gstin?: string | undefined;
  address?: string | undefined;
  phone?: string | undefined;
  state?: string;
  pincode?: string | undefined;
  termsAndConditions?: string | undefined;
  redemptionPeriodDays?: number;
  finePercentage?: number;
  fineFrequencyDays?: number;
  industryType?: "mobile" | "pharmacy" | "kirana" | "garments" | "electronics" | "custom";
}) {
  try {
    const session = await requireBusinessSession();

    const validation = businessProfileSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const updateData: {
      updatedAt: Date;
      name?: string;
      gstin?: string | null;
      address?: string | null;
      phone?: string | null;
      state?: string;
      pincode?: string | null;
      termsAndConditions?: string | null;
      redemptionPeriodDays?: number;
      finePercentage?: number;
      fineFrequencyDays?: number;
      industryType?: "mobile" | "pharmacy" | "kirana" | "garments" | "electronics" | "custom";
    } = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.gstin !== undefined) updateData.gstin = data.gstin || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.state !== undefined) updateData.state = data.state || '';
    if (data.pincode !== undefined) updateData.pincode = data.pincode || null;
    if (data.termsAndConditions !== undefined) updateData.termsAndConditions = data.termsAndConditions || null;
    if (data.redemptionPeriodDays !== undefined) updateData.redemptionPeriodDays = data.redemptionPeriodDays;
    if (data.finePercentage !== undefined) updateData.finePercentage = data.finePercentage;
    if (data.fineFrequencyDays !== undefined) updateData.fineFrequencyDays = data.fineFrequencyDays;
    if (data.industryType !== undefined) updateData.industryType = data.industryType;

    await db.update(businesses)
      .set(updateData)
      .where(eq(businesses.id, session.id));

    revalidateLocalizedPaths(['/dashboard/settings', '/dashboard', '/dashboard/invoices']);
    return { success: true };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}


export async function getResetAllKhataSummary() {
  try {
    const session = await requireBusinessSession();
    const [result] = await db.execute(sql`
      SELECT
        COUNT(DISTINCT c.id)::int as customer_count,
        COUNT(i.id)::int as invoice_count,
        COALESCE(SUM(c.current_balance), 0) as total_balance
      FROM customers c
      LEFT JOIN invoices i ON i.customer_id = c.id AND i.business_id = c.business_id AND i.status = 'active'
      WHERE c.business_id = ${session.id}
    `) as unknown as { customer_count: number; invoice_count: number; total_balance: number }[];
    return { success: true, ...result };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}

export async function resetAllKhataData(consentAccepted: boolean) {
  if (!consentAccepted) return { error: "You must accept the consent to reset all khata data" };
  try {
    const session = await requireBusinessSession();

    const result = await db.transaction(async (tx) => {
      const customerRows = await tx.execute(
        sql`SELECT id, current_balance, business_id FROM customers WHERE business_id = ${session.id} FOR UPDATE`
      ) as unknown as { id: string; current_balance: number | null; business_id: string }[];

      let totalCustomers = 0, totalInvoices = 0, totalBalance = 0;

      for (const customer of customerRows) {
        const [countResult] = await tx.execute(
          sql`SELECT COUNT(*)::int as cnt FROM invoices WHERE customer_id = ${customer.id} AND business_id = ${session.id} AND status = 'active'`
        ) as unknown as { cnt: number }[];

        const invoiceCount = Number(countResult?.cnt ?? 0);
        if (invoiceCount === 0) continue;

        const currentBalance = Number(customer.current_balance || 0);

        await tx.execute(
          sql`DELETE FROM invoices WHERE customer_id = ${customer.id} AND business_id = ${session.id} AND status = 'active'`
        );

        await tx.insert(khataResets).values({
          id: crypto.randomUUID(),
          businessId: session.id,
          customerId: customer.id,
          amountReset: currentBalance,
          invoiceCount,
          consentAccepted: true,
        });

        totalCustomers++;
        totalInvoices += invoiceCount;
        totalBalance += currentBalance;
      }

      return { totalCustomers, totalInvoices, totalBalance };
    });

    revalidateLocalizedPaths([
      '/dashboard',
      '/dashboard/khata',
      '/dashboard/invoices',
      '/dashboard/customers',
      '/dashboard/products',
    ]);
    revalidateDashboardCache(session.id);
    return { success: true, ...result };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}
