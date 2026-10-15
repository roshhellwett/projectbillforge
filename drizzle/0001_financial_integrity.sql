-- Phase 0: Fix schema drift — add missing columns, drop dead columns (idempotent)
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "email_verified" timestamp;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "khata_resets" (
  "id" text PRIMARY KEY NOT NULL,
  "business_id" text NOT NULL,
  "customer_id" text NOT NULL,
  "reset_date" timestamp DEFAULT now() NOT NULL,
  "amount_reset" numeric(10, 2) NOT NULL,
  "invoice_count" integer DEFAULT 0 NOT NULL,
  "consent_accepted" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'khata_resets_business_id_businesses_id_fk'
  ) THEN
    ALTER TABLE "khata_resets" ADD CONSTRAINT "khata_resets_business_id_businesses_id_fk"
      FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'khata_resets_customer_id_customers_id_fk'
  ) THEN
    ALTER TABLE "khata_resets" ADD CONSTRAINT "khata_resets_customer_id_customers_id_fk"
      FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
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

-- Phase 0: Remove obsolete balance guard and normalize invoice constraints.
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "chk_invoices_amount_paid";
--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "chk_customers_balance_non_negative";
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
