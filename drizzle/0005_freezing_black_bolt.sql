ALTER TABLE "businesses" ADD COLUMN "redemption_period_days" integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "fine_percentage" numeric(5, 2) DEFAULT 2;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "fine_frequency_days" integer DEFAULT 7;