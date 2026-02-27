import { Decimal } from "decimal.js";

export type PendingInvoiceAllocationInput = {
  id: string;
  total: number | null;
  amount_paid?: number | null;
  amountPaid?: number | null;
};

export type InvoiceAllocationUpdate = {
  id: string;
  amountPaid: number;
  status: "paid" | "partial";
};

export function allocatePaymentAcrossInvoices(
  invoices: PendingInvoiceAllocationInput[],
  paymentAmount: Decimal.Value
): { updates: InvoiceAllocationUpdate[]; remaining: number } {
  let remainingPayment = new Decimal(paymentAmount).toDecimalPlaces(2);
  const updates: InvoiceAllocationUpdate[] = [];

  for (const invoice of invoices) {
    if (remainingPayment.lessThanOrEqualTo(0)) break;

    const total = new Decimal(invoice.total || 0);
    const alreadyPaid = new Decimal(invoice.amountPaid ?? invoice.amount_paid ?? 0);
    const due = total.minus(alreadyPaid);

    if (due.lessThanOrEqualTo(0)) continue;

    if (remainingPayment.greaterThanOrEqualTo(due)) {
      updates.push({
        id: invoice.id,
        amountPaid: total.toDecimalPlaces(2).toNumber(),
        status: "paid",
      });
      remainingPayment = remainingPayment.minus(due);
    } else {
      updates.push({
        id: invoice.id,
        amountPaid: alreadyPaid.plus(remainingPayment).toDecimalPlaces(2).toNumber(),
        status: "partial",
      });
      remainingPayment = new Decimal(0);
    }
  }

  return { updates, remaining: remainingPayment.toDecimalPlaces(2).toNumber() };
}

export type LateFeeInvoiceInput = {
  invoiceDate: string;
  paymentStatus: string | null;
  total: number | null;
  amountPaid?: number | null;
  amount_paid?: number | null;
};

export type LateFeeBusinessSettings = {
  redemptionPeriodDays: number | null;
  finePercentage: number | null;
  fineFrequencyDays: number | null;
};

export function calculateLateFee(
  invoice: LateFeeInvoiceInput,
  business: LateFeeBusinessSettings,
  asOfDate: Date = new Date()
): number {
  if (!business.redemptionPeriodDays || !business.finePercentage || !business.fineFrequencyDays) {
    return 0;
  }
  if (invoice.paymentStatus !== "unpaid" && invoice.paymentStatus !== "partial") {
    return 0;
  }

  const invoiceDate = new Date(invoice.invoiceDate);
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + business.redemptionPeriodDays);

  if (asOfDate <= dueDate) return 0;

  const daysOverdue = Math.floor((asOfDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const periods = Math.floor(daysOverdue / business.fineFrequencyDays);
  if (periods <= 0) return 0;

  const total = new Decimal(invoice.total || 0);
  const paid = new Decimal(invoice.amountPaid ?? invoice.amount_paid ?? 0);
  const outstanding = Decimal.max(0, total.minus(paid));

  return outstanding
    .times(new Decimal(business.finePercentage).div(100))
    .times(periods)
    .toDecimalPlaces(2)
    .toNumber();
}
