"use server";

import { Decimal } from 'decimal.js';

import { db } from "@/lib/db";
import { invoices, customers, products, khataTransactions, businesses } from "@/lib/schema";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, and, desc, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { revalidateLocalizedPaths, revalidateDashboardCache } from "@/lib/revalidate";
import { allocatePaymentAcrossInvoices } from "@/lib/accounting";
import { checkActionRateLimit } from "@/lib/rate-limit";

const INDIA_TIME_ZONE = "Asia/Kolkata";

function getIndiaDateString(date: Date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: INDIA_TIME_ZONE });
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function generateInvoiceNumber(): string {
  const istDateStr = getIndiaDateString();
  const [fullYear, month] = istDateStr.split('-');
  const year = fullYear.slice(-2);
  const ts = Date.now().toString(36).slice(-6);
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return `INV/${year}${month}/${ts}${rand}`;
}

function calculateGST(itemRate: number, quantity: number, gstRate: number, isInterState: boolean) {
  
  const rate = new Decimal(itemRate);
  const qty = new Decimal(quantity);
  const gstPct = new Decimal(gstRate);

  const amount = rate.times(qty).toDecimalPlaces(2);
  const gstAmount = amount.times(gstPct).dividedBy(100);

  if (isInterState) {
    return {
      amount: amount.toNumber(),
      cgst: 0,
      sgst: 0,
      igst: gstAmount.toDecimalPlaces(2).toNumber(),
    };
  }

  const cgst = gstAmount.dividedBy(2).toDecimalPlaces(2);
  const sgst = gstAmount.dividedBy(2).toDecimalPlaces(2);

  return {
    amount: amount.toNumber(),
    cgst: cgst.toNumber(),
    sgst: sgst.toNumber(),
    igst: 0,
  };
}

