ALTER TABLE "customers" ALTER COLUMN "credit_limit" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "current_balance" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "subtotal" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "cgst" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "sgst" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "igst" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "total" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "rate" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "gst_rate" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "stock_quantity" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "low_stock_threshold" SET DEFAULT 0;