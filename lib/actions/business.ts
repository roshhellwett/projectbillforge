"use server";

import { db } from "@/lib/db";
import { businesses, customers, invoices, khataTransactions } from "@/lib/schema";
import { requireBusinessSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { revalidatePath } from "next/cache";

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
  } catch (error: any) {
    return { error: error.message || "Failed to fetch business profile" };
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

    const updateData: any = { updatedAt: new Date() };
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

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/invoices');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update business profile" };
  }
}

export async function checkBusinessProfileComplete() {
  try {
    const session = await requireBusinessSession();

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, session.id),
    });

    if (!business) {
      return { complete: false, reason: "Business not found" };
    }

    const isComplete = !!(business.name && business.address && business.phone);

    return { complete: isComplete, business };
  } catch (error: any) {
    return { complete: false, reason: error.message };
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

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/khata');
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard/products');
    return { success: true, message: "All Khata data has been reset. All invoices and transactions marked as cancelled, balances zeroed." };
  } catch (error: any) {
    return { error: error.message || "Failed to reset Khata data" };
  }
}
