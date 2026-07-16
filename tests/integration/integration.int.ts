import { describe, it, before, afterEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

import { createInvoice } from "@/lib/actions/invoices";
import { cancelInvoice } from "@/lib/actions/invoices";
import { createKhataTransaction } from "@/lib/actions/khata";
import { chargeLateFees } from "@/lib/actions/khata";
import { deleteKhataTransaction } from "@/lib/actions/khata";
import { resetCustomerKhata } from "@/lib/actions/khata";
import { recalculateCustomerBalance } from "@/lib/actions/khata";

const BIZ = "test-business-001";
const SMS = "9876543210";

function uid() { return crypto.randomUUID(); }
const cid = uid; const iid = uid; const pid = uid;
function num(v: unknown): number { return Number(v); }

async function q(sqlStr: string) {
  await db.execute(sqlStr);
}

async function insertBusiness() {
  await q(`INSERT INTO businesses (id,name,email,password_hash,address,phone,state,redemption_period_days,fine_percentage,fine_frequency_days)
    VALUES ('${BIZ}','Test Biz','biz@test.com','hash','123 St','${SMS}','Maharashtra',30,2,7)
    ON CONFLICT (id) DO NOTHING`);
}

async function insertCustomer(id: string, opts?: { cl?: number; bal?: number }) {
  await q(`INSERT INTO customers (id,business_id,name,phone,credit_limit,current_balance)
    VALUES ('${id}','${BIZ}','Cust ${id}','${SMS}',${opts?.cl ?? 5000},${opts?.bal ?? 0})`);
}

async function insertProduct(id: string, opts?: { stock?: number; rate?: number; gst?: number }) {
  await q(`INSERT INTO products (id,business_id,name,sku,rate,gst_rate,stock_quantity,low_stock_threshold)
    VALUES ('${id}','${BIZ}','Prod ${id}','SKU-${id}',${opts?.rate ?? 100},${opts?.gst ?? 18},${opts?.stock ?? 100},10)`);
}

async function insertInvoice(id: string, custId: string, opts?: { total?: number; paid?: number; status?: string; pstatus?: string; date?: string; notes?: string; pmode?: string }) {
  const pmode = opts?.pmode ?? "khata";
  await q(`INSERT INTO invoices (id,business_id,invoice_number,customer_id,customer_name,invoice_date,subtotal,total,amount_paid,payment_mode,payment_status,status)
    VALUES ('${id}','${BIZ}','INV-${id}','${custId}','Cust ${custId}','${opts?.date ?? "2026-07-01"}',${opts?.total ?? 1000},${opts?.total ?? 1000},${opts?.paid ?? 0},'${pmode}','${opts?.pstatus ?? "paid_by_khata"}','${opts?.status ?? "active"}')`);
  if (pmode === "khata") {
    await q(`INSERT INTO khata_transactions (id,business_id,customer_id,type,amount,note) VALUES ('${uid()}','${BIZ}','${custId}','credit',${opts?.total ?? 1000},'Invoice ${id}')`);
    await q(`UPDATE customers SET current_balance = current_balance + ${opts?.total ?? 1000} WHERE id = '${custId}'`);
  }
}

async function cleanData() {
  for (const tbl of ["khata_transactions","invoices","products","customers","audit_log","khata_resets"]) {
    try { await q(`DELETE FROM "${tbl}" WHERE business_id = '${BIZ}'`); } catch { /* skip */ }
  }
  try { await db.execute(sql`DELETE FROM rate_limits`); } catch { /* skip */ }
  try { await q(`DELETE FROM idempotency_keys`); } catch { /* skip */ }
  try { await q(`UPDATE businesses SET name = 'Test Biz', address = '123 St', phone = '${SMS}', email = 'biz@test.com', password_hash = 'hash', state = 'Maharashtra', redemption_period_days = 30, fine_percentage = 2, fine_frequency_days = 7 WHERE id = '${BIZ}'`); } catch { /* skip */ }
}

function ok(r: unknown): asserts r is { error?: string; success?: boolean } {
  if (r && typeof r === "object" && "error" in r) throw new Error(`Unexpected error: ${(r as { error: string }).error}`);
}

function err(r: unknown, msg?: string) {
  if (!r || typeof r !== "object" || !("error" in r)) throw new Error(`Expected error but got success: ${JSON.stringify(r)}`);
  if (msg) assert((r as { error: string }).error.includes(msg), `Expected error to include "${msg}", got: ${(r as { error: string }).error}`);
}

before(async () => {
  await db.execute(`DELETE FROM businesses WHERE id = '${BIZ}'`);
  await insertBusiness();
});

afterEach(async () => { await cleanData(); await insertBusiness(); });

// ===========================================================================
// createInvoice
// ===========================================================================
describe("createInvoice", () => {
  it("cash mode creates paid invoice with stock deduction", async () => {
    const c = uid(); const p = uid();
    await insertCustomer(c); await insertProduct(p, { stock: 50 });
    const r = await createInvoice({
      customerId: c, customerName: "Test", invoiceDate: "2026-07-01",
      paymentMode: "cash", isInterState: false,
      items: [{ productId: p, productName: "P", quantity: 2, rate: 100, gstRate: 18 }],
    });
    ok(r);
    assert("success" in r && r.success, "expected success");
    assert.equal((r as { invoice?: { paymentStatus?: string } }).invoice?.paymentStatus, "paid");
    const [row] = await db.execute(sql`SELECT stock_quantity FROM products WHERE id = ${p}`) as unknown as [{ stock_quantity: number }];
    assert.equal(num(row.stock_quantity), 48, "stock should drop by 2");
  });

  it("khata mode creates unpaid invoice within credit limit", async () => {
    const c = uid(); const p = uid();
    await insertCustomer(c, { cl: 5000 }); await insertProduct(p);
    const r = await createInvoice({
      customerId: c, customerName: "T", invoiceDate: "2026-07-01",
      paymentMode: "khata", isInterState: false,
      items: [{ productId: p, productName: "P", quantity: 1, rate: 100, gstRate: 18 }],
    });
    ok(r);
    assert("success" in r && r.success);
    assert.equal((r as { invoice?: { paymentStatus?: string } }).invoice?.paymentStatus, "paid_by_khata");
  });

  it("khata mode fails when exceeding credit limit", async () => {
    const c = uid(); const p = uid();
    await insertCustomer(c, { cl: 50 }); await insertProduct(p);
    const r = await createInvoice({
      customerId: c, customerName: "T", invoiceDate: "2026-07-01",
      paymentMode: "khata", isInterState: false,
      items: [{ productId: p, productName: "P", quantity: 1, rate: 100, gstRate: 18 }],
    });
    err(r, "credit limit");
  });

  it("interstate GST uses IGST", async () => {
    const c = uid(); const p = uid();
    await insertCustomer(c); await insertProduct(p, { rate: 200, gst: 18 });
    const r = await createInvoice({
      customerId: c, customerName: "T", invoiceDate: "2026-07-01",
      paymentMode: "cash", isInterState: true,
      items: [{ productId: p, productName: "P", quantity: 1, rate: 200, gstRate: 18 }],
    });
    ok(r);
    const inv = r as { invoice?: { igst?: number; cgst?: number; sgst?: number } };
    assert(inv.invoice);
    assert.equal(inv.invoice.igst, 36, "IGST should be 18% of 200 = 36");
    assert.equal(inv.invoice.cgst, 0, "no CGST for interstate");
    assert.equal(inv.invoice.sgst, 0, "no SGST for interstate");
  });

  it("insufficient stock returns error", async () => {
    const c = uid(); const p = uid();
    await insertCustomer(c); await insertProduct(p, { stock: 1 });
    const r = await createInvoice({
      customerId: c, customerName: "T", invoiceDate: "2026-07-01",
      paymentMode: "cash", isInterState: false,
      items: [{ productId: p, productName: "P", quantity: 5, rate: 100, gstRate: 18 }],
    });
    err(r, "Insufficient stock");
  });

  it("future invoice date returns error", async () => {
    const c = uid(); const p = uid();
    await insertCustomer(c); await insertProduct(p);
    const r = await createInvoice({
      customerId: c, customerName: "T", invoiceDate: "2030-01-01",
      paymentMode: "cash", isInterState: false,
      items: [{ productId: p, productName: "P", quantity: 1, rate: 100, gstRate: 18 }],
    });
    err(r, "future");
  });

  it("incomplete business profile returns error", async () => {
    const c = uid(); const p = uid();
    await insertCustomer(c); await insertProduct(p);
    await db.execute(sql`UPDATE businesses SET name = '' WHERE id = ${BIZ}`);
    const r = await createInvoice({
      customerId: c, customerName: "T", invoiceDate: "2026-07-01",
      paymentMode: "cash", isInterState: false,
      items: [{ productId: p, productName: "P", quantity: 1, rate: 100, gstRate: 18 }],
    });
    err(r, "business profile");
  });
});

// ===========================================================================
// cancelInvoice
// ===========================================================================
describe("cancelInvoice", () => {
  it("cancels khata invoice and decreases balance", async () => {
    const c = cid(); const inv = uid();
    await insertCustomer(c, { bal: 0 }); await insertInvoice(inv, c, { total: 1000 });
    const r = await cancelInvoice(inv);
    ok(r);
    assert("success" in r && r.success);
    const [row] = await db.execute(sql`SELECT status, amount_paid FROM invoices WHERE id = ${inv}`) as unknown as [{ status: string; amount_paid: number }];
    assert.equal(row.status, "cancelled");
    assert.equal(num(row.amount_paid), 0);
  });

  it("cancels cash invoice without other pending invoices", async () => {
    const c = cid(); const inv = uid();
    await insertCustomer(c); await insertInvoice(inv, c, { total: 500, paid: 500, pstatus: "paid", status: "active", pmode: "cash" });
    const r = await cancelInvoice(inv);
    ok(r);
    assert("success" in r && r.success);
  });

  it("reallocates orphaned payment to other pending invoices", async () => {
    const c = cid(); const invA = uid(); const invB = uid();
    await insertCustomer(c);
    await insertInvoice(invA, c, { total: 1000, paid: 1000, pstatus: "paid", status: "active", pmode: "cash" });
    await insertInvoice(invB, c, { total: 500, paid: 0, pstatus: "paid_by_khata", status: "active" });
    const r = await cancelInvoice(invA);
    ok(r);
    assert("success" in r && r.success);
    const [row] = await db.execute(sql`SELECT amount_paid, payment_status FROM invoices WHERE id = ${invB}`) as unknown as [{ amount_paid: number; payment_status: string }];
    assert.equal(num(row.amount_paid), 500, "orphaned 1000 should fully pay invB=500");
    assert.equal(row.payment_status, "paid");
  });

  it("fails for already cancelled invoice", async () => {
    const c = cid(); const inv = uid();
    await insertCustomer(c); await insertInvoice(inv, c, { status: "cancelled" });
    const r = await cancelInvoice(inv);
    err(r, "cancelled");
  });

  it("non-existent invoice returns error", async () => {
    const r = await cancelInvoice(uid());
    err(r, "not found");
  });

  it("restores stock after cancellation", async () => {
    const c = uid(); const p = uid(); const inv = uid();
    await insertCustomer(c); await insertProduct(p, { stock: 10 });
    const createR = await createInvoice({
      customerId: c, customerName: "T", invoiceDate: "2026-07-01",
      paymentMode: "cash", isInterState: false,
      items: [{ productId: p, productName: "P", quantity: 3, rate: 100, gstRate: 18 }],
    });
    ok(createR);
    const invId = (createR as { invoice?: { id: string } }).invoice?.id;
    if (!invId) throw new Error("no invoice id");
    const r = await cancelInvoice(invId);
    ok(r);
    const [row] = await db.execute(sql`SELECT stock_quantity FROM products WHERE id = ${p}`) as unknown as [{ stock_quantity: number }];
    assert.equal(num(row.stock_quantity), 10, "stock restored after cancel");
  });
});

// ===========================================================================
// createKhataTransaction
// ===========================================================================
describe("createKhataTransaction", () => {
  it("credit transaction increases balance within limit", async () => {
    const c = cid();
    await insertCustomer(c, { cl: 5000 });
    const r = await createKhataTransaction({ customerId: c, type: "credit", amount: 2000, note: "test" });
    ok(r);
    assert("success" in r && r.success);
    const [row] = await db.execute(sql`SELECT current_balance FROM customers WHERE id = ${c}`) as unknown as [{ current_balance: number }];
    assert.equal(num(row.current_balance), 2000);
  });

  it("credit exceeding limit returns error", async () => {
    const c = cid();
    await insertCustomer(c, { cl: 1000, bal: 0 });
    const r = await createKhataTransaction({ customerId: c, type: "credit", amount: 2000, note: "" });
    err(r, "exceed");
  });

  it("debit allocates to pending invoices via FIFO", async () => {
    const c = cid(); const inv1 = iid(); const inv2 = iid();
    await insertCustomer(c, { cl: 5000, bal: 0 });
    await insertInvoice(inv1, c, { total: 300, pstatus: "paid_by_khata" });
    await insertInvoice(inv2, c, { total: 500, pstatus: "paid_by_khata" });
    const r = await createKhataTransaction({ customerId: c, type: "debit", amount: 400, note: "payment" });
    ok(r);
    const [r1] = await db.execute(sql`SELECT amount_paid, payment_status FROM invoices WHERE id = ${inv1}`) as unknown as [{ amount_paid: number; payment_status: string }];
    const [r2] = await db.execute(sql`SELECT amount_paid, payment_status FROM invoices WHERE id = ${inv2}`) as unknown as [{ amount_paid: number; payment_status: string }];
    assert.equal(num(r1.amount_paid), 300);
    assert.equal(r1.payment_status, "paid");
    assert.equal(num(r2.amount_paid), 100);
    assert.equal(r2.payment_status, "partial");
  });

  it("debit overpayment credits remaining to customer balance", async () => {
    const c = cid(); const inv = uid();
    await insertCustomer(c, { cl: 5000, bal: 0 });
    await insertInvoice(inv, c, { total: 100, pstatus: "paid_by_khata" });
    const r = await createKhataTransaction({ customerId: c, type: "debit", amount: 100, note: "payment" });
    ok(r);
    const [row] = await db.execute(sql`SELECT current_balance FROM customers WHERE id = ${c}`) as unknown as [{ current_balance: number }];
    assert.equal(num(row.current_balance), 0, "full payment clears balance");
  });

  it("non-existent customer returns error", async () => {
    const r = await createKhataTransaction({ customerId: "nonexistent", type: "credit", amount: 100, note: "" });
    err(r);
  });
});

// ===========================================================================
// chargeLateFees
// ===========================================================================
describe("chargeLateFees", () => {
  it("charges fee on single overdue invoice", async () => {
    const c = cid();
    await insertCustomer(c);
    await insertInvoice(iid(), c, { total: 1000, date: "2026-05-01" });
    const r = await chargeLateFees(c);
    ok(r);
  });

  it("charges fees on multiple overdue invoices", async () => {
    const c = cid();
    await insertCustomer(c);
    await insertInvoice(iid(), c, { total: 500, date: "2026-05-01" });
    await insertInvoice(iid(), c, { total: 300, date: "2026-05-01" });
    const r = await chargeLateFees(c);
    ok(r);
    assert("success" in r && r.success);
    assert((r as { charged?: number }).charged !== undefined);
  });

  it("within grace period charges no fee", async () => {
    const c = cid();
    await insertCustomer(c);
    await insertInvoice(iid(), c, { total: 1000, date: "2026-07-15" });
    const r = await chargeLateFees(c);
    ok(r);
    assert("success" in r && r.success);
    assert.equal((r as { charged?: number }).charged, 0, "no fee within grace period");
  });

  it("all paid invoices charge no fee", async () => {
    const c = cid();
    await insertCustomer(c);
    await insertInvoice(iid(), c, { total: 500, paid: 500, pstatus: "paid", pmode: "cash" });
    const r = await chargeLateFees(c);
    ok(r);
    assert("success" in r && r.success);
    assert.equal((r as { charged?: number }).charged, 0);
  });

  it("sets finesCollectedAt after charging", async () => {
    const c = cid();
    await insertCustomer(c);
    const inv = iid();
    await insertInvoice(inv, c, { total: 1000, date: "2026-05-01" });
    const r = await chargeLateFees(c);
    ok(r);
    assert("success" in r && r.success);
    assert((r as { charged?: number }).charged! > 0, "fee should apply");
    const [row] = await db.execute(sql`SELECT fines_collected_at FROM invoices WHERE id = ${inv}`) as unknown as [{ fines_collected_at: Date | null }];
    assert(row.fines_collected_at !== null, "fines_collected_at should be set after charging");
  });
});

// ===========================================================================
// deleteKhataTransaction
// ===========================================================================
describe("deleteKhataTransaction", () => {
  it("cancels debit transaction and reverses FIFO allocation", async () => {
    const c = cid(); const inv = uid();
    await insertCustomer(c, { bal: 0 });
    await insertInvoice(inv, c, { total: 500 });
    const createR = await createKhataTransaction({ customerId: c, type: "debit", amount: 500, note: "pay" });
    ok(createR);
    const txnId = (createR as { transaction?: { id: string } }).transaction?.id;
    if (!txnId) throw new Error("no txn id");
    const r = await deleteKhataTransaction(txnId);
    ok(r);
    assert("success" in r && r.success);
    const [row] = await db.execute(sql`SELECT amount_paid, payment_status FROM invoices WHERE id = ${inv}`) as unknown as [{ amount_paid: number; payment_status: string }];
    assert.equal(num(row.amount_paid), 0, "FIFO reversal should reset amount_paid");
    assert.equal(row.payment_status, "unpaid");
  });

  it("fails for already cancelled transaction", async () => {
    const c = cid();
    await insertCustomer(c);
    const createR = await createKhataTransaction({ customerId: c, type: "credit", amount: 100, note: "" });
    ok(createR);
    const txnId = (createR as { transaction?: { id: string } }).transaction?.id;
    if (!txnId) throw new Error("no txn id");
    const first = await deleteKhataTransaction(txnId);
    ok(first);
    const r = await deleteKhataTransaction(txnId);
    err(r, "cancelled");
  });

  it("cancels credit transaction and decreases balance", async () => {
    const c = cid();
    await insertCustomer(c, { bal: 0 });
    const createR = await createKhataTransaction({ customerId: c, type: "credit", amount: 500, note: "" });
    ok(createR);
    const txnId = (createR as { transaction?: { id: string } }).transaction?.id;
    if (!txnId) throw new Error("no txn id");
    const [before] = await db.execute(sql`SELECT current_balance FROM customers WHERE id = ${c}`) as unknown as [{ current_balance: number }];
    assert.equal(num(before.current_balance), 500, "balance increased by credit");
    const r = await deleteKhataTransaction(txnId);
    ok(r);
    assert("success" in r && r.success);
    const [after] = await db.execute(sql`SELECT current_balance FROM customers WHERE id = ${c}`) as unknown as [{ current_balance: number }];
    assert.equal(num(after.current_balance), 0, "balance returned to 0 after credit cancelled");
  });

  it("invoice-linked transaction returns error", async () => {
    const c = uid(); const p = uid();
    await insertCustomer(c); await insertProduct(p);
    const createR = await createInvoice({
      customerId: c, customerName: "T", invoiceDate: "2026-07-01",
      paymentMode: "khata", isInterState: false,
      items: [{ productId: p, productName: "P", quantity: 1, rate: 100, gstRate: 18 }],
    });
    ok(createR);
    const invId = (createR as { invoice?: { id: string } }).invoice?.id;
    if (!invId) throw new Error("no invoice id");
    const cancelR = await cancelInvoice(invId);
    ok(cancelR);
    const linkedTxn = await db.execute(
      sql`SELECT id FROM khata_transactions WHERE reference_invoice_id = ${invId} LIMIT 1`
    ) as unknown as { id: string }[];
    if (!linkedTxn.length) throw new Error("no linked txn found");
    const r = await deleteKhataTransaction(linkedTxn[0].id);
    err(r, "Cannot cancel invoice-linked");
  });
});

// ===========================================================================
// resetCustomerKhata
// ===========================================================================
describe("resetCustomerKhata", () => {
  it("zeroes balance and archives invoices", async () => {
    const c = cid();
    await insertCustomer(c, { bal: 3000 });
    await insertInvoice(iid(), c, { total: 1000 });
    const r = await resetCustomerKhata(c, true);
    ok(r);
    const [cust] = await db.execute(sql`SELECT current_balance FROM customers WHERE id = ${c}`) as unknown as [{ current_balance: number }];
    assert.equal(num(cust.current_balance), 0);
    const [invRow] = await db.execute(sql`SELECT status FROM invoices WHERE customer_id = ${c} LIMIT 1`) as unknown as [{ status: string }];
    assert.equal(invRow.status, "archived");
  });

  it("already-zero balance is a no-op", async () => {
    const c = cid();
    await insertCustomer(c, { bal: 0 });
    await insertInvoice(uid(), c, { total: 500, paid: 500, pstatus: "paid", pmode: "cash" });
    const r = await resetCustomerKhata(c, true);
    ok(r);
  });

  it("creates reset record in khata_resets", async () => {
    const c = cid();
    await insertCustomer(c, { bal: 2000 });
    await insertInvoice(iid(), c, { total: 1000 });
    await insertInvoice(iid(), c, { total: 500 });
    const r = await resetCustomerKhata(c, true);
    ok(r);
    const resets = await db.execute(
      sql`SELECT amount_reset, invoice_count FROM khata_resets WHERE customer_id = ${c} AND business_id = ${BIZ} ORDER BY created_at DESC LIMIT 1`
    ) as unknown as { amount_reset: number; invoice_count: number }[];
    assert.equal(resets.length, 1, "reset record should exist");
    assert.equal(num(resets[0].amount_reset), 3500, "amount_reset should match prior balance (2000 initial + 1000 + 500 from invoices)");
    assert.equal(resets[0].invoice_count, 2, "invoice_count should match number of active invoices");
  });
});

// ===========================================================================
// recalculateCustomerBalance
// ===========================================================================
describe("recalculateCustomerBalance", () => {
  it("matches sum of active transactions", async () => {
    const c = cid();
    await insertCustomer(c, { bal: 0 });
    await createKhataTransaction({ customerId: c, type: "credit", amount: 1000, note: "" });
    await createKhataTransaction({ customerId: c, type: "credit", amount: 500, note: "" });
    const r = await recalculateCustomerBalance(c);
    ok(r);
    assert("success" in r && r.success);
    assert.equal((r as { newBalance?: number }).newBalance, 1500);
  });

  it("excludes cancelled transactions", async () => {
    const c = cid();
    await insertCustomer(c, { bal: 0 });
    const t1 = await createKhataTransaction({ customerId: c, type: "credit", amount: 2000, note: "" });
    ok(t1);
    const txnId = (t1 as { transaction?: { id: string } }).transaction?.id;
    if (txnId) await deleteKhataTransaction(txnId);
    const r = await recalculateCustomerBalance(c);
    ok(r);
    assert("success" in r && r.success);
    assert.equal((r as { newBalance?: number }).newBalance, 0, "cancelled txn excluded");
  });

  it("complex sequence of credits and debits", async () => {
    const c = cid();
    await insertCustomer(c, { bal: 0 });
    await createKhataTransaction({ customerId: c, type: "credit", amount: 1000, note: "" });
    await createKhataTransaction({ customerId: c, type: "credit", amount: 500, note: "" });
    const d1 = await createKhataTransaction({ customerId: c, type: "debit", amount: 300, note: "" });
    ok(d1);
    const d1Id = (d1 as { transaction?: { id: string } }).transaction?.id;
    if (d1Id) await deleteKhataTransaction(d1Id);
    await createKhataTransaction({ customerId: c, type: "credit", amount: 200, note: "" });
    const r = await recalculateCustomerBalance(c);
    ok(r);
    assert("success" in r && r.success);
    assert.equal((r as { newBalance?: number }).newBalance, 1700, "1000+500-300+300+200 = 1700 after debit reversed");
  });
});
