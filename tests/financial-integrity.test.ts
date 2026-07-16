import test from "node:test";
import assert from "node:assert/strict";
import { allocatePaymentAcrossInvoices, calculateLateFee } from "../lib/accounting.ts";

test("Financial Integrity: FIFO allocation across 3 invoices with partial payments", () => {
  const invoices = [
    { id: "inv-1", total: 5000, amountPaid: 1000 },
    { id: "inv-2", total: 8000, amountPaid: 0 },
    { id: "inv-3", total: 3000, amountPaid: 0 },
  ];

  const totalDue = invoices.reduce((s, i) => s + (i.total - (i.amountPaid ?? 0)), 0);
  assert.equal(totalDue, 15000);

  const payment = 9000;
  const allocation = allocatePaymentAcrossInvoices(invoices, payment);

  assert.equal(allocation.remaining, 0);

  const inv1 = allocation.updates.find(u => u.id === "inv-1")!;
  const inv2 = allocation.updates.find(u => u.id === "inv-2")!;

  assert.equal(inv1.amountPaid, 5000);
  assert.equal(inv1.status, "paid");

  assert.equal(inv2.amountPaid, 5000);
  assert.equal(inv2.status, "partial");

  const allocatedToInv1 = inv1.amountPaid - 1000;
  const allocatedToInv2 = inv2.amountPaid - 0;
  assert.equal(allocatedToInv1 + allocatedToInv2, 9000);

  const outstandingAfter = (5000 - inv1.amountPaid) + (8000 - inv2.amountPaid) + (3000 - 0);
  assert.equal(outstandingAfter, 6000);
});

test("Financial Integrity: Late fee recurring across multiple cycles", () => {
  const invoice = {
    invoiceDate: "2026-01-01",
    paymentStatus: "unpaid" as const,
    total: 50000,
    amountPaid: 0,
  };

  const settings = {
    redemptionPeriodDays: 30,
    finePercentage: 2,
    fineFrequencyDays: 7,
  };

  const cycle1AsOf = new Date("2026-02-15");
  const fee1 = calculateLateFee(invoice, settings, cycle1AsOf);
  assert.equal(fee1, 2000);

  const cycle2AsOf = new Date("2026-03-15");
  const fee2 = calculateLateFee(invoice, settings, cycle2AsOf, cycle1AsOf);
  assert.equal(fee2, 4000);

  const cycle3AsOf = new Date("2026-04-15");
  const fee3 = calculateLateFee(invoice, settings, cycle3AsOf, cycle2AsOf);
  assert.equal(fee3, 4000);

  const totalFees = fee1 + fee2 + fee3;
  assert.equal(totalFees, 10000);
});

test("Financial Integrity: Multiple invoices FIFO with varying prior payments", () => {
  const invoices = [
    { id: "a", total: 1000, amountPaid: 0 },
    { id: "b", total: 500, amountPaid: 200 },
    { id: "c", total: 2000, amountPaid: 500 },
    { id: "d", total: 1000, amountPaid: 0 },
  ];

  const payment = 2000;
  const allocation = allocatePaymentAcrossInvoices(invoices, payment);

  assert.equal(allocation.updates.length, 3);
  assert.equal(allocation.remaining, 0);

  const a = allocation.updates.find(u => u.id === "a")!;
  const b = allocation.updates.find(u => u.id === "b")!;
  const c = allocation.updates.find(u => u.id === "c")!;

  assert.equal(a.amountPaid, 1000);
  assert.equal(a.status, "paid");

  assert.equal(b.amountPaid, 500);
  assert.equal(b.status, "paid");

  assert.equal(c.amountPaid, 1200);
  assert.equal(c.status, "partial");
});

test("Financial Integrity: Empty payment does nothing", () => {
  const invoices = [
    { id: "inv-1", total: 1000, amountPaid: 0 },
  ];
  const allocation = allocatePaymentAcrossInvoices(invoices, 0);

  assert.deepEqual(allocation.updates, []);
  assert.equal(allocation.remaining, 0);
});

test("Financial Integrity: Large overpayment returns full remaining", () => {
  const invoices = [
    { id: "a", total: 500, amountPaid: 0 },
  ];
  const allocation = allocatePaymentAcrossInvoices(invoices, 10000);

  assert.equal(allocation.updates.length, 1);
  assert.equal(allocation.updates[0].amountPaid, 500);
  assert.equal(allocation.updates[0].status, "paid");
  assert.equal(allocation.remaining, 9500);
});

test("Financial Integrity: All-zero total invoices handled gracefully", () => {
  const invoices = [
    { id: "a", total: 0, amountPaid: 0 },
    { id: "b", total: 100, amountPaid: 0 },
  ];
  const allocation = allocatePaymentAcrossInvoices(invoices, 50);

  assert.equal(allocation.updates.length, 1);
  assert.equal(allocation.updates[0].id, "b");
  assert.equal(allocation.updates[0].amountPaid, 50);
});
