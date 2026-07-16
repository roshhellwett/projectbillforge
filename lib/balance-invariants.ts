import { Decimal } from "decimal.js";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

const VERIFY_INTEGRITY = process.env.VERIFY_INTEGRITY !== "false";

export class BalanceInvariantError extends Error {
  constructor(
    message: string,
    public readonly details: Record<string, unknown>
  ) {
    super(message);
    this.name = "BalanceInvariantError";
  }
}

export async function assertCustomerBalanceConsistent(
  tx: any,
  customerId: string
): Promise<void> {
  if (!VERIFY_INTEGRITY) return;

  const customerRows = await tx.execute(
    sql`SELECT id, current_balance FROM customers WHERE id = ${customerId}`
  ) as unknown as { id: string; current_balance: number | null }[];

  if (customerRows.length === 0) return;

  const storedBalance = new Decimal(customerRows[0].current_balance ?? 0);

  const [balanceResult] = await tx.execute(
    sql`
      SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0)
           - COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) AS computed_balance
      FROM khata_transactions
      WHERE customer_id = ${customerId} AND status = 'active'
    `
  ) as unknown as [{ computed_balance: number | null }];

  const computedBalance = new Decimal(balanceResult?.computed_balance ?? 0);

  if (!storedBalance.equals(computedBalance)) {
    throw new BalanceInvariantError(
      `Customer balance mismatch: stored=${storedBalance.toFixed(2)}, computed=${computedBalance.toFixed(2)}`,
      { customerId, storedBalance: storedBalance.toNumber(), computedBalance: computedBalance.toNumber() }
    );
  }
}

export async function assertNoOverpaidInvoices(
  tx: any,
  customerId: string
): Promise<void> {
  if (!VERIFY_INTEGRITY) return;

  const [result] = await tx.execute(
    sql`
      SELECT COUNT(*)::int AS cnt
      FROM invoices
      WHERE customer_id = ${customerId} AND amount_paid > total AND status = 'active'
    `
  ) as unknown as [{ cnt: number }];

  if (result && result.cnt > 0) {
    const overpaidRows = await tx.execute(
      sql`
        SELECT id, invoice_number, total, amount_paid
        FROM invoices
        WHERE customer_id = ${customerId} AND amount_paid > total AND status = 'active'
      `
    ) as unknown as { id: string; invoice_number: string; total: number; amount_paid: number }[];

    throw new BalanceInvariantError(
      `${result.cnt} overpaid invoice(s) found for customer`,
      { customerId, overpaidInvoices: overpaidRows }
    );
  }
}

export async function assertTotalReceivablesMatch(
  tx: any,
  businessId: string
): Promise<void> {
  if (!VERIFY_INTEGRITY) return;

  const [balanceSumResult] = await tx.execute(
    sql`
      SELECT COALESCE(SUM(current_balance), 0) AS total_balance
      FROM customers
      WHERE business_id = ${businessId}
    `
  ) as unknown as [{ total_balance: number | null }];

  const [receivablesResult] = await tx.execute(
    sql`
      SELECT COALESCE(SUM(total - amount_paid), 0) AS total_receivable
      FROM invoices
      WHERE business_id = ${businessId} AND status = 'active'
        AND payment_status IN ('unpaid', 'partial', 'paid_by_khata')
    `
  ) as unknown as [{ total_receivable: number | null }];

  const totalBalance = new Decimal(balanceSumResult?.total_balance ?? 0);
  const totalReceivable = new Decimal(receivablesResult?.total_receivable ?? 0);
  const diff = totalBalance.minus(totalReceivable).abs();

  if (diff.greaterThan(1)) {
    throw new BalanceInvariantError(
      `Total receivables mismatch: customer_balances=${totalBalance.toFixed(2)}, invoice_outstanding=${totalReceivable.toFixed(2)}, diff=${diff.toFixed(2)}`,
      { businessId, totalBalance: totalBalance.toNumber(), totalReceivable: totalReceivable.toNumber(), diff: diff.toNumber() }
    );
  }
}

export async function verifyAll(
  tx: any,
  businessId: string,
  customerIds?: string[]
): Promise<{ passed: boolean; errors: BalanceInvariantError[] }> {
  const errors: BalanceInvariantError[] = [];

  try {
    await assertTotalReceivablesMatch(tx, businessId);
  } catch (e) {
    if (e instanceof BalanceInvariantError) errors.push(e);
    else throw e;
  }

  const targetCustomers = customerIds ?? (
    await tx.execute(
      sql`SELECT id FROM customers WHERE business_id = ${businessId}`
    )
  ).map((r: any) => r.id);

  for (const cid of targetCustomers) {
    try {
      await assertCustomerBalanceConsistent(tx, cid);
    } catch (e) {
      if (e instanceof BalanceInvariantError) errors.push(e);
      else throw e;
    }
    try {
      await assertNoOverpaidInvoices(tx, cid);
    } catch (e) {
      if (e instanceof BalanceInvariantError) errors.push(e);
      else throw e;
    }
  }

  return { passed: errors.length === 0, errors };
}
