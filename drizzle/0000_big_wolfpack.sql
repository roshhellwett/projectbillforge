CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	"business_id" text
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text DEFAULT '' NOT NULL,
	"gstin" text,
	"address" text,
	"phone" text,
	"state" text DEFAULT '',
	"pincode" text,
	"logo" text,
	"industry_type" text DEFAULT 'custom',
	"terms_and_conditions" text,
	"redemption_period_days" integer DEFAULT 30,
	"fine_percentage" numeric(5, 2) DEFAULT 2,
	"fine_frequency_days" integer DEFAULT 7,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "businesses_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"gstin" text,
	"address" text,
	"credit_limit" numeric(10, 2) DEFAULT null,
	"current_balance" numeric(10, 2) DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"customer_id" text,
	"customer_name" text NOT NULL,
	"customer_gstin" text,
	"customer_address" text,
	"invoice_date" date NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT 0 NOT NULL,
	"cgst" numeric(10, 2) DEFAULT 0,
	"sgst" numeric(10, 2) DEFAULT 0,
	"igst" numeric(10, 2) DEFAULT 0,
	"total" numeric(10, 2) DEFAULT 0 NOT NULL,
	"amount_paid" numeric(10, 2) DEFAULT 0 NOT NULL,
	"items" jsonb,
	"notes" text,
	"payment_mode" text DEFAULT 'cash',
	"payment_status" text DEFAULT 'paid',
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "khata_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"note" text,
	"status" text DEFAULT 'active',
	"reference_invoice_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"name" text NOT NULL,
	"sku" text,
	"hsn_code" text,
	"unit" text DEFAULT 'piece',
	"rate" numeric(10, 2) DEFAULT 0 NOT NULL,
	"gst_rate" numeric(5, 2) DEFAULT 0,
	"stock_quantity" numeric(10, 2) DEFAULT 0,
	"low_stock_threshold" numeric(10, 2) DEFAULT 0,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khata_transactions" ADD CONSTRAINT "khata_transactions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khata_transactions" ADD CONSTRAINT "khata_transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khata_transactions" ADD CONSTRAINT "khata_transactions_reference_invoice_id_invoices_id_fk" FOREIGN KEY ("reference_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_customers_business" ON "customers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_business" ON "invoices" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_customer" ON "invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_status" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_invoices_date" ON "invoices" USING btree ("invoice_date");--> statement-breakpoint
CREATE INDEX "idx_invoices_payment_status" ON "invoices" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_khata_business" ON "khata_transactions" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "idx_khata_customer" ON "khata_transactions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_khata_status" ON "khata_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_khata_business_customer" ON "khata_transactions" USING btree ("business_id","customer_id");--> statement-breakpoint
CREATE INDEX "idx_products_business" ON "products" USING btree ("business_id");