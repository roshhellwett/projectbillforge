-- Production hardening. This migration is intentionally idempotent so it can
-- repair databases that already recorded an earlier, incomplete migration.
ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "chk_customers_balance_non_negative";
--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "email_verified" timestamp;
--> statement-breakpoint
ALTER TABLE "verification_tokens"
  ADD COLUMN IF NOT EXISTS "purpose" text NOT NULL DEFAULT 'email_verification';
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

CREATE INDEX IF NOT EXISTS "idx_verification_tokens_purpose_expires"
  ON "verification_tokens" USING btree ("purpose", "expires");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customers_business_name"
  ON "customers" USING btree ("business_id", "name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_business_created"
  ON "invoices" USING btree ("business_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_customer_date"
  ON "invoices" USING btree ("customer_id", "invoice_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_khata_customer_created"
  ON "khata_transactions" USING btree ("customer_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_business_name"
  ON "products" USING btree ("business_id", "name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_products_business_active"
  ON "products" USING btree ("business_id", "is_active");
