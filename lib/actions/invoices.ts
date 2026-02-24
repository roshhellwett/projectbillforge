"use server";

import { db } from "@/lib/db";
import { invoices, customers, products, khataTransactions, businesses } from "@/lib/schema";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, and, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const unique = crypto.randomUUID().split('-')[0];
  return `INV/${year}${month}/${unique}`;
}

function calculateGST(itemRate: number, quantity: number, gstRate: number, isInterState: boolean) {
  const amount = itemRate * quantity;
  const gstAmount = amount * (gstRate / 100);
  
  if (isInterState) {
    return {
      amount,
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
    };
  }
  
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  
  return {
    amount,
    cgst,
    sgst,
    igst: 0,
  };
}

export async function createInvoice(data: InvoiceInput) {
  try {
    const session = await requireBusinessSession();
    
    const validation = invoiceSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, session.id),
    });

    if (!business || !business.name || !business.address || !business.phone) {
      return { 
        error: "Please complete your business profile and address to generate valid invoices. Go to Settings to update.",
        redirectToSettings: true 
      };
    }

    const invoiceNumber = generateInvoiceNumber();
    const invoiceDate = data.invoiceDate;

    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const processedItems = data.items.map(item => {
      const gst = calculateGST(item.rate, item.quantity, item.gstRate, data.isInterState || false);
      subtotal += gst.amount;
      totalCgst += gst.cgst;
      totalSgst += gst.sgst;
      totalIgst += gst.igst;
      
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        rate: item.rate,
        gstRate: item.gstRate,
        amount: gst.amount,
        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
      };
    });

    const total = subtotal + totalCgst + totalSgst + totalIgst;
    const paymentMode = data.paymentMode || 'cash';
    const paymentStatus = paymentMode === 'khata' ? 'unpaid' : 'paid';

    const invoice = await db.transaction(async (tx) => {
      const [newInvoice] = await tx.insert(invoices).values({
        id: crypto.randomUUID(),
        businessId: session.id,
        invoiceNumber,
        customerId: data.customerId || null,
        customerName: data.customerName,
        customerGstin: data.customerGstin || null,
        customerAddress: data.customerAddress || null,
        invoiceDate,
        subtotal,
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        total,
        items: processedItems,
        notes: data.notes || null,
        paymentMode,
        paymentStatus,
        status: 'active',
      }).returning();

      for (const item of processedItems) {
        const productRows = await tx.execute(
          sql`SELECT id, name, stock_quantity FROM products WHERE id = ${item.productId} FOR UPDATE`
        ) as unknown as { id: string; name: string; stock_quantity: number | null }[];
        const product = productRows[0];
        if (!product) {
          throw new Error(`Product not found: ${item.productName}`);
        }
        if ((product.stock_quantity ?? 0) < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Required: ${item.quantity}`);
        }
        await tx.update(products)
          .set({
            stockQuantity: (product.stock_quantity ?? 0) - item.quantity,
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }

      if (data.customerId && paymentMode === 'khata') {
        const customerRows = await tx.execute(
          sql`SELECT id, business_id, current_balance, credit_limit FROM customers WHERE id = ${data.customerId} FOR UPDATE`
        ) as unknown as { id: string; business_id: string; current_balance: number | null; credit_limit: number | null }[];
        const customer = customerRows[0];
        if (!customer) {
          throw new Error("Customer not found");
        }
        if (customer.business_id !== session.id) {
          throw new Error("Customer does not belong to your business");
        }
        const newBalance = (customer.current_balance ?? 0) + total;
        const availableCredit = (customer.credit_limit ?? 0) - (customer.current_balance ?? 0);
        if ((customer.credit_limit ?? 0) > 0 && newBalance > customer.credit_limit!) {
          throw new Error(`Transaction exceeds customer credit limit. Credit Limit: ₹${customer.credit_limit}, Available: ₹${availableCredit}, Invoice Total: ₹${total}`);
        }
        await tx.update(customers)
          .set({
            currentBalance: newBalance,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, data.customerId));

        await tx.insert(khataTransactions).values({
          id: crypto.randomUUID(),
          businessId: session.id,
          customerId: data.customerId!,
          type: 'credit',
          amount: total,
          note: `Invoice ${invoiceNumber}`,
          referenceInvoiceId: newInvoice.id,
        });
      }

      return newInvoice;
    });

    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/khata');
    revalidatePath('/dashboard');
    return { success: true, invoice };
  } catch (error: any) {
    return { error: error.message || "Failed to create invoice" };
  }
}

export async function getInvoices() {
  try {
    const session = await requireBusinessSession();

    const invoiceList = await db.query.invoices.findMany({
      where: eq(invoices.businessId, session.id),
      orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
    });

    return { success: true, invoices: invoiceList };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch invoices" };
  }
}

export async function getInvoiceById(id: string) {
  try {
    const session = await requireBusinessSession();

    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, id),
    });

    if (!invoice || invoice.businessId !== session.id) {
      return { error: "Invoice not found" };
    }

    return { success: true, invoice };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch invoice" };
  }
}

export async function cancelInvoice(id: string) {
  try {
    const session = await requireBusinessSession();

    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, id),
    });

    if (!invoice || invoice.businessId !== session.id) {
      return { error: "Invoice not found" };
    }

    if (invoice.status === 'cancelled') {
      return { error: "Invoice already cancelled" };
    }

    await db.transaction(async (tx) => {
      await tx.update(invoices)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(eq(invoices.id, id));

      if (invoice.items) {
        for (const item of invoice.items) {
          const productRows = await tx.execute(
            sql`SELECT id, stock_quantity FROM products WHERE id = ${item.productId} FOR UPDATE`
          ) as unknown as { id: string; stock_quantity: number | null }[];
          const product = productRows[0];
          if (product) {
            await tx.update(products)
              .set({
                stockQuantity: (product.stock_quantity ?? 0) + item.quantity,
                updatedAt: new Date(),
              })
              .where(eq(products.id, item.productId));
          }
        }
      }

      if (invoice.customerId && invoice.paymentStatus === 'unpaid') {
        const customerRows = await tx.execute(
          sql`SELECT id, current_balance FROM customers WHERE id = ${invoice.customerId} FOR UPDATE`
        ) as unknown as { id: string; current_balance: number | null }[];
        const customer = customerRows[0];
        if (customer) {
          const newBalance = Math.max(0, (customer.current_balance ?? 0) - (invoice.total ?? 0));
          await tx.update(customers)
            .set({
              currentBalance: newBalance,
              updatedAt: new Date(),
            })
            .where(eq(customers.id, invoice.customerId));
        }

        await tx.insert(khataTransactions).values({
          id: crypto.randomUUID(),
          businessId: session.id,
          customerId: invoice.customerId,
          type: 'debit',
          amount: invoice.total ?? 0,
          note: `Invoice ${invoice.invoiceNumber} Cancelled - Reversal`,
          referenceInvoiceId: invoice.id,
        });
      }
    });

    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard/khata');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to cancel invoice" };
  }
}

export async function getSalesSummary() {
  try {
    const session = await requireBusinessSession();
    const businessId = session.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const [todaySalesResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.businessId, businessId),
          eq(invoices.status, 'active'),
          eq(invoices.paymentStatus, 'paid'),
          sql`${invoices.invoiceDate} >= ${todayStr}`
        )
      );

    const [totalSalesResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.businessId, businessId),
          eq(invoices.status, 'active'),
          eq(invoices.paymentStatus, 'paid')
        )
      );

    const [invoicesCountResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.businessId, businessId),
          eq(invoices.status, 'active')
        )
      );

    const [customersCountResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(customers)
      .where(eq(customers.businessId, businessId));

    const [receivableResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${customers.currentBalance}), 0)` })
      .from(customers)
      .where(
        and(
          eq(customers.businessId, businessId),
          sql`${customers.currentBalance} > 0`
        )
      );

    return {
      success: true,
      summary: {
        todaySales: Number(todaySalesResult.total),
        totalSales: Number(totalSalesResult.total),
        totalInvoices: Number(invoicesCountResult.count),
        totalCustomers: Number(customersCountResult.count),
        totalReceivable: Number(receivableResult.total),
      }
    };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch sales summary" };
  }
}
