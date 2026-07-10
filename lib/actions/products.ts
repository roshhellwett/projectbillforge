"use server";

import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { productSchema, type ProductInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, sql, and, desc, ilike } from "drizzle-orm";
import { revalidateLocalizedPaths } from "@/lib/revalidate";
import { checkActionRateLimit } from "@/lib/rate-limit";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function createProduct(data: ProductInput) {
  try {
    const session = await requireBusinessSession();

    const rateCheck = await checkActionRateLimit(session.id, 'createProduct', 20, '60 s');
    if (!rateCheck.success) return { error: "Too many requests. Please try again later." };

    const validation = productSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    
    const stockQty = data.stockQuantity ?? 0;
    const threshold = data.lowStockThreshold ?? 0;
    if (stockQty > 0 && threshold >= stockQty) {
      return { error: "Low stock threshold must be less than the stock quantity." };
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
    return { error: errorMessage(error, "Failed to create product") };
  }
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  try {
    const session = await requireBusinessSession();

    const validation = productSchema.partial().safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    
    if (data.stockQuantity !== undefined && data.lowStockThreshold !== undefined) {
      if (data.stockQuantity > 0 && data.lowStockThreshold >= data.stockQuantity) {
        return { error: "Low stock threshold must be less than the stock quantity." };
      }
    } else if (data.stockQuantity !== undefined || data.lowStockThreshold !== undefined) {
      
      const existing = await db.query.products.findFirst({
        where: and(eq(products.id, id), eq(products.businessId, session.id)),
      });
      if (!existing) {
        return { error: "Product not found" };
      }
      const finalStock = data.stockQuantity ?? (existing.stockQuantity ?? 0);
      const finalThreshold = data.lowStockThreshold ?? (existing.lowStockThreshold ?? 0);
      if (finalStock > 0 && finalThreshold >= finalStock) {
        return { error: "Low stock threshold must be less than the stock quantity." };
      }
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
      metadata?: Record<string, unknown>;
    } = { updatedAt: new Date() };
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.sku !== undefined) updateFields.sku = data.sku ?? null;
    if (data.hsnCode !== undefined) updateFields.hsnCode = data.hsnCode ?? null;
    if (data.unit !== undefined) updateFields.unit = data.unit;
    if (data.rate !== undefined) updateFields.rate = data.rate;
    if (data.gstRate !== undefined) updateFields.gstRate = data.gstRate;
    if (data.stockQuantity !== undefined) updateFields.stockQuantity = data.stockQuantity;
    if (data.lowStockThreshold !== undefined) updateFields.lowStockThreshold = data.lowStockThreshold;

    const [product] = await db.update(products)
      .set(updateFields)
      .where(and(eq(products.id, id), eq(products.businessId, session.id)))
      .returning();

    revalidateLocalizedPaths(['/dashboard/products', '/dashboard']);
    return { success: true, product };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to update product") };
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

    await db.delete(products)
      .where(and(eq(products.id, id), eq(products.businessId, session.id)));

    revalidateLocalizedPaths(['/dashboard/products', '/dashboard']);
    return { success: true };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to delete product") };
  }
}

export async function getProducts(limit = 50, offset = 0) {
  limit = Math.max(1, Math.min(limit, 200));
  offset = Math.max(0, offset);
  try {
    const session = await requireBusinessSession();

    const productList = await db.query.products.findMany({
      where: eq(products.businessId, session.id),
      orderBy: [desc(products.createdAt)],
      limit,
      offset,
    });

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.businessId, session.id));

    return { success: true, products: productList, total: Number(countResult.count) };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to fetch products") };
  }
}

export async function searchProducts(search: string, limit = 15) {
  limit = Math.max(1, Math.min(limit, 50));
  try {
    const session = await requireBusinessSession();
    const results = await db.query.products.findMany({
      where: and(
        eq(products.businessId, session.id),
        eq(products.isActive, true),
        ilike(products.name, `%${search}%`),
      ),
      orderBy: [desc(products.createdAt)],
      limit,
    });
    return { success: true, products: results };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to search products") };
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
    return { error: errorMessage(error, "Failed to fetch low stock products") };
  }
}
