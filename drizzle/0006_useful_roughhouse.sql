ALTER TABLE "businesses" ADD COLUMN "industry_type" text DEFAULT 'custom';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "metadata" jsonb;