import { z } from "zod";

export const businessRegisterSchema = z.object({
  name: z.string().min(1, "Business name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  gstin: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const businessLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required").max(100),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  gstin: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.number().min(0).default(0),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  sku: z.string().optional(),
  hsnCode: z.string().optional(),
  unit: z.string().default("piece"),
  rate: z.number().min(0, "Rate must be positive"),
  gstRate: z.number().min(0).max(28).default(0),
  stockQuantity: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).default(0),
});

export const invoiceItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().min(1),
  rate: z.number().min(0),
  gstRate: z.number().min(0),
  amount: z.number().min(0),
  cgst: z.number().min(0),
  sgst: z.number().min(0),
  igst: z.number().min(0),
});

export const invoiceSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerGstin: z.string().optional(),
  customerAddress: z.string().optional(),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
  isInterState: z.boolean().default(false),
});

export const khataTransactionSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  type: z.enum(["credit", "debit"]),
  amount: z.number().positive("Amount must be positive"),
  note: z.string().optional(),
});

export type BusinessRegisterInput = z.infer<typeof businessRegisterSchema>;
export type BusinessLoginInput = z.infer<typeof businessLoginSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type KhataTransactionInput = z.infer<typeof khataTransactionSchema>;
