"use server";

import { Decimal } from 'decimal.js';

import { db } from "@/lib/db";
import { invoices, customers, products, khataTransactions, businesses } from "@/lib/schema";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations";
import { requireBusinessSession } from "@/lib/session";
import { eq, and, gt, sql } from "drizzle-orm";
import { revalidatePath, unstable_cache } from "next/cache";

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const unique = crypto.randomUUID().split('-')[0];
  return `INV/${year}${month}/${unique}`;
}

function calculateGST(itemRate: number, quantity: number, gstRate: number, isInterState: boolean) {
  // Use Decimal for exact financial precision without float drift
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

    const validation = invoiceSchema.safeParse(data);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    // Prevent khata invoices without a linked customer
    if (data.paymentMode === 'khata' && !data.customerId) {
      return { error: "A customer must be selected for Khata (credit) invoices." };
    }

    // Prevent future-dated invoices (allow up to 1 day ahead for timezone variance)
    const invoiceDateObj = new Date(data.invoiceDate);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 1);
    if (invoiceDateObj > maxDate) {
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
    const paymentStatus = paymentMode === 'khata' ? 'unpaid' : 'paid';
    const amountPaid = paymentMode === 'khata' ? 0 : total;

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

      if (data.customerId) {
        const customerRows = await tx.execute(
          sql`SELECT id, business_id FROM customers WHERE id = ${data.customerId} FOR UPDATE`
        ) as unknown as { id: string; business_id: string }[];
        const customer = customerRows[0];
        if (!customer) {
          throw new Error("Customer not found");
        }
        if (customer.business_id !== session.id) {
          throw new Error("Customer does not belong to your business");
        }
      }

      if (processedItems.length > 0) {
        // Aggregate required quantities by productId to handle duplicate items
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

        // Lock required products
        const productRows = await tx.execute(
          sql`SELECT id, name, stock_quantity FROM products WHERE business_id = ${session.id} AND id IN (${sqlIds}) FOR UPDATE`
        ) as unknown as { id: string; name: string; stock_quantity: number | null }[];

        // Validate stock
        for (const [id, props] of productProps.entries()) {
          const product = productRows.find(p => p.id === id);
          if (!product) {
            throw new Error(`Product not found: ${props.name}`);
          }
          if ((product.stock_quantity ?? 0) < props.qty) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity ?? 0}, Required: ${props.qty}`);
          }
        }

        // Bulk update
        const quantityCases = sql.join(
          Array.from(productProps.entries()).map(([id, props]) => sql`WHEN id = ${id} THEN stock_quantity - ${props.qty}`),
          sql` `
        );

        await tx.execute(sql`
          UPDATE products
          SET 
            stock_quantity = CASE ${quantityCases} ELSE stock_quantity END,
            updated_at = NOW()
          WHERE business_id = ${session.id} AND id IN (${sqlIds})
        `);
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

      if (invoice.items && invoice.items.length > 0) {
        // Aggregate quantities by product to avoid duplicate-ID CASE overwrite issues
        const productProps = new Map<string, number>();
        for (const item of invoice.items) {
          productProps.set(item.productId, (productProps.get(item.productId) ?? 0) + item.quantity);
        }

        const productIds = Array.from(productProps.keys());
        const sqlIds = sql.join(productIds.map(id => sql`${id}`), sql`, `);

        // Build CASE statement for quantity increments
        const quantityCases = sql.join(
          Array.from(productProps.entries()).map(([id, qty]) => sql`WHEN id = ${id} THEN stock_quantity + ${qty}`),
          sql` `
        );

        // Bulk update products
        await tx.execute(sql`
          UPDATE products
          SET 
            stock_quantity = CASE ${quantityCases} ELSE stock_quantity END,
            updated_at = NOW()
          WHERE business_id = ${session.id} AND id IN (${sqlIds})
        `);
      }

      if (invoice.customerId && invoice.paymentStatus !== 'paid') {
        const customerRows = await tx.execute(
          sql`SELECT id, current_balance FROM customers WHERE id = ${invoice.customerId} FOR UPDATE`
        ) as unknown as { id: string; current_balance: number | null }[];
        const customer = customerRows[0];

        let orphanedPayment = new Decimal(invoice.amountPaid || 0);

        if (customer) {
          const currentBalance = new Decimal(customer.current_balance || 0);
          const invTotalStr = new Decimal(invoice.total || 0);
          const newBalance = currentBalance.minus(invTotalStr);

          await tx.update(customers)
            .set({
              currentBalance: newBalance.toNumber(),
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

        // ---------------------------------------------------------------------
        // GOD-LEVEL ORPHANED PAYMENT CASCADE
        // If the cancelled invoice possessed partial payments, we must take that 
        // locked capital and re-invest it into the next oldest unpaid invoices 
        // belonging to the customer, to correctly resolve the Ledger shift.
        // ---------------------------------------------------------------------
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

          const invoicesToUpdate: { id: string; amountPaid: number; status: 'paid' | 'partial' }[] = [];

          for (const inv of pendingInvoicesRows) {
            if (orphanedPayment.lessThanOrEqualTo(0)) break;

            const invTotal = new Decimal(inv.total || 0);
            const invPaid = new Decimal(inv.amount_paid || 0);
            const amountDue = invTotal.minus(invPaid);

            if (amountDue.lessThanOrEqualTo(0)) continue;

            if (orphanedPayment.greaterThanOrEqualTo(amountDue)) {
              invoicesToUpdate.push({
                id: inv.id,
                amountPaid: invTotal.toNumber(),
                status: 'paid'
              });
              orphanedPayment = orphanedPayment.minus(amountDue);
            } else {
              invoicesToUpdate.push({
                id: inv.id,
                amountPaid: invPaid.plus(orphanedPayment).toNumber(),
                status: 'partial'
              });
              orphanedPayment = new Decimal(0);
            }
          }

          // Execute batch updates avoiding N+1
          if (invoicesToUpdate.length > 0) {
            const ids = invoicesToUpdate.map(inv => inv.id);
            const sqlIds = sql.join(ids.map(id => sql`${id}`), sql`, `);

            const amountPaidCases = sql.join(
              invoicesToUpdate.map(inv => sql`WHEN id = ${inv.id} THEN ${inv.amountPaid}`),
              sql` `
            );

            const statusCases = sql.join(
              invoicesToUpdate.map(inv => sql`WHEN id = ${inv.id} THEN ${inv.status}`),
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
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const getCachedSummary = unstable_cache(
      async (bId: string, tStr: string, nextDayStr: string) => {
        const [todaySalesResult] = await db
          .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
          .from(invoices)
          .where(
            and(
              eq(invoices.businessId, bId),
              eq(invoices.status, 'active'),
              eq(invoices.paymentStatus, 'paid'),
              sql`${invoices.invoiceDate} >= ${tStr}`,
              sql`${invoices.invoiceDate} < ${nextDayStr}`
            )
          );

        const [totalSalesResult] = await db
          .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
          .from(invoices)
          .where(
            and(
              eq(invoices.businessId, bId),
              eq(invoices.status, 'active'),
              eq(invoices.paymentStatus, 'paid')
            )
          );

        const [invoicesCountResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(invoices)
          .where(
            and(
              eq(invoices.businessId, bId),
              eq(invoices.status, 'active')
            )
          );

        const [customersCountResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(customers)
          .where(eq(customers.businessId, bId));

        const [receivableResult] = await db
          .select({ total: sql<number>`COALESCE(SUM(${customers.currentBalance}), 0)` })
          .from(customers)
          .where(
            and(
              eq(customers.businessId, bId),
              sql`${customers.currentBalance} > 0`
            )
          );

        return {
          todaySales: Number(todaySalesResult.total),
          totalSales: Number(totalSalesResult.total),
          totalInvoices: Number(invoicesCountResult.count),
          totalCustomers: Number(customersCountResult.count),
          totalReceivable: Number(receivableResult?.total ?? 0),
        };
      },
      ['dashboard-sales-summary'],
      { tags: ['dashboard_sales', `business_sales_${businessId}`], revalidate: 3600 }
    );

    const summary = await getCachedSummary(businessId, todayStr, tomorrowStr);

    return {
      success: true,
      summary
    };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch sales summary" };
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
          orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
          limit: limitNum,
        });
      },
      ['dashboard-recent-invoices'],
      { tags: ['dashboard_recent', `business_invoices_${businessId}`], revalidate: 3600 }
    );

    const invoiceList = await getCachedRecentInvoices(businessId, limit);

    return { success: true, invoices: invoiceList };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch recent invoices" };
  }
}

export async function getWeeklySalesData() {
  try {
    const session = await requireBusinessSession();
    const businessId = session.id;

    const getCachedWeeklySales = unstable_cache(
      async (bId: string) => {
        const days: { date: string; label: string; total: number }[] = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];

          const [result] = await db
            .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
            .from(invoices)
            .where(
              and(
                eq(invoices.businessId, bId),
                eq(invoices.status, 'active'),
                sql`${invoices.invoiceDate} = ${dateStr}`
              )
            );

          days.push({
            date: dateStr,
            label: dayNames[d.getDay()],
            total: Number(result.total),
          });
        }
        return days;
      },
      ['dashboard-weekly-sales'],
      { tags: ['dashboard_sales', `business_weekly_sales_${businessId}`], revalidate: 3600 }
    );

    const days = await getCachedWeeklySales(businessId);

    return { success: true, days };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch weekly sales data" };
  }
}
