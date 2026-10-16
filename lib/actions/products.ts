"use server";

import { db } from "@/lib/db";
import { invoices, products } from "@/lib/schema";
import { productSchema, type ProductInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, sql, and, desc, ilike, or } from "drizzle-orm";
import { revalidateLocalizedPaths } from "@/lib/revalidate";
import { checkActionRateLimit } from "@/lib/rate-limit";
import { serializeError } from "@/lib/errors";

export async function createProduct(data: ProductInput) {
  try {
    const session = await requireBusinessSession();

    const rateCheck = await checkActionRateLimit(session.id, 'createProduct', 20, '60 s');
    if (!rateCheck.success) return { error: "Too many requests. Please try again later." };

    const validation = productSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const [product] = await db.insert(products).values({
      id: crypto.randomUUID(),
      businessId: session.id,
      name: data.name,
      sku: data.sku || null,
      hsnCode: data.hsnCode || null,
      unit: data.unit,
      rate: data.rate,
      gstRate: data.gstRate,
      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold,
      metadata: data.metadata || null,
      isActive: true,
    }).returning();

    revalidateLocalizedPaths(['/dashboard/products', '/dashboard']);
    return { success: true, product };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  try {
    const session = await requireBusinessSession();

    const validation = productSchema.partial().safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const existingProduct = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.businessId, session.id)),
    });
    if (!existingProduct) {
      return { error: "Product not found" };
    }

    const updateFields: {
      updatedAt: Date;
      name?: string;
      sku?: string | null;
      hsnCode?: string | null;
      unit?: string;
      rate?: number;
      gstRate?: number;
      stockQuantity?: number;
      lowStockThreshold?: number;
      metadata?: Record<string, unknown> | null;
    } = { updatedAt: new Date() };
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.sku !== undefined) updateFields.sku = data.sku ?? null;
    if (data.hsnCode !== undefined) updateFields.hsnCode = data.hsnCode ?? null;
    if (data.unit !== undefined) updateFields.unit = data.unit;
    if (data.rate !== undefined) updateFields.rate = data.rate;
    if (data.gstRate !== undefined) updateFields.gstRate = data.gstRate;
    if (data.stockQuantity !== undefined) updateFields.stockQuantity = data.stockQuantity;
    if (data.lowStockThreshold !== undefined) updateFields.lowStockThreshold = data.lowStockThreshold;
    if (data.metadata !== undefined) updateFields.metadata = data.metadata ?? null;

    const [product] = await db.update(products)
      .set(updateFields)
      .where(and(eq(products.id, id), eq(products.businessId, session.id)))
      .returning();

    revalidateLocalizedPaths(['/dashboard/products', '/dashboard']);
    return { success: true, product };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await requireBusinessSession();

    
    const existingProduct = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.businessId, session.id)),
    });
    if (!existingProduct) {
      return { error: "Product not found" };
    }

    const [invoiceHistory] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(invoices)
      .where(and(
        eq(invoices.businessId, session.id),
        sql`${invoices.items} @> ${JSON.stringify([{ productId: id }])}::jsonb`,
      ));
    if (Number(invoiceHistory?.count ?? 0) > 0) {
      return { error: "Cannot delete a product used on an invoice. Keep it in the catalog for audit history." };
    }

    await db.delete(products)
      .where(and(eq(products.id, id), eq(products.businessId, session.id)));

    revalidateLocalizedPaths(['/dashboard/products', '/dashboard']);
    return { success: true };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}

export async function getProducts(limit = 50, offset = 0, search = "") {
  limit = Math.max(1, Math.min(limit, 200));
  offset = Math.max(0, offset);
  try {
    const session = await requireBusinessSession();
    const normalizedSearch = search.trim().slice(0, 100).replace(/[\\%_]/g, "\\$&");
    const whereClause = normalizedSearch
      ? and(
          eq(products.businessId, session.id),
          or(
            ilike(products.name, `%${normalizedSearch}%`),
            ilike(products.sku, `%${normalizedSearch}%`),
            ilike(products.hsnCode, `%${normalizedSearch}%`),
            ilike(products.unit, `%${normalizedSearch}%`),
          ),
        )
      : eq(products.businessId, session.id);

    const [productList, [countResult], [lowStockCountResult]] = await Promise.all([
      db.query.products.findMany({
        where: whereClause,
        orderBy: [desc(products.createdAt), desc(products.id)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`COUNT(*)` })
        .from(products)
        .where(whereClause),
      db.select({ count: sql<number>`COUNT(*)` })
        .from(products)
        .where(and(
          whereClause,
          eq(products.isActive, true),
          sql`${products.lowStockThreshold} > 0`,
          sql`${products.stockQuantity} <= ${products.lowStockThreshold}`,
        )),
    ]);

    return {
      success: true,
      products: productList,
      total: Number(countResult.count),
      totalLowStock: Number(lowStockCountResult.count),
    };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}

export async function searchProducts(search: string, limit = 15) {
  limit = Math.max(1, Math.min(limit, 50));
  try {
    const session = await requireBusinessSession();
    const normalizedSearch = search.trim().slice(0, 100).replace(/[\\%_]/g, "\\$&");
    const results = await db.query.products.findMany({
      where: and(
        eq(products.businessId, session.id),
        eq(products.isActive, true),
        or(
          ilike(products.name, `%${normalizedSearch}%`),
          ilike(products.sku, `%${normalizedSearch}%`),
          ilike(products.hsnCode, `%${normalizedSearch}%`),
          ilike(products.unit, `%${normalizedSearch}%`),
        ),
      ),
      orderBy: [desc(products.createdAt), desc(products.id)],
      limit,
    });
    return { success: true, products: results };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}


export async function getLowStockProducts() {
  try {
    const session = await requireBusinessSession();

    const lowStock = await db
      .select()
      .from(products)
      .where(
        sql`${products.businessId} = ${session.id} AND ${products.isActive} = true AND ${products.lowStockThreshold} > 0 AND ${products.stockQuantity} <= ${products.lowStockThreshold}`
      )
      .limit(10);

    return { success: true, products: lowStock };
  } catch (error: unknown) {
    return { error: serializeError(error).error };
  }
}
