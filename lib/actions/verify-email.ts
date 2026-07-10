"use server";

import { db } from "@/lib/db";
import { businesses, verificationTokens } from "@/lib/schema";
import { eq, and, gt } from "drizzle-orm";

export async function verifyEmail(token: string) {
  try {
    const [entry] = await db.select()
      .from(verificationTokens)
      .where(and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date()),
      ))
      .limit(1);

    if (!entry) {
      return { error: "Invalid or expired verification link." };
    }

    await db.update(businesses)
      .set({ emailVerified: new Date() })
      .where(eq(businesses.email, entry.identifier));

    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Verification failed" };
  }
}