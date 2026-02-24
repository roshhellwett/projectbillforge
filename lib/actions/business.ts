"use server";

import { db } from "@/lib/db";
import { businesses, customers, invoices, khataTransactions } from "@/lib/schema";
import { requireBusinessSession } from "@/lib/session";
import { eq } from "drizzle-orm";

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

export async function resetAllKhataData() {
  try {
    const session = await requireBusinessSession();
    const businessId = session.id;

    await db.transaction(async (tx) => {
      await tx.delete(khataTransactions)
        .where(eq(khataTransactions.businessId, businessId));
      
      await tx.delete(invoices)
        .where(eq(invoices.businessId, businessId));
      
      await tx.update(customers)
        .set({ currentBalance: 0 })
        .where(eq(customers.businessId, businessId));
    });

    return { success: true, message: "All Khata data has been reset. All invoices and transactions deleted." };
  } catch (error: any) {
    return { error: error.message || "Failed to reset Khata data" };
  }
}