export async function createInvoice(data: InvoiceInput) {
  try {
    const session = await requireBusinessSession();

    const rateCheck = await checkActionRateLimit(session.id, 'createInvoice', 30, '60 s');
    if (!rateCheck.success) return { error: "Too many requests. Please try again later." };

    const validation = invoiceSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    
    if (data.paymentMode === 'khata' && !data.customerId) {
      return { error: "A customer must be selected for Khata (credit) invoices." };
    }

    
    const invoiceDateObj = new Date(data.invoiceDate + 'T00:00:00+05:30');
    const todayIST = new Date(getIndiaDateString() + 'T23:59:59+05:30');
    if (invoiceDateObj > todayIST) {
      return { error: "Invoice date cannot be in the future." };
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

    let subtotal = new Decimal(0);
    let totalCgst = new Decimal(0);
    let totalSgst = new Decimal(0);
    let totalIgst = new Decimal(0);

    const processedItems = data.items.map(item => {
      const gst = calculateGST(item.rate, item.quantity, item.gstRate, data.isInterState || false);
      subtotal = subtotal.plus(gst.amount);
      totalCgst = totalCgst.plus(gst.cgst);
      totalSgst = totalSgst.plus(gst.sgst);
      totalIgst = totalIgst.plus(gst.igst);

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

    const total = subtotal.plus(totalCgst).plus(totalSgst).plus(totalIgst).toNumber();
    const paymentMode = data.paymentMode || 'cash';
    const paymentStatus = 'unpaid';
    const amountPaid = 0;

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
        subtotal: subtotal.toNumber(),
        cgst: totalCgst.toNumber(),
        sgst: totalSgst.toNumber(),
        igst: totalIgst.toNumber(),
        total,
        items: processedItems,
        notes: data.notes || null,
        paymentMode,
        paymentStatus,
        amountPaid,
        status: 'active',
      }).returning();

      if (processedItems.length > 0) {
        
        const productProps = new Map<string, { qty: number; name: string }>();
        for (const item of processedItems) {
          const existing = productProps.get(item.productId);
          if (existing) {
            existing.qty += item.quantity;
          } else {
            productProps.set(item.productId, { qty: item.quantity, name: item.productName });
          }
        }

        const productIds = Array.from(productProps.keys());
        const sqlIds = sql.join(productIds.map(id => sql`${id}`), sql`, `);

        
        const productRows = await tx.execute(
          sql`SELECT id, name, stock_quantity, business_id FROM products WHERE id IN (${sqlIds}) FOR UPDATE`
        ) as unknown as { id: string; name: string; stock_quantity: number | null; business_id: string }[];

        
        for (const [id, props] of productProps.entries()) {
          const product = productRows.find(p => p.id === id);
          if (!product) {
            throw new Error(`Product not found: ${props.name}`);
          }
          if (product.business_id !== session.id) {
            throw new Error(`Product ${product.name} does not belong to your business`);
          }
          if ((product.stock_quantity ?? 0) < props.qty) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity ?? 0}, Required: ${props.qty}`);
          }
        }

        
        const quantityCases = sql.join(
          Array.from(productProps.entries()).map(([id, props]) => sql`WHEN id = ${id} THEN stock_quantity - ${props.qty}`),
          sql` `
        );

        await tx.execute(sql`
          UPDATE products
          SET 
            stock_quantity = CASE ${quantityCases} ELSE stock_quantity END,
            updated_at = NOW()
          WHERE id IN (${sqlIds})
        `);
      }

      if (data.customerId && data.recordPayment && paymentMode !== 'khata') {
        const customerRows = await tx.execute(
          sql`SELECT id, business_id, current_balance FROM customers WHERE id = ${data.customerId} FOR UPDATE`
        ) as unknown as { id: string; business_id: string; current_balance: number | null }[];
        const customer = customerRows[0];
        if (!customer || customer.business_id !== session.id) {
          throw new Error("Customer not found");
        }
        const newBalance = new Decimal(customer.current_balance || 0).minus(total);
        await tx.update(customers)
          .set({ currentBalance: newBalance.toNumber(), updatedAt: new Date() })
          .where(eq(customers.id, data.customerId));
        await tx.insert(khataTransactions).values({
          id: crypto.randomUUID(),
          businessId: session.id,
          customerId: data.customerId,
          type: 'debit',
          amount: total,
          note: `Payment for Invoice ${invoiceNumber}`,
          referenceInvoiceId: newInvoice.id,
        });
        await tx.update(invoices)
          .set({ paymentStatus: 'paid', amountPaid: total, updatedAt: new Date() })
          .where(eq(invoices.id, newInvoice.id));
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
        const currentBalance = new Decimal(customer.current_balance || 0);
        const creditLimit = new Decimal(customer.credit_limit || 0);
        const invTotalStr = new Decimal(total);
        const newBalance = currentBalance.plus(invTotalStr);
        const availableCredit = Decimal.max(0, creditLimit.minus(currentBalance));

        if (creditLimit.greaterThan(0) && newBalance.greaterThan(creditLimit)) {
          throw new Error(`Transaction exceeds customer credit limit. Credit Limit: ${creditLimit.toFixed(2)}, Available: ${availableCredit.toFixed(2)}, Invoice Total: ${invTotalStr.toFixed(2)}`);
        }
        await tx.update(customers)
          .set({
            currentBalance: newBalance.toNumber(),
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

    revalidateLocalizedPaths(['/dashboard/invoices', '/dashboard/khata', '/dashboard']);
    revalidateDashboardCache(session.id);
    return { success: true, invoice };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to create invoice") };
  }
}

export async function getInvoices(limit = 50, offset = 0) {
  try {
    const session = await requireBusinessSession();

    const invoiceList = await db.query.invoices.findMany({
      where: eq(invoices.businessId, session.id),
      orderBy: [desc(invoices.createdAt)],
      limit,
      offset,
    });

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(invoices)
      .where(eq(invoices.businessId, session.id));

    return { success: true, invoices: invoiceList, total: Number(countResult.count) };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to fetch invoices") };
  }
}

export async function cancelInvoice(id: string) {
  try {
    const session = await requireBusinessSession();

    const rateCheck = await checkActionRateLimit(session.id, 'cancelInvoice', 10, '60 s');
    if (!rateCheck.success) return { error: "Too many requests. Please try again later." };

    await db.transaction(async (tx) => {
      const [invoice] = await tx.update(invoices)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(and(eq(invoices.id, id), eq(invoices.businessId, session.id), eq(invoices.status, 'active')))
        .returning();

      if (!invoice) {
        const existing = await tx.query.invoices.findFirst({
          where: eq(invoices.id, id),
        });
        if (!existing || existing.businessId !== session.id) {
          throw new Error("Invoice not found");
        }
        throw new Error("Invoice already cancelled");
      }

      if (invoice.items && invoice.items.length > 0) {
        
        const productProps = new Map<string, number>();
        for (const item of invoice.items) {
          productProps.set(item.productId, (productProps.get(item.productId) ?? 0) + item.quantity);
        }

        const productIds = Array.from(productProps.keys());
        const sqlIds = sql.join(productIds.map(id => sql`${id}`), sql`, `);

        
        const quantityCases = sql.join(
          Array.from(productProps.entries()).map(([id, qty]) => sql`WHEN id = ${id} THEN stock_quantity + ${qty}`),
          sql` `
        );

        
        await tx.execute(sql`
          UPDATE products
          SET 
            stock_quantity = CASE ${quantityCases} ELSE stock_quantity END,
            updated_at = NOW()
          WHERE id IN (${sqlIds})
        `);
      }

      if (invoice.customerId) {
        const customerRows = await tx.execute(
          sql`SELECT id, current_balance FROM customers WHERE id = ${invoice.customerId} FOR UPDATE`
        ) as unknown as { id: string; current_balance: number | null }[];
        const customer = customerRows[0];

        const isKhata = invoice.paymentMode === 'khata';
        const hadPayment = (invoice.amountPaid ?? 0) > 0;

        if (customer && (isKhata || hadPayment)) {
          const currentBalance = new Decimal(customer.current_balance || 0);
          const invTotalStr = new Decimal(invoice.total || 0);
          
          
          
          
          
          const newBalance = isKhata
            ? currentBalance.minus(invTotalStr)        
            : currentBalance.plus(invTotalStr);         

          await tx.update(customers)
            .set({
              currentBalance: newBalance.toNumber(),
              updatedAt: new Date(),
            })
            .where(eq(customers.id, invoice.customerId));
        }

        
        const reversalType = isKhata ? 'debit' : 'credit';
        await tx.insert(khataTransactions).values({
          id: crypto.randomUUID(),
          businessId: session.id,
          customerId: invoice.customerId,
          type: reversalType,
          amount: invoice.total ?? 0,
          note: `Invoice ${invoice.invoiceNumber} Cancelled - Reversal`,
          referenceInvoiceId: invoice.id,
        });

        
        let orphanedPayment = new Decimal(isKhata ? 0 : (invoice.amountPaid || 0));
        if (orphanedPayment.greaterThan(0)) {
          const pendingInvoicesRows = await tx.execute(
            sql`SELECT id, total, amount_paid FROM invoices 
                WHERE customer_id = ${invoice.customerId} 
                AND business_id = ${session.id}
                AND payment_status IN ('unpaid', 'partial')
                AND status = 'active'
                AND id != ${invoice.id}
                ORDER BY invoice_date ASC, created_at ASC 
                FOR UPDATE`
          ) as unknown as { id: string; total: number | null; amount_paid: number | null }[];

          const allocation = allocatePaymentAcrossInvoices(pendingInvoicesRows, orphanedPayment);
          const invoicesToUpdate = allocation.updates;
          orphanedPayment = new Decimal(allocation.remaining);

          
          if (invoicesToUpdate.length > 0) {
            const ids = invoicesToUpdate.map(inv => inv.id);
            const sqlIds = sql.join(ids.map(id => sql`${id}`), sql`, `);

            const amountPaidCases = sql.join(
              invoicesToUpdate.map(inv => sql`WHEN id = ${inv.id} THEN ${inv.amountPaid}::numeric`),
              sql` `
            );

            const statusCases = sql.join(
              invoicesToUpdate.map(inv => sql`WHEN id = ${inv.id} THEN ${inv.status}::text`),
              sql` `
            );

            await tx.execute(sql`
              UPDATE invoices 
              SET 
                amount_paid = CASE ${amountPaidCases} END,
                payment_status = CASE ${statusCases} END,
                updated_at = NOW()
              WHERE id IN (${sqlIds})
            `);
          }
        }
      }
    });

    revalidateLocalizedPaths(['/dashboard/invoices', '/dashboard/khata', '/dashboard']);
    revalidateDashboardCache(session.id);

    return { success: true };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to cancel invoice") };
  }
}

export async function getSalesSummary() {
  try {
    const session = await requireBusinessSession();
    const businessId = session.id;

    const todayStr = getIndiaDateString();

    const getCachedSummary = unstable_cache(
      async (bId: string, tStr: string) => {
        const [invoiceResult] = await db.execute(sql`
          SELECT
            COALESCE(SUM(CASE WHEN invoice_date = ${tStr} THEN total ELSE 0 END), 0) AS today_sales,
            COALESCE(SUM(total), 0) AS total_sales,
            COUNT(*) AS total_invoices
          FROM invoices
          WHERE business_id = ${bId} AND status = 'active'
        `) as unknown as [{ today_sales: number; total_sales: number; total_invoices: number }];

        const [customerResult] = await db.execute(sql`
          SELECT
            COUNT(*) AS total_customers,
            COALESCE(SUM(CASE WHEN current_balance > 0 THEN current_balance ELSE 0 END), 0) AS total_receivable
          FROM customers
          WHERE business_id = ${bId}
        `) as unknown as [{ total_customers: number; total_receivable: number }];

        return {
          todaySales: Number(invoiceResult.today_sales),
          totalSales: Number(invoiceResult.total_sales),
          totalInvoices: Number(invoiceResult.total_invoices),
          totalCustomers: Number(customerResult.total_customers),
          totalReceivable: Number(customerResult.total_receivable),
        };
      },
      ['dashboard-sales-summary', businessId],
      { tags: [`business_sales_${businessId}`], revalidate: 60 }
    );

    const summary = await getCachedSummary(businessId, todayStr);

    return {
      success: true,
      summary
    };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to fetch sales summary") };
  }
}

export async function getRecentInvoices(limit = 5) {
  try {
    const session = await requireBusinessSession();
    const businessId = session.id;

    const getCachedRecentInvoices = unstable_cache(
      async (bId: string, limitNum: number) => {
        return await db.query.invoices.findMany({
          where: and(
            eq(invoices.businessId, bId),
            eq(invoices.status, 'active')
          ),
          orderBy: [desc(invoices.createdAt)],
          limit: limitNum,
        });
      },
      ['dashboard-recent-invoices', businessId],
      { tags: [`business_invoices_${businessId}`], revalidate: 60 }
    );

    const invoiceList = await getCachedRecentInvoices(businessId, limit);

    return { success: true, invoices: invoiceList };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to fetch recent invoices") };
  }
}

export async function getWeeklySalesData() {
  try {
    const session = await requireBusinessSession();
    const businessId = session.id;

    const getCachedWeeklySales = unstable_cache(
      async (bId: string) => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const startDate = getIndiaDateString(sevenDaysAgo);
        const endDate = getIndiaDateString(today);

        const rows = await db
          .select({
            date: invoices.invoiceDate,
            total: sql<number>`COALESCE(SUM(${invoices.total}), 0)`,
          })
          .from(invoices)
          .where(
            and(
              eq(invoices.businessId, bId),
              eq(invoices.status, 'active'),
              sql`${invoices.invoiceDate} >= ${startDate}`,
              sql`${invoices.invoiceDate} <= ${endDate}`
            )
          )
          .groupBy(invoices.invoiceDate)
          .orderBy(invoices.invoiceDate);

        const totalsByDate = new Map(rows.map(r => [r.date, Number(r.total)]));

        const days: { date: string; label: string; total: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = getIndiaDateString(d);
          const label = new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            timeZone: INDIA_TIME_ZONE,
          }).format(d);
          days.push({
            date: dateStr,
            label,
            total: totalsByDate.get(dateStr) ?? 0,
          });
        }
        return days;
      },
      ['dashboard-weekly-sales', businessId],
      { tags: [`business_weekly_sales_${businessId}`], revalidate: 60 }
    );

    const days = await getCachedWeeklySales(businessId);

    return { success: true, days };
  } catch (error: unknown) {
    return { error: errorMessage(error, "Failed to fetch weekly sales data") };
  }
}
