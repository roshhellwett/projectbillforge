import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const businesses = sqliteTable('businesses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  gstin: text('gstin'),
  address: text('address'),
  phone: text('phone'),
  state: text('state').default(''),
  pincode: text('pincode'),
  logo: text('logo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  gstin: text('gstin'),
  address: text('address'),
  creditLimit: real('credit_limit').default(0),
  currentBalance: real('current_balance').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sku: text('sku'),
  hsnCode: text('hsn_code'),
  unit: text('unit').default('piece'),
  rate: real('rate').notNull().default(0),
  gstRate: real('gst_rate').default(0),
  stockQuantity: real('stock_quantity').default(0),
  lowStockThreshold: real('low_stock_threshold').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  invoiceNumber: text('invoice_number').notNull(),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  customerName: text('customer_name').notNull(),
  customerGstin: text('customer_gstin'),
  customerAddress: text('customer_address'),
  invoiceDate: integer('invoice_date', { mode: 'timestamp' }).notNull(),
  subtotal: real('subtotal').notNull().default(0),
  cgst: real('cgst').default(0),
  sgst: real('sgst').default(0),
  igst: real('igst').default(0),
  total: real('total').notNull().default(0),
  items: text('items', { mode: 'json' }).$type<InvoiceItem[]>(),
  notes: text('notes'),
  status: text('status', { enum: ['active', 'cancelled'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const khataTransactions = sqliteTable('khata_transactions', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['credit', 'debit'] }).notNull(),
  amount: real('amount').notNull(),
  note: text('note'),
  referenceInvoiceId: text('reference_invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
  businessId: text('business_id').references(() => businesses.id, { onDelete: 'cascade' }),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('session_token').notNull(),
  userId: text('user_id').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
  businessId: text('business_id').notNull(),
});

export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export type InvoiceItem = {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  gstRate: number;
  amount: number;
  cgst: number;
  sgst: number;
  igst: number;
};

export const businessesRelations = relations(businesses, ({ many }) => ({
  customers: many(customers),
  products: many(products),
  invoices: many(invoices),
  khataTransactions: many(khataTransactions),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  business: one(businesses, {
    fields: [customers.businessId],
    references: [businesses.id],
  }),
  khataTransactions: many(khataTransactions),
  invoices: many(invoices),
}));

export const productsRelations = relations(products, ({ one }) => ({
  business: one(businesses, {
    fields: [products.businessId],
    references: [businesses.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  business: one(businesses, {
    fields: [invoices.businessId],
    references: [businesses.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));

export const khataTransactionsRelations = relations(khataTransactions, ({ one }) => ({
  business: one(businesses, {
    fields: [khataTransactions.businessId],
    references: [businesses.id],
  }),
  customer: one(customers, {
    fields: [khataTransactions.customerId],
    references: [customers.id],
  }),
  invoice: one(invoices, {
    fields: [khataTransactions.referenceInvoiceId],
    references: [invoices.id],
  }),
}));
