"use server";

import { db } from "@/lib/db";
import { businesses, customers, invoices, khataResets } from "@/lib/schema";
import { businessProfileSchema } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, sql } from "drizzle-orm";
import { revalidateLocalizedPaths, revalidateDashboardCache } from "@/lib/revalidate";
import { serializeError } from "@/lib/errors";
import { assertCustomerBalanceConsistent, assertNoOverpaidInvoices } from "@/lib/balance-invariants";
import { checkActionRateLimit } from "@/lib/rate-limit";

export async function getBusinessProfile() {
  try {
    const session = await requireBusinessSession();

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, session.id),
      columns: {
        name: true,
        gstin: true,
        address: true,
        phone: true,
        state: true,
        pincode: true,
        industryType: true,
        termsAndConditions: true,
        redemptionPeriodDays: true,
        finePercentage: true,
        fineFrequencyDays: true,
        passwordHash: true,
      },
    });

    if (!business) {
      return { error: "Business not found" };
    }

    const { passwordHash, ...safeBusiness } = business;
    return { success: true, business: safeBusiness, hasPassword: Boolean(passwordHash) };
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
        COUNT(*)::int as customer_count,
        COALESCE(SUM(c.current_balance), 0) as total_balance,
        (
          SELECT COUNT(*)::int
          FROM invoices i
          WHERE i.business_id = ${session.id}
             AND i.customer_id IS NOT NULL
             AND i.status = 'active'
             AND i.payment_mode = 'khata'
        ) as invoice_count
      FROM customers c
      WHERE c.business_id = ${session.id}
        AND (
          ABS(COALESCE(c.current_balance, 0)) >= 0.01
          OR EXISTS (
            SELECT 1
            FROM invoices i
            WHERE i.customer_id = c.id
              AND i.business_id = ${session.id}
              AND i.status = 'active'
              AND i.payment_mode = 'khata'
            )
            OR EXISTS (
              SELECT 1
              FROM khata_transactions t
              WHERE t.customer_id = c.id
                AND t.business_id = ${session.id}
                AND t.status = 'active'
            )
        )
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

    const rateCheck = await checkActionRateLimit(session.id, "resetAllKhataData", 2, "10 m");
    if (!rateCheck.success) return { error: "Too many requests. Please try again later." };

    const result = await db.transaction(async (tx) => {
      const customerRows = await tx.execute(
        sql`SELECT id, current_balance, business_id FROM customers WHERE business_id = ${session.id} FOR UPDATE`
      ) as unknown as { id: string; current_balance: number | null; business_id: string }[];

      let totalCustomers = 0, totalInvoices = 0, totalBalance = 0;

      for (const customer of customerRows) {
        const [countResult] = await tx.execute(
          sql`SELECT COUNT(*)::int as cnt FROM invoices WHERE customer_id = ${customer.id} AND business_id = ${session.id} AND status = 'active' AND payment_mode = 'khata'`
        ) as unknown as { cnt: number }[];

        const [transactionResult] = await tx.execute(
          sql`SELECT COUNT(*)::int as cnt FROM khata_transactions WHERE customer_id = ${customer.id} AND business_id = ${session.id} AND status = 'active'`
        ) as unknown as { cnt: number }[];

        const invoiceCount = Number(countResult?.cnt ?? 0);
        const transactionCount = Number(transactionResult?.cnt ?? 0);
        const currentBalance = Number(customer.current_balance || 0);
        if (invoiceCount === 0 && transactionCount === 0 && Math.abs(currentBalance) < 0.01) continue;

        await tx.execute(
          sql`UPDATE invoices
              SET status = 'archived', updated_at = NOW()
              WHERE customer_id = ${customer.id}
                AND business_id = ${session.id}
                AND status = 'active'
                AND payment_mode = 'khata'`
        );

        await tx.execute(
          sql`UPDATE khata_transactions
              SET status = 'cancelled'
              WHERE customer_id = ${customer.id}
                AND business_id = ${session.id}
                AND status = 'active'`
        );

        await tx.execute(
          sql`UPDATE customers
              SET current_balance = 0, updated_at = NOW()
              WHERE id = ${customer.id} AND business_id = ${session.id}`
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

        await assertCustomerBalanceConsistent(tx, customer.id);
        await assertNoOverpaidInvoices(tx, customer.id);
      }

      return { totalCustomers, totalInvoices, totalBalance };
    });

    revalidateLocalizedPaths([
      '/dashboard',
      '/dashboard/khata',
      '/dashboard/invoices',
      '/dashboard/customers',
      '/dashboard/products',
      '/dashboard/reports',
    ]);
    revalidateDashboardCache(session.id);
    return { success: true, ...result };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}
