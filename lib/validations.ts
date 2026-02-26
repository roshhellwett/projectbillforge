import { z } from "zod";

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

export const businessRegisterSchema = z.object({
  name: z.string().min(1, "Business name is required").max(100).trim(),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  gstin: z.string().regex(gstinRegex, "Invalid GSTIN format").optional().or(z.literal('')),
  phone: z.string().max(20).optional().transform(s => s?.trim() || undefined),
  address: z.string().max(500).optional().transform(s => s?.trim() || undefined),
  state: z.string().max(100).optional().transform(s => s?.trim() || undefined),
  pincode: z.string().max(20).optional().transform(s => s?.trim() || undefined),
  honeypot: z.string().max(100).optional(),
  turnstileToken: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const businessLoginSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required").max(100).trim(),
  phone: z.string().optional().transform(s => s?.trim() || undefined),
  email: z.string().email("Invalid email").optional().or(z.literal('')).transform(s => s?.trim().toLowerCase()),
  gstin: z.string().regex(gstinRegex, "Invalid GSTIN format").optional().or(z.literal('')),
  address: z.string().optional().transform(s => s?.trim() || undefined),
  creditLimit: z.number().min(0).default(0),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100).trim(),
  sku: z.string().optional().transform(s => s?.trim() || undefined),
  hsnCode: z.string().optional().transform(s => s?.trim() || undefined),
  unit: z.string().default("piece"),
  rate: z.number().min(0, "Rate must be positive"),
  gstRate: z.number().min(0).max(28).default(0),
  stockQuantity: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).default(0),
});

export const invoiceItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1).trim(),
  quantity: z.number().positive("Quantity must be greater than 0"),
  rate: z.number().min(0),
  gstRate: z.number().min(0),
  amount: z.number().min(0),
  cgst: z.number().min(0),
  sgst: z.number().min(0),
  igst: z.number().min(0),
});

export const invoiceSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required").trim(),
  customerGstin: z.string().regex(gstinRegex, "Invalid GSTIN format").optional().or(z.literal('')),
  customerAddress: z.string().optional().transform(s => s?.trim() || undefined),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional().transform(s => s?.trim() || undefined),
  isInterState: z.boolean().default(false),
  paymentMode: z.enum(["cash", "upi", "khata"]).default("cash"),
});

export const khataTransactionSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  type: z.enum(["credit", "debit"]),
  amount: z.number().positive("Amount must be positive"),
  note: z.string().optional().transform(s => s?.trim() || undefined),
});

export const businessProfileSchema = z.object({
  name: z.string().min(1, "Business name is required").max(200).trim().optional(),
  gstin: z.string().regex(gstinRegex, "Invalid GSTIN format").optional().or(z.literal('')),
  address: z.string().max(500).optional().transform(s => s?.trim() || undefined),
  phone: z.string().max(20).optional().transform(s => s?.trim() || undefined),
  state: z.string().max(50).optional().transform(s => s?.trim() || undefined),
  pincode: z.string().max(10).optional().transform(s => s?.trim() || undefined),
  termsAndConditions: z.string().max(2000).optional().transform(s => s?.trim() || undefined),
  redemptionPeriodDays: z.number().int().min(0).max(365).optional(),
  finePercentage: z.number().min(0).max(100).optional(),
  fineFrequencyDays: z.number().int().min(1).max(365).optional(),
  industryType: z.enum(["mobile", "pharmacy", "kirana", "garments", "electronics", "custom"]).optional(),
});

export type BusinessRegisterInput = z.infer<typeof businessRegisterSchema>;
export type BusinessLoginInput = z.infer<typeof businessLoginSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type KhataTransactionInput = z.infer<typeof khataTransactionSchema>;
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
