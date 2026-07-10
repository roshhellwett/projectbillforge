"use server";

import { hash, compare } from "bcryptjs";
import { db } from "@/lib/db";
import { businesses, verificationTokens } from "@/lib/schema";
import { businessRegisterSchema, type BusinessRegisterInput } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { checkActionRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { requireBusinessSession } from "@/lib/session";
import { sendEmail, verificationHtml } from "@/lib/email";

export async function registerBusiness(data: BusinessRegisterInput) {
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const emailCheck = await checkActionRateLimit(data.email, 'register', 3, '600 s');
    if (!emailCheck.success) return { error: "Too many attempts. Please try again later." };

    const ipCheck = await checkActionRateLimit(`ip:${ip}`, 'register-ip', 10, '3600 s');
    if (!ipCheck.success) return { error: "Too many attempts from this location. Please try again later." };

    const validation = businessRegisterSchema.safeParse(data);

    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const { honeypot, turnstileToken, ...safeData } = validation.data;

  
  if (honeypot && honeypot.length > 0) {
    
    return { error: "Registration failed or timed out. Please try again." };
  }

  
  
  if (!process.env.TURNSTILE_SECRET_KEY) {
    return { error: "Security is not configured. Please contact support." };
  }
  if (!turnstileToken) {
    return { error: "Please complete the security check to continue." };
  }
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${encodeURIComponent(process.env.TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(turnstileToken)}`,
    });
    const outcome = await res.json();
    if (!outcome.success) {
      return { error: "Security check failed. Please refresh and try again." };
    }
  } catch (e) {
    console.error("Turnstile verification error:", e);
    return { error: "Unable to verify security challenge at this time." };
  }

  const existingBusiness = await db.query.businesses.findFirst({
    where: eq(businesses.email, safeData.email),
  });

  if (existingBusiness) {
    return { success: true, exists: true };
  }

  const passwordHash = await hash(safeData.password, 12);

  const [business] = await db.insert(businesses).values({
    id: crypto.randomUUID(),
    name: safeData.name,
    email: safeData.email,
    passwordHash,
    gstin: safeData.gstin || null,
    phone: safeData.phone || null,
    address: safeData.address || null,
    state: safeData.state || "",
    pincode: safeData.pincode || null,
  }).returning();

  const token = crypto.randomUUID();
  await db.insert(verificationTokens).values({
    identifier: safeData.email,
    token,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  const { subject, html } = verificationHtml(token);
  await sendEmail({ to: safeData.email, subject, html });

  return { success: true, businessId: business.id };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Registration failed" };
  }
}

export async function changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  try {
    const session = await requireBusinessSession();

    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      return { error: "All fields are required." };
    }
    if (data.newPassword !== data.confirmPassword) {
      return { error: "Passwords don't match." };
    }
    if (data.newPassword.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }
    if (!/[A-Z]/.test(data.newPassword)) {
      return { error: "Password must contain at least one uppercase letter." };
    }
    if (!/[a-z]/.test(data.newPassword)) {
      return { error: "Password must contain at least one lowercase letter." };
    }
    if (!/[0-9]/.test(data.newPassword)) {
      return { error: "Password must contain at least one number." };
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, session.id),
    });
    if (!business || !business.passwordHash) {
      return { error: "Cannot change password for this account." };
    }

    const isValid = await compare(data.currentPassword, business.passwordHash);
    if (!isValid) {
      return { error: "Current password is incorrect." };
    }

    const passwordHash = await hash(data.newPassword, 12);
    await db.update(businesses)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(businesses.id, session.id));

    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Failed to change password" };
  }
}
