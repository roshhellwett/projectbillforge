import { Decimal } from "decimal.js";
import { db } from "@/lib/db";
import { customers, khataTransactions } from "@/lib/schema";
import { eq, sql, and } from "drizzle-orm";

export type ReconciliationResult = {
  customerId: string;
  storedBalance: number;
  computedBalance: number;
  discrepancy: number;
  fixed: boolean;
};

export async function reconcileCustomerBalance(
  customerId: string,
  autoFix: boolean = false
): Promise<ReconciliationResult> {
  const [customer] = await db.execute(
    sql`SELECT id, current_balance, business_id FROM customers WHERE id = ${customerId}`
  ) as unknown as { id: string; current_balance: number | null; business_id: string }[];

  if (!customer) {
    throw new Error(`Customer not found: ${customerId}`);
  }

  const storedBalance = Number(customer.current_balance ?? 0);

  const [balanceResult] = await db.execute(
    sql`
      SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0)
           - COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) AS computed_balance
      FROM khata_transactions
      WHERE customer_id = ${customerId} AND status = 'active'
    `
  ) as unknown as [{ computed_balance: number | null }];

  const computedBalance = Number(balanceResult?.computed_balance ?? 0);
  const discrepancy = new Decimal(computedBalance).minus(storedBalance).toDecimalPlaces(2).toNumber();

  let fixed = false;
  if (Math.abs(discrepancy) > 0.01 && autoFix) {
    await db.update(customers)
      .set({ currentBalance: computedBalance, updatedAt: new Date() })
      .where(eq(customers.id, customerId));

    const auditId = crypto.randomUUID();
    await db.execute(sql`
      INSERT INTO audit_log (id, business_id, action_type, entity_type, entity_id, previous_state, new_state, delta)
      VALUES (${auditId}, ${customer.business_id}, 'balance_reconciliation', 'customer', ${customerId},
              ${JSON.stringify({ currentBalance: storedBalance })},
              ${JSON.stringify({ currentBalance: computedBalance })},
              ${JSON.stringify({ discrepancy })})
    `);

    fixed = true;
  }

  return { customerId, storedBalance, computedBalance, discrepancy, fixed };
}

export async function reconcileAllCustomerBalances(
  businessId: string,
  autoFix: boolean = false
): Promise<{ results: ReconciliationResult[]; totalDiscrepancy: number }> {
  const customerRows = await db.execute(
    sql`SELECT id FROM customers WHERE business_id = ${businessId}`
  ) as unknown as { id: string }[];

  const results: ReconciliationResult[] = [];
  let totalDiscrepancy = 0;

  for (const row of customerRows) {
    const result = await reconcileCustomerBalance(row.id, autoFix);
    results.push(result);
    totalDiscrepancy += Math.abs(result.discrepancy);
  }

  return { results, totalDiscrepancy: new Decimal(totalDiscrepancy).toDecimalPlaces(2).toNumber() };
}
