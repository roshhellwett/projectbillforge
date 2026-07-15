import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { INDIAN_STATES, INDUSTRY_OPTIONS, DEFAULT_TERMS } from "../lib/constants.ts";
import {
  businessRegisterSchema,
  customerSchema,
  productSchema,
  invoiceSchema,
  khataTransactionSchema,
  businessProfileSchema
} from "../lib/validations.ts";
import { formatCurrency, formatDate, formatReceiptDate } from "../lib/formatters.ts";

test("Smoke: Constants definitions are valid and non-empty", () => {
  assert.ok(INDIAN_STATES.length > 30, "Should have more than 30 Indian states and union territories defined");
  assert.ok(INDIAN_STATES.includes("Maharashtra"), "Must include Maharashtra");
  assert.ok(INDIAN_STATES.includes("Delhi"), "Must include Delhi");

  assert.ok(INDUSTRY_OPTIONS.length >= 6, "Should have at least 6 industry options");
  assert.ok(INDUSTRY_OPTIONS.some(i => i.value === "kirana"), "Must include Kirana option");

  assert.ok(typeof DEFAULT_TERMS === "string" && DEFAULT_TERMS.length > 50, "Default terms must be a substantial string");
});

test("Smoke: Zod businessRegisterSchema enforces password strength and Indian phone format", () => {
  const validPayload = {
    name: "Zenith Retail Store",
    email: "contact@zenith.com",
    password: "Password@123",
    confirmPassword: "Password@123",
    phone: "9876543210",
    gstin: "27AABCU9603R1ZM",
  };

  const parseResult = businessRegisterSchema.safeParse(validPayload);
  assert.ok(parseResult.success, `Valid business registration should pass: ${parseResult.error?.message}`);

  const invalidPhone = businessRegisterSchema.safeParse({
    ...validPayload,
    phone: "12345",
  });
  assert.equal(invalidPhone.success, false, "Should reject invalid Indian phone number");

  const mismatchPassword = businessRegisterSchema.safeParse({
    ...validPayload,
    confirmPassword: "DifferentPassword123",
  });
  assert.equal(mismatchPassword.success, false, "Should reject mismatched passwords");
});

test("Smoke: Zod customerSchema and productSchema validate constraints", () => {
  const validCustomer = customerSchema.safeParse({
    name: "Rajesh Kumar",
    phone: "9123456789",
    email: "rajesh@example.com",
    address: "Shop 12, MG Road, Mumbai",
    creditLimit: 50000,
  });
  assert.ok(validCustomer.success, "Valid customer should pass Zod validation");

  const validProduct = productSchema.safeParse({
    name: "Basmati Rice 5kg",
    sku: "RIC-001",
    hsnCode: "10063020",
    unit: "bag",
    rate: 650,
    gstRate: 5,
    stockQuantity: 100,
    lowStockThreshold: 15,
  });
  assert.ok(validProduct.success, "Valid product should pass Zod validation");

  const invalidRateProduct = productSchema.safeParse({
    name: "Free Item",
    rate: -10,
  });
  assert.equal(invalidRateProduct.success, false, "Negative rates should be rejected");
});

test("Smoke: Zod invoiceSchema validates line items and GST values", () => {
  const validInvoice = invoiceSchema.safeParse({
    customerName: "Suresh Traders",
    invoiceDate: "2026-07-15",
    paymentMode: "cash",
    isInterState: false,
    items: [
      {
        productId: "prod-1",
        productName: "Wheat Flour 10kg",
        quantity: 2,
        rate: 400,
        gstRate: 5,
        amount: 800,
        cgst: 20,
        sgst: 20,
        igst: 0,
      }
    ],
  });
  assert.ok(validInvoice.success, "Valid invoice with items should pass");

  const emptyItemsInvoice = invoiceSchema.safeParse({
    customerName: "Suresh Traders",
    invoiceDate: "2026-07-15",
    items: [],
  });
  assert.equal(emptyItemsInvoice.success, false, "Invoices without items should be rejected");
});

test("Smoke: Formatters format currency and dates accurately", () => {
  const curr = formatCurrency(123456.78);
  assert.ok(curr.includes("₹") || curr.includes("1,23,456.78"), `Formatted currency: ${curr}`);

  const formattedDate = formatDate("2026-07-15");
  assert.notEqual(formattedDate, "-", "Should format a valid date string cleanly");

  const formattedReceipt = formatReceiptDate(new Date("2026-07-15"));
  assert.ok(formattedReceipt.includes("Jul") || formattedReceipt.includes("2026"), `Receipt date: ${formattedReceipt}`);
});

test("Smoke: All localization files (en, hi, hi-en) exist and parse cleanly without syntax errors", () => {
  const messagesDir = path.resolve(process.cwd(), "messages");
  const files = ["en.json", "hi.json", "hi-en.json"];

  for (const file of files) {
    const filePath = path.join(messagesDir, file);
    assert.ok(fs.existsSync(filePath), `Localization file missing: ${file}`);

    const raw = fs.readFileSync(filePath, "utf-8");
    let json: Record<string, unknown>;
    assert.doesNotThrow(() => {
      json = JSON.parse(raw);
    }, `Syntax error parsing ${file}`);

    const requiredSections = ["Landing", "Auth", "Dashboard", "Invoices", "Khata", "Products", "Customers", "Settings"];
    for (const section of requiredSections) {
      assert.ok(section in json!, `Missing root translation section '${section}' in ${file}`);
    }
  }
});
