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

  const existingBusiness = await db.query.businesses.findFirst({
    where: eq(businesses.email, data.email),
  });

  if (existingBusiness) {
    return { error: "Email already registered" };
  }

  const passwordHash = await hash(data.password, 12);

  const [business] = await db.insert(businesses).values({
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    passwordHash,
    gstin: data.gstin || null,
    phone: data.phone || null,
    address: data.address || null,
    state: data.state || "",
    pincode: data.pincode || null,
  }).returning();

  return { success: true, businessId: business.id };
}
