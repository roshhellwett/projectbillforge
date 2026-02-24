"use server";

import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { productSchema, type ProductInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProduct(data: ProductInput) {
  try {
    const session = await requireBusinessSession();
    
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
      isActive: true,
    }).returning();

    revalidatePath('/dashboard/products');
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

    const [product] = await db.update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    if (!product || product.businessId !== session.id) {
      return { error: "Product not found" };
    }

    revalidatePath('/dashboard/products');
    return { success: true, product };
  } catch (error: any) {
    return { error: error.message || "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await requireBusinessSession();

    const [product] = await db.delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!product || product.businessId !== session.id) {
      return { error: "Product not found" };
    }

    revalidatePath('/dashboard/products');
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

export async function getProductById(id: string) {
  try {
    const session = await requireBusinessSession();

    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!product || product.businessId !== session.id) {
      return { error: "Product not found" };
    }

    return { success: true, product };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch product" };
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
