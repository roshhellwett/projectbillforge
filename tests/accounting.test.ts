import test from "node:test";
import assert from "node:assert/strict";
import { allocatePaymentAcrossInvoices, calculateLateFee } from "../lib/accounting.ts";

test("allocatePaymentAcrossInvoices allocates payment in FIFO order", () => {
  const result = allocatePaymentAcrossInvoices(
    [
      { id: "inv-1", total: 100, amountPaid: 20 },
      { id: "inv-2", total: 150, amountPaid: 0 },
    ],
    200
  );

  assert.deepEqual(result.updates, [
    { id: "inv-1", amountPaid: 100, status: "paid" },
    { id: "inv-2", amountPaid: 120, status: "partial" },
  ]);
  assert.equal(result.remaining, 0);
});

test("allocatePaymentAcrossInvoices keeps leftover payment when invoices are fully settled", () => {
  const result = allocatePaymentAcrossInvoices(
    [{ id: "inv-1", total: 50, amountPaid: 0 }],
    80
  );

  assert.deepEqual(result.updates, [
    { id: "inv-1", amountPaid: 50, status: "paid" },
  ]);
  assert.equal(result.remaining, 30);
});

test("calculateLateFee returns zero during grace period", () => {
  const fine = calculateLateFee(
    {
      invoiceDate: "2026-01-01",
      paymentStatus: "unpaid",
      total: 1000,
      amountPaid: 0,
    },
    {
      redemptionPeriodDays: 30,
      finePercentage: 2,
      fineFrequencyDays: 7,
    },
    new Date("2026-01-20")
  );

  assert.equal(fine, 0);
});

test("calculateLateFee uses outstanding amount and frequency periods", () => {
  const fine = calculateLateFee(
    {
      invoiceDate: "2026-01-01",
      paymentStatus: "partial",
      total: 1000,
      amountPaid: 200,
    },
    {
      redemptionPeriodDays: 30,
      finePercentage: 5,
      fineFrequencyDays: 10,
    },
    new Date("2026-03-02")
  );

  
  assert.equal(fine, 120);
});

test("calculateLateFee returns zero for paid invoices", () => {
  const fine = calculateLateFee(
    {
      invoiceDate: "2026-01-01",
      paymentStatus: "paid",
      total: 1000,
      amountPaid: 1000,
    },
    {
      redemptionPeriodDays: 30,
      finePercentage: 5,
      fineFrequencyDays: 10,
    },
    new Date("2026-03-02")
  );

  assert.equal(fine, 0);
});

test("calculateLateFee with lastFeeDate starts calculation from last fee date", () => {
  const fine = calculateLateFee(
    {
      invoiceDate: "2026-01-01",
      paymentStatus: "unpaid",
      total: 10000,
      amountPaid: 0,
    },
    { redemptionPeriodDays: 30, finePercentage: 2, fineFrequencyDays: 7 },
    new Date("2026-04-01"),
    new Date("2026-03-01")
  );

  assert.equal(fine, 800);
});

test("calculateLateFee with lastFeeDate before dueDate uses dueDate as start", () => {
  const fine = calculateLateFee(
    {
      invoiceDate: "2026-03-01",
      paymentStatus: "unpaid",
      total: 10000,
      amountPaid: 0,
    },
    { redemptionPeriodDays: 10, finePercentage: 2, fineFrequencyDays: 7 },
    new Date("2026-04-01"),
    new Date("2026-01-01")
  );

  assert.equal(fine, 600);
});

test("calculateLateFee returns zero when lastFeeDate equals asOfDate", () => {
  const asOf = new Date("2026-04-01");
  const fine = calculateLateFee(
    {
      invoiceDate: "2026-01-01",
      paymentStatus: "unpaid",
      total: 10000,
      amountPaid: 0,
    },
    { redemptionPeriodDays: 30, finePercentage: 2, fineFrequencyDays: 7 },
    asOf,
    asOf
  );

  assert.equal(fine, 0);
});

test("allocatePaymentAcrossInvoices handles empty invoice list", () => {
  const result = allocatePaymentAcrossInvoices([], 1000);
  assert.deepEqual(result.updates, []);
  assert.equal(result.remaining, 1000);
});

test("allocatePaymentAcrossInvoices skips already paid invoices", () => {
  const result = allocatePaymentAcrossInvoices(
    [
      { id: "inv-1", total: 100, amountPaid: 100 },
      { id: "inv-2", total: 200, amountPaid: 0 },
    ],
    150
  );

  assert.deepEqual(result.updates, [
    { id: "inv-2", amountPaid: 150, status: "partial" },
  ]);
  assert.equal(result.remaining, 0);
});

test("allocatePaymentAcrossInvoices handles overpayment correctly", () => {
  const result = allocatePaymentAcrossInvoices(
    [
      { id: "inv-1", total: 100, amountPaid: 0 },
      { id: "inv-2", total: 200, amountPaid: 0 },
    ],
    500
  );

  assert.deepEqual(result.updates, [
    { id: "inv-1", amountPaid: 100, status: "paid" },
    { id: "inv-2", amountPaid: 200, status: "paid" },
  ]);
  assert.equal(result.remaining, 200);
});

test("allocatePaymentAcrossInvoices maintains FIFO order across 3 invoices", () => {
  const result = allocatePaymentAcrossInvoices(
    [
      { id: "inv-1", total: 300, amountPaid: 0 },
      { id: "inv-2", total: 200, amountPaid: 50 },
      { id: "inv-3", total: 500, amountPaid: 0 },
    ],
    600
  );

  const inv1 = result.updates.find(u => u.id === "inv-1")!;
  const inv2 = result.updates.find(u => u.id === "inv-2")!;
  const inv3 = result.updates.find(u => u.id === "inv-3")!;

  assert.equal(inv1.amountPaid, 300);
  assert.equal(inv1.status, "paid");
  assert.equal(inv2.amountPaid, 200);
  assert.equal(inv2.status, "paid");
  assert.equal(inv3.amountPaid, 150);
  assert.equal(inv3.status, "partial");
  assert.equal(result.remaining, 0);
});
