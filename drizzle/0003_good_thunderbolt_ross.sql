ALTER TABLE "invoices" ADD COLUMN "payment_mode" text DEFAULT 'cash';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_status" text DEFAULT 'paid';