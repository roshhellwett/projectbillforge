DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_invoices_amount_paid'
  ) THEN
    ALTER TABLE "invoices" ADD CONSTRAINT "chk_invoices_amount_paid"
      CHECK ("amount_paid" <= "total");
  END IF;
END $$;
