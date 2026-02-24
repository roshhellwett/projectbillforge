CREATE INDEX "idx_invoices_date" ON "invoices" USING btree ("invoice_date");--> statement-breakpoint
CREATE INDEX "idx_invoices_payment_status" ON "invoices" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_khata_status" ON "khata_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_khata_business_customer" ON "khata_transactions" USING btree ("business_id","customer_id");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number");