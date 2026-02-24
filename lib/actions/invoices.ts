"use server";

import { db } from "@/lib/db";
import { invoices, customers, products, khataTransactions } from "@/lib/schema";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, and, gt } from "drizzle-orm";

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV/${year}${month}/${random}`;
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

    const invoiceNumber = generateInvoiceNumber();
    const invoiceDate = new Date(data.invoiceDate);

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
        status: 'active',
      }).returning();

      for (const item of processedItems) {
        const product = await tx.query.products.findFirst({
          where: eq(products.id, item.productId),
        });
        if (product) {
          await tx.update(products)
            .set({
              stockQuantity: (product.stockQuantity ?? 0) - item.quantity,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        }
      }

      if (data.customerId) {
        const customer = await tx.query.customers.findFirst({
          where: eq(customers.id, data.customerId),
        });
        if (customer) {
          await tx.update(customers)
            .set({
              currentBalance: (customer.currentBalance ?? 0) + total,
              updatedAt: new Date(),
            })
            .where(eq(customers.id, data.customerId));
        }

        await tx.insert(khataTransactions).values({
          id: crypto.randomUUID(),
          businessId: session.id,
          customerId: data.customerId,
          type: 'credit',
          amount: total,
          note: `Invoice ${invoiceNumber}`,
          referenceInvoiceId: newInvoice.id,
        });
      }

      return newInvoice;
    });

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
          const product = await tx.query.products.findFirst({
            where: eq(products.id, item.productId),
          });
          if (product) {
            await tx.update(products)
              .set({
                stockQuantity: (product.stockQuantity ?? 0) + item.quantity,
                updatedAt: new Date(),
              })
              .where(eq(products.id, item.productId));
          }
        }
      }

      if (invoice.customerId) {
        const customer = await tx.query.customers.findFirst({
          where: eq(customers.id, invoice.customerId),
        });
        if (customer) {
          await tx.update(customers)
            .set({
              currentBalance: (customer.currentBalance ?? 0) - (invoice.total ?? 0),
              updatedAt: new Date(),
            })
            .where(eq(customers.id, invoice.customerId));
        }
      }
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to cancel invoice" };
  }
}

export async function getSalesSummary() {
  try {
    const session = await requireBusinessSession();

    const allInvoices = await db.query.invoices.findMany({
      where: eq(invoices.businessId, session.id),
    });

    const activeInvoices = allInvoices.filter(inv => inv.status === 'active');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = activeInvoices
      .filter(inv => new Date(inv.invoiceDate) >= today)
      .reduce((sum, inv) => sum + inv.total, 0);

    const totalSales = activeInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalInvoices = activeInvoices.length;

    const allCustomers = await db.query.customers.findMany({
      where: eq(customers.businessId, session.id),
    });

    const totalReceivable = allCustomers.reduce((sum, c) => sum + (c.currentBalance ?? 0), 0);

    return {
      success: true,
      summary: {
        todaySales,
        totalSales,
        totalInvoices,
        totalCustomers: allCustomers.length,
        totalReceivable,
      }
    };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch sales summary" };
  }
}
