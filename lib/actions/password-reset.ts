"use server";

import { hash, compare } from "bcryptjs";
import { db } from "@/lib/db";
import { businesses, verificationTokens } from "@/lib/schema";
import { eq, and, gt } from "drizzle-orm";
import { checkActionRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { sendEmail, passwordResetHtml } from "@/lib/email";

export async function requestPasswordReset(email: string, locale: string = "en") {
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipCheck = await checkActionRateLimit(`pwdreset:ip:${ip}`, 'pwdreset', 3, '3600 s');
    if (!ipCheck.success) {
      return { error: "Too many requests. Please try again later." };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailCheck = await checkActionRateLimit(normalizedEmail, 'pwdreset-email', 3, '3600 s');
    if (!emailCheck.success) {
      return { error: "Too many requests for this email. Please try again later." };
    }

    const existing = await db.query.businesses.findFirst({
      where: eq(businesses.email, normalizedEmail),
    });

    if (!existing || !existing.passwordHash) {
      return { success: true };
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(verificationTokens).values({
      identifier: normalizedEmail,
      token,
      expires,
    });

    const { subject, html } = passwordResetHtml(token, locale);
    await sendEmail({ to: normalizedEmail, subject, html });

    return { success: true };
  } catch (error: unknown) {
    console.error("requestPasswordReset error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (newPassword.length < 8) return { error: "Password must be at least 8 characters." };
    if (!/[A-Z]/.test(newPassword)) return { error: "Password must contain at least one uppercase letter." };
    if (!/[a-z]/.test(newPassword)) return { error: "Password must contain at least one lowercase letter." };
    if (!/[0-9]/.test(newPassword)) return { error: "Password must contain at least one number." };

    const [entry] = await db.select()
      .from(verificationTokens)
      .where(and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date()),
      ))
      .limit(1);

    if (!entry) {
      return { error: "Invalid or expired reset link." };
    }

    const passwordHash = await hash(newPassword, 12);
    await db.update(businesses)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(businesses.email, entry.identifier));

    await db.delete(verificationTokens)
      .where(eq(verificationTokens.token, token));

    return { success: true };
  } catch (error: unknown) {
    console.error("resetPassword error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}