"use server";

import { db } from "@/lib/db";
import { businesses, customers, invoices, khataTransactions } from "@/lib/schema";
import { businessProfileSchema } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { revalidateLocalizedPaths } from "@/lib/revalidate";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

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
    return { error: errorMessage(error, "Failed to fetch business profile") };
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
    return { error: errorMessage(error, "Failed to update business profile") };
  }
}


export async function resetAllKhataData(password: string) {
  try {
    const session = await requireBusinessSession();
    const businessId = session.id;

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
    });

    if (!business || !business.passwordHash) {
      return { error: "Unable to verify credentials" };
    }

    const isValidPassword = await compare(password, business.passwordHash);
    if (!isValidPassword) {
      return { error: "Incorrect password" };
    }

    await db.transaction(async (tx) => {
      // Soft-delete: mark all khata transactions as cancelled (never hard-delete financial records)
      await tx.update(khataTransactions)
        .set({ status: 'cancelled' })
        .where(eq(khataTransactions.businessId, businessId));

      // Soft-delete: mark all invoices as cancelled
      await tx.update(invoices)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(eq(invoices.businessId, businessId));

      // Zero out all customer balances
      await tx.update(customers)
        .set({ currentBalance: 0, updatedAt: new Date() })
        .where(eq(customers.businessId, businessId));
    });

    revalidateLocalizedPaths([
      '/dashboard',
      '/dashboard/khata',
      '/dashboard/invoices',
      '/dashboard/customers',
      '/dashboard/products',
    ]);
    return { success: true, message: "All Khata data has been reset. All invoices and transactions marked as cancelled, balances zeroed." };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to reset Khata data") };
  }
}
