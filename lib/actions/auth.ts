"use server";

import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { businesses } from "@/lib/schema";
import { businessRegisterSchema, type BusinessRegisterInput } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function registerBusiness(data: BusinessRegisterInput) {
  const validation = businessRegisterSchema.safeParse(data);

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { honeypot, turnstileToken, ...safeData } = validation.data;

  // 1. Honeypot check - if a bot filled the invisible field, silently reject
  if (honeypot && honeypot.length > 0) {
    // Return a generic error so bots don't know they triggered the honeypot
    return { error: "Registration failed or timed out. Please try again." };
  }

  // 2. Cloudflare Turnstile Verification
  // Only verify if the secret exists (allows local dev bypass if env is not set)
  if (process.env.TURNSTILE_SECRET_KEY && turnstileToken) {
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
  } else if (process.env.NODE_ENV === "production" && !turnstileToken) {
    return { error: "Please complete the security check to continue." };
  }

  const existingBusiness = await db.query.businesses.findFirst({
    where: eq(businesses.email, safeData.email),
  });

  if (existingBusiness) {
    return { error: "Email already registered" };
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

  return { success: true, businessId: business.id };
}
