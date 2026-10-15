"use server";

import { db } from "@/lib/db";
import { businesses, verificationTokens } from "@/lib/schema";
import { eq, and, gt, or } from "drizzle-orm";
import { serializeError } from "@/lib/errors";
import { hashToken } from "@/lib/token";

export async function verifyEmail(token: string) {
  try {
    const consumed = await db.transaction(async (tx) => {
      const tokenHash = hashToken(token);
      const [entry] = await tx.select()
        .from(verificationTokens)
        .where(and(
          or(eq(verificationTokens.token, tokenHash), eq(verificationTokens.token, token)),
          eq(verificationTokens.purpose, "email_verification"),
          gt(verificationTokens.expires, new Date()),
        ))
        .limit(1);

      if (!entry) return false;

      const [updatedBusiness] = await tx.update(businesses)
        .set({ emailVerified: new Date(), updatedAt: new Date() })
        .where(eq(businesses.email, entry.identifier))
        .returning({ id: businesses.id });

      if (!updatedBusiness) return false;

      await tx.delete(verificationTokens)
        .where(and(
          eq(verificationTokens.token, entry.token),
          eq(verificationTokens.purpose, "email_verification"),
        ));
      return true;
    });

    if (!consumed) {
      return { error: "Invalid or expired verification link." };
    }

    return { success: true };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}
