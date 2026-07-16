import test from "node:test";
import assert from "node:assert/strict";
import { allocatePaymentAcrossInvoices, calculateLateFee } from "../lib/accounting.ts";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

type InvoiceState = {
  id: string;
  total: number;
  amountPaid: number;
  status: "unpaid" | "partial" | "paid";
};

type CustomerState = {
  id: string;
  balance: number;
  invoices: InvoiceState[];
};

function totalDue(c: CustomerState): number {
  return c.invoices.reduce((s, i) => s + (i.total - i.amountPaid), 0);
}

function totalPaid(c: CustomerState): number {
  return c.invoices.reduce((s, i) => s + i.amountPaid, 0);
}

function checkInvariants(c: CustomerState): string[] {
  const errors: string[] = [];
  for (const inv of c.invoices) {
    if (inv.amountPaid > inv.total) {
      errors.push(`Overpaid invoice ${inv.id}: paid ${inv.amountPaid} > total ${inv.total}`);
    }
    if (inv.amountPaid < 0) {
      errors.push(`Negative amountPaid on ${inv.id}: ${inv.amountPaid}`);
    }
  }
  return errors;
}

test("Property: Random 100-operation sequences maintain invariants", () => {
  const rand = seededRandom(42);

  let nextId = 4;

  for (let seed = 0; seed < 5; seed++) {
    const srand = seededRandom(seed * 9999 + 7);
    const customer: CustomerState = {
      id: "prop-cust-1",
      balance: 0,
      invoices: [
        { id: "a", total: 1000, amountPaid: 0, status: "unpaid" },
        { id: "b", total: 5000, amountPaid: 2000, status: "partial" },
        { id: "c", total: 3000, amountPaid: 0, status: "unpaid" },
        { id: "d", total: 8000, amountPaid: 8000, status: "paid" },
      ],
    };

    for (let op = 0; op < 100; op++) {
      const opType = Math.floor(srand() * 3);

      if (opType === 0) {
        const payAmount = Math.floor(srand() * 5000) + 100;
        const pendingInvoices = customer.invoices
          .filter(i => i.status !== "paid")
          .map(i => ({ id: i.id, total: i.total, amountPaid: i.amountPaid }));
        if (pendingInvoices.length === 0) continue;
        const allocation = allocatePaymentAcrossInvoices(pendingInvoices, payAmount);
        for (const update of allocation.updates) {
          const inv = customer.invoices.find(i => i.id === update.id);
          if (inv) {
            inv.amountPaid = update.amountPaid;
            inv.status = update.status;
          }
        }
      } else if (opType === 1) {
        if (customer.invoices.length > 10) continue;
        const id = String.fromCharCode(97 + nextId);
        nextId++;
        const total = (Math.floor(srand() * 50) + 1) * 100;
        customer.invoices.push({ id, total, amountPaid: 0, status: "unpaid" });
      } else {
        if (customer.invoices.length <= 1) continue;
        const idx = Math.floor(srand() * customer.invoices.length);
        customer.invoices.splice(idx, 1);
      }

      const errors = checkInvariants(customer);
      if (errors.length > 0) {
        assert.fail(`Seed ${seed}, op ${op}: ${errors.join("; ")}`);
      }
    }
  }
});

test("Property: Late fee calculation never produces negative or NaN", () => {
  const rand = seededRandom(12345);
  for (let i = 0; i < 50; i++) {
    const total = Math.floor(rand() * 100000) + 1;
    const amountPaid = Math.floor(rand() * total);
    const daysSinceInvoice = Math.floor(rand() * 365);
    const redemptionDays = Math.floor(rand() * 60) + 1;
    const finePct = Math.floor(rand() * 20) + 1;
    const freqDays = Math.floor(rand() * 30) + 1;

    const invoiceDate = new Date("2026-01-01");
    const asOfDate = new Date(invoiceDate);
    asOfDate.setDate(asOfDate.getDate() + daysSinceInvoice);

    const fee = calculateLateFee(
      {
        invoiceDate: "2026-01-01",
        paymentStatus: "unpaid",
        total,
        amountPaid,
      },
      { redemptionPeriodDays: redemptionDays, finePercentage: finePct, fineFrequencyDays: freqDays },
      asOfDate
    );

    assert.ok(!isNaN(fee), `Fee is NaN for params: total=${total}, paid=${amountPaid}, days=${daysSinceInvoice}`);
    assert.ok(fee >= 0, `Fee is negative: ${fee}`);
    const maxPeriods = Math.max(1, Math.floor(daysSinceInvoice / freqDays));
    const maxExpectedFee = total * (finePct / 100) * maxPeriods;
    assert.ok(fee <= maxExpectedFee + 0.01, `Fee ${fee} exceeds max ${maxExpectedFee} (total=${total}, pct=${finePct}%, days=${daysSinceInvoice})`);
  }
});
