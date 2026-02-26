"use server";

import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { productSchema, type ProductInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProduct(data: ProductInput) {
  try {
    const session = await requireBusinessSession();

    const validation = productSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    // Server-side validation: threshold must be strictly less than stock
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
      isActive: true,
    }).returning();

    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { success: true, product };
  } catch (error: any) {
    return { error: error.message || "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  try {
    const session = await requireBusinessSession();

    const validation = productSchema.partial().safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    // Server-side validation: if both stock and threshold are provided, check the constraint
    if (data.stockQuantity !== undefined && data.lowStockThreshold !== undefined) {
      if (data.stockQuantity > 0 && data.lowStockThreshold >= data.stockQuantity) {
        return { error: "Low stock threshold must be less than the stock quantity." };
      }
    } else if (data.stockQuantity !== undefined || data.lowStockThreshold !== undefined) {
      // One field provided without the other: fetch existing to validate
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

    // Verify ownership before update
    const existingProduct = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.businessId, session.id)),
    });
    if (!existingProduct) {
      return { error: "Product not found" };
    }

    const [product] = await db.update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.businessId, session.id)))
      .returning();

    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { success: true, product };
  } catch (error: any) {
    return { error: error.message || "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await requireBusinessSession();

    // Verify ownership before delete
    const existingProduct = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.businessId, session.id)),
    });
    if (!existingProduct) {
      return { error: "Product not found" };
    }

    const [product] = await db.delete(products)
      .where(and(eq(products.id, id), eq(products.businessId, session.id)))
      .returning();

    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete product" };
  }
}

export async function getProducts() {
  try {
    const session = await requireBusinessSession();

    const productList = await db.query.products.findMany({
      where: eq(products.businessId, session.id),
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    });

    return { success: true, products: productList };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch products" };
  }
}


export async function getLowStockProducts() {
  try {
    const session = await requireBusinessSession();

    const lowStock = await db
      .select()
      .from(products)
      .where(
        sql`${products.businessId} = ${session.id} AND ${products.isActive} = true AND ${products.stockQuantity} <= ${products.lowStockThreshold}`
      );

    return { success: true, products: lowStock };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch low stock products" };
  }
}
