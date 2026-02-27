import test from "node:test";
import assert from "node:assert/strict";
import { allocatePaymentAcrossInvoices, calculateLateFee } from "../lib/accounting.ts";

test("allocatePaymentAcrossInvoices allocates payment in FIFO order", () => {
  const result = allocatePaymentAcrossInvoices(
    [
      { id: "inv-1", total: 100, amount_paid: 20 },
      { id: "inv-2", total: 150, amount_paid: 0 },
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
    [{ id: "inv-1", total: 50, amount_paid: 0 }],
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

  // Outstanding = 800, overdue periods = 3, fine = 800 * 0.05 * 3
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
