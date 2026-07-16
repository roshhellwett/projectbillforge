import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { db } from "../../lib/db";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRIZZLE_DIR = join(__dirname, "../../drizzle");

export async function runMigrations(): Promise<void> {
  const files = ["0000_big_wolfpack.sql", "0001_financial_integrity.sql"];

  for (const file of files) {
    const sql = readFileSync(join(DRIZZLE_DIR, file), "utf-8");
    const statements = sql
      .split("--> statement-breakpoint")
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      try {
        await db.execute(stmt);
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === '42P07') continue;
        if (typeof e === 'object' && e !== null && 'message' in e) {
          const msg = (e as { message: string }).message;
          if (msg?.includes('already exists')) continue;
        }
        throw e;
      }
    }
  }
}

export async function cleanDatabase(): Promise<void> {
  const tables = [
    "audit_log", "idempotency_keys", "rate_limits",
    "khata_transactions", "invoices", "khata_resets",
    "products", "customers", "accounts", "verification_tokens",
    "businesses",
  ];
  for (const table of tables) {
    await db.execute(`DROP TABLE IF EXISTS "${table}" CASCADE`);
  }
}

const TEST_BUSINESS_ID = "test-business-001";
const TEST_CUSTOMER_ID = "test-customer-001";
const TEST_PRODUCT_ID = "test-product-001";

export function getTestIds() {
  return {
    businessId: TEST_BUSINESS_ID,
    customerId: TEST_CUSTOMER_ID,
    productId: TEST_PRODUCT_ID,
  };
}

export async function seedBaseData(): Promise<void> {
  await db.execute(
    `INSERT INTO "businesses" ("id", "name", "email", "password_hash", "address", "phone", "state")
     VALUES ('${TEST_BUSINESS_ID}', 'Test Business', 'test@billforge.local',
             '$2a$10$dummy_hash_for_testing', '123 Test St', '9876543210', 'Maharashtra')`
  );

  await db.execute(
    `INSERT INTO "customers" ("id", "business_id", "name", "phone", "credit_limit", "current_balance")
     VALUES ('${TEST_CUSTOMER_ID}', '${TEST_BUSINESS_ID}', 'Test Customer', '9876543210', 5000, 0)`
  );

  await db.execute(
    `INSERT INTO "products" ("id", "business_id", "name", "sku", "rate", "gst_rate", "stock_quantity", "low_stock_threshold")
     VALUES ('${TEST_PRODUCT_ID}', '${TEST_BUSINESS_ID}', 'Test Product', 'TST-001', 100, 18, 100, 10)`
  );
}
