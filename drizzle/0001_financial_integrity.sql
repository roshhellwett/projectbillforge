-- Phase 0: Fix schema drift — add missing columns, drop dead columns (idempotent)
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "fines_collected_at" timestamp;
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "notes";
--> statement-breakpoint
ALTER TABLE "khata_transactions" ADD COLUMN IF NOT EXISTS "payment_method" text;
--> statement-breakpoint

-- Phase 0: Add missing indexes (idempotent via IF NOT EXISTS)
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customers_business_balance" ON "customers" USING btree ("business_id","current_balance");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_business_status" ON "invoices" USING btree ("business_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_resets_customer" ON "khata_resets" USING btree ("customer_id");
--> statement-breakpoint

-- Phase 0: CHECK constraints for data integrity (drop existing first to re-add safely)
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "chk_invoices_amount_paid";
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "chk_invoices_amount_paid" CHECK ("amount_paid" <= "total");
--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "chk_customers_balance_non_negative";
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "chk_customers_balance_non_negative" CHECK ("current_balance" >= 0);
--> statement-breakpoint

-- Phase 0: Idempotency keys table (Phase 2.4)
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "idempotency_keys" (
	"key" text PRIMARY KEY NOT NULL,
	"response" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint

-- Phase 0: Audit log table (Phase 2.6)
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"action_type" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"previous_state" jsonb,
	"new_state" jsonb,
	"delta" jsonb,
	"created_by" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'audit_log_business_id_businesses_id_fk'
  ) THEN
    ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_business_id_businesses_id_fk"
      FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE CASCADE;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_business_created" ON "audit_log" USING btree ("business_id","created_at");
