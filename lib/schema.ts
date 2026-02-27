import { pgTable, text, integer, real, boolean, timestamp, index, jsonb, numeric, date, customType } from 'drizzle-orm/pg-core';

const numeric2 = customType<{ data: number }>({
  dataType() {
    return 'numeric(10, 2)';
  },
  fromDriver(value: unknown): number {
    return Number(value);
  },
});

const numeric5 = customType<{ data: number }>({
  dataType() {
    return 'numeric(5, 2)';
  },
  fromDriver(value: unknown): number {
    return Number(value);
  },
});
import { relations } from 'drizzle-orm';

export const businesses = pgTable('businesses', {
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
  industryType: text('industry_type', {
    enum: ['mobile', 'pharmacy', 'kirana', 'garments', 'electronics', 'custom']
  }).default('custom'),
  termsAndConditions: text('terms_and_conditions'),
  redemptionPeriodDays: integer('redemption_period_days').default(30),
  finePercentage: numeric5('fine_percentage').default(2),
  fineFrequencyDays: integer('fine_frequency_days').default(7),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  gstin: text('gstin'),
  address: text('address'),
  creditLimit: numeric2('credit_limit').default(0),
  currentBalance: numeric2('current_balance').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  businessIdIdx: index('idx_customers_business').on(table.businessId),
}));

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sku: text('sku'),
  hsnCode: text('hsn_code'),
  unit: text('unit').default('piece'),
  rate: numeric2('rate').notNull().default(0),
  gstRate: numeric5('gst_rate').default(0),
  stockQuantity: numeric2('stock_quantity').default(0),
  lowStockThreshold: numeric2('low_stock_threshold').default(0),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  businessIdIdx: index('idx_products_business').on(table.businessId),
}));

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  invoiceNumber: text('invoice_number').notNull().unique(),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  customerName: text('customer_name').notNull(),
  customerGstin: text('customer_gstin'),
  customerAddress: text('customer_address'),
  invoiceDate: date('invoice_date').notNull(),
  subtotal: numeric2('subtotal').notNull().default(0),
  cgst: numeric2('cgst').default(0),
  sgst: numeric2('sgst').default(0),
  igst: numeric2('igst').default(0),
  total: numeric2('total').notNull().default(0),
  amountPaid: numeric2('amount_paid').notNull().default(0),
  items: jsonb('items').$type<InvoiceItem[]>(),
  notes: text('notes'),
  paymentMode: text('payment_mode', { enum: ['cash', 'upi', 'khata'] }).default('cash'),
  paymentStatus: text('payment_status', { enum: ['paid', 'unpaid', 'partial'] }).default('paid'),
  status: text('status', { enum: ['active', 'cancelled'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  businessIdIdx: index('idx_invoices_business').on(table.businessId),
  customerIdIdx: index('idx_invoices_customer').on(table.customerId),
  statusIdx: index('idx_invoices_status').on(table.status),
  invoiceDateIdx: index('idx_invoices_date').on(table.invoiceDate),
  paymentStatusIdx: index('idx_invoices_payment_status').on(table.paymentStatus),
}));

export const khataTransactions = pgTable('khata_transactions', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['credit', 'debit'] }).notNull(),
  amount: numeric2('amount').notNull(),
  note: text('note'),
  status: text('status', { enum: ['active', 'cancelled'] }).default('active'),
  referenceInvoiceId: text('reference_invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  businessIdIdx: index('idx_khata_business').on(table.businessId),
  customerIdIdx: index('idx_khata_customer').on(table.customerId),
  statusIdx: index('idx_khata_status').on(table.status),
  businessCustomerIdx: index('idx_khata_business_customer').on(table.businessId, table.customerId),
}));

export const accounts = pgTable('accounts', {
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

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
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
