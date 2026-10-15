"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Plus, Search, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { formatCurrency } from "@/lib/formatters";
import { Decimal } from "decimal.js";

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  hsnCode?: string | null;
  rate: number;
  gstRate: number | null;
  stockQuantity: number | null;
  unit: string | null;
  isActive: boolean | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  gstin: string | null;
  address: string | null;
}

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
  gstRate: number;
  amount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

interface InvoiceFormData {
  customerId: string;
  customerName: string;
  customerGstin: string;
  customerAddress: string;
  invoiceDate: string;
  paymentMode: "cash" | "upi" | "khata";
}

interface NewInvoiceModalProps {
  customers: Customer[];
  products: Product[];
  onClose: () => void;
  onSubmit: (formData: InvoiceFormData, items: InvoiceItem[], isInterState: boolean) => Promise<void>;
  saving: boolean;
  error: string;
}

type Step = "details" | "review";

const round2 = (value: number): number => new Decimal(value).toDecimalPlaces(2).toNumber();

// Keep the preview aligned with the server's CGST-down / SGST-remainder rule.
function splitGst(totalGst: number): { cgst: number; sgst: number } {
  const total = new Decimal(totalGst);
  const cgst = total.dividedBy(2).toDecimalPlaces(2, Decimal.ROUND_DOWN);
  return { cgst: cgst.toNumber(), sgst: total.minus(cgst).toNumber() };
}

function getISTDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function getStock(product: Product): number {
  // The server treats a null stock value as zero when creating an invoice.
  return Math.max(0, Number(product.stockQuantity ?? 0));
}

function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function NewInvoiceModal({ customers, products, onClose, onSubmit, saving, error }: NewInvoiceModalProps) {
  const t = useTranslations("Invoices");
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: "",
    customerName: "",
    customerGstin: "",
    customerAddress: "",
    invoiceDate: getISTDateString(),
    paymentMode: "cash",
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isInterState, setIsInterState] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [productOpen, setProductOpen] = useState(false);
  const [productActiveIndex, setProductActiveIndex] = useState(-1);
  const [itemQuantity, setItemQuantity] = useState("");
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerActiveIndex, setCustomerActiveIndex] = useState(-1);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const savingRef = useRef(saving);
  const closeRef = useRef(onClose);

  useEffect(() => { savingRef.current = saving; }, [saving]);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previousActive = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusInitialField = window.setTimeout(() => customerInputRef.current?.focus(), 0);
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!savingRef.current) closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])",
      ));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusInitialField);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousActive?.isConnected) previousActive.focus();
    };
  }, []);

  useEffect(() => {
    if (step === "review") window.requestAnimationFrame(() => reviewHeadingRef.current?.focus());
  }, [step]);

  useEffect(() => {
    if (!customerOpen && !productOpen) return;
    const closeOpenList = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (customerOpen && !customerInputRef.current?.contains(target) && !target.closest("#invoice-customer-dropdown")) {
        setCustomerOpen(false);
        setCustomerActiveIndex(-1);
      }
      if (productOpen && !productInputRef.current?.contains(target) && !target.closest("#invoice-product-dropdown")) {
        setProductOpen(false);
        setProductActiveIndex(-1);
      }
    };
    document.addEventListener("pointerdown", closeOpenList);
    return () => document.removeEventListener("pointerdown", closeOpenList);
  }, [customerOpen, productOpen]);

  const selectedCustomer = customers.find((customer) => customer.id === formData.customerId);
  const selectedProductRecord = products.find((product) => product.id === selectedProduct);

  const filteredCustomers = useMemo(() => {
    const query = formData.customerId ? "" : formData.customerName.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) =>
      `${customer.name} ${customer.phone ?? ""}`.toLowerCase().includes(query),
    );
  }, [customers, formData.customerId, formData.customerName]);

  const filteredProducts = useMemo(() => {
    const activeProducts = products.filter((product) => product.isActive);
    const query = productQuery.trim().toLowerCase();
    if (!query) return activeProducts;
    return activeProducts.filter((product) =>
      `${product.name} ${product.unit ?? ""} ${product.sku ?? ""} ${product.hsnCode ?? ""}`.toLowerCase().includes(query),
    );
  }, [products, productQuery]);

  const totals = useMemo(() => {
    const sum = (key: "amount" | "cgst" | "sgst" | "igst") =>
      items.reduce((total, item) => total.plus(item[key]), new Decimal(0)).toNumber();
    return {
      subtotal: sum("amount"),
      cgst: sum("cgst"),
      sgst: sum("sgst"),
      igst: sum("igst"),
    };
  }, [items]);

  const grandTotal = new Decimal(totals.subtotal)
    .plus(totals.cgst)
    .plus(totals.sgst)
    .plus(totals.igst)
    .toNumber();

  const paymentModeLabel = formData.paymentMode === "cash"
    ? t("cash")
    : formData.paymentMode === "upi"
      ? t("upi")
      : t("khataCredit");
  const paymentStatusLabel = formData.paymentMode === "khata"
    ? t("paymentStatusKhata")
    : t("paymentStatusPaid");
  const customerReviewDetail = [
    selectedCustomer?.phone,
    (selectedCustomer?.gstin || formData.customerGstin) && `${t("customerGstin")}: ${selectedCustomer?.gstin || formData.customerGstin}`,
    formData.customerAddress,
  ].filter(Boolean).join(" · ") || t("notProvided");

  const selectCustomer = (customer: Customer) => {
    setFormData((current) => ({
      ...current,
      customerId: customer.id,
      customerName: customer.name,
      customerGstin: customer.gstin || "",
      customerAddress: customer.address || "",
    }));
    setCustomerOpen(false);
    setCustomerActiveIndex(-1);
    setDetailsError(null);
  };

  const handleCustomerInput = (value: string) => {
    setFormData((current) => ({
      ...current,
      customerId: "",
      customerName: value,
      customerGstin: "",
      customerAddress: "",
    }));
    setCustomerOpen(true);
    setCustomerActiveIndex(0);
    setDetailsError(null);
  };

  const handleCustomerKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCustomerOpen(true);
      setCustomerActiveIndex((current) => Math.min(current + 1, filteredCustomers.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCustomerActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && customerOpen && filteredCustomers[customerActiveIndex]) {
      event.preventDefault();
      selectCustomer(filteredCustomers[customerActiveIndex]);
    } else if (event.key === "Escape") {
      setCustomerOpen(false);
      setCustomerActiveIndex(-1);
    }
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product.id);
    setProductQuery(product.name);
    setProductOpen(false);
    setProductActiveIndex(-1);
    setQuantityError(null);
    window.requestAnimationFrame(() => quantityInputRef.current?.focus());
  };

  const handleProductInput = (value: string) => {
    setProductQuery(value);
    setSelectedProduct("");
    setProductOpen(true);
    setProductActiveIndex(0);
    setQuantityError(null);
  };

  const handleProductKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setProductOpen(true);
      setProductActiveIndex((current) => Math.min(current + 1, filteredProducts.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setProductActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && productOpen) {
      event.preventDefault();
      const product = filteredProducts[productActiveIndex] ?? (filteredProducts.length === 1 ? filteredProducts[0] : undefined);
      if (product && getStock(product) > 0) selectProduct(product);
    } else if (event.key === "Escape") {
      setProductOpen(false);
      setProductActiveIndex(-1);
    }
  };

  const addItemToInvoice = (product: Product, quantity: number) => {
    const existingIndex = items.findIndex((item) => item.productId === product.id);
    const currentQuantity = existingIndex >= 0 ? items[existingIndex].quantity : 0;
    const newQuantity = new Decimal(currentQuantity).plus(quantity).toDecimalPlaces(2).toNumber();
    const amount = new Decimal(product.rate).times(newQuantity).toDecimalPlaces(2).toNumber();
    const gstRate = product.gstRate ?? 0;
    const gstAmount = new Decimal(amount).times(gstRate).dividedBy(100).toNumber();
    const split = splitGst(gstAmount);
    const updatedItem: InvoiceItem = {
      productId: product.id,
      productName: product.name,
      quantity: newQuantity,
      rate: product.rate,
      gstRate,
      amount,
      cgst: isInterState ? 0 : split.cgst,
      sgst: isInterState ? 0 : split.sgst,
      igst: isInterState ? round2(gstAmount) : 0,
    };

    setItems((current) => {
      if (existingIndex < 0) return [...current, updatedItem];
      const next = [...current];
      next[existingIndex] = updatedItem;
      return next;
    });
    setSelectedProduct("");
    setProductQuery("");
    setProductOpen(false);
    setItemQuantity("");
    setQuantityError(null);
    setDetailsError(null);
    window.requestAnimationFrame(() => productInputRef.current?.focus());
  };

  const addItem = () => {
    if (!selectedProductRecord) {
      setQuantityError(t("selectProductFirst"));
      productInputRef.current?.focus();
      return;
    }
    const quantity = Number(itemQuantity);
    let quantityDecimal: Decimal;
    try {
      quantityDecimal = new Decimal(itemQuantity || 0);
    } catch {
      setQuantityError(t("quantityRequired"));
      quantityInputRef.current?.focus();
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || !quantityDecimal.isFinite()) {
      setQuantityError(t("quantityRequired"));
      quantityInputRef.current?.focus();
      return;
    }
    if (quantityDecimal.decimalPlaces() > 2) {
      setQuantityError(t("quantityPrecision"));
      quantityInputRef.current?.focus();
      return;
    }
    if (quantityDecimal.greaterThan(100000)) {
      setQuantityError(t("quantityTooLarge"));
      quantityInputRef.current?.focus();
      return;
    }

    const existingQuantity = items.find((item) => item.productId === selectedProductRecord.id)?.quantity ?? 0;
    const available = getStock(selectedProductRecord);
    if (new Decimal(existingQuantity).plus(quantityDecimal).greaterThan(available)) {
      setQuantityError(t("stockInsufficient", {
        available: formatQuantity(available),
        unit: selectedProductRecord.unit || t("unitDefault"),
      }));
      quantityInputRef.current?.focus();
      return;
    }

    addItemToInvoice(selectedProductRecord, quantityDecimal.toNumber());
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleInterStateToggle = (checked: boolean) => {
    setIsInterState(checked);
    setItems((current) => current.map((item) => {
      const gstAmount = new Decimal(item.amount).times(item.gstRate).dividedBy(100).toNumber();
      const split = splitGst(gstAmount);
      return {
        ...item,
        cgst: checked ? 0 : split.cgst,
        sgst: checked ? 0 : split.sgst,
        igst: checked ? round2(gstAmount) : 0,
      };
    }));
  };

  const validateDetails = (): boolean => {
    if (!formData.customerName.trim()) {
      setDetailsError(t("customerRequired"));
      customerInputRef.current?.focus();
      return false;
    }
    if (formData.paymentMode === "khata" && !formData.customerId) {
      setDetailsError(t("khataCustomerRequired"));
      customerInputRef.current?.focus();
      return false;
    }
    if (!formData.invoiceDate) {
      setDetailsError(t("dateRequired"));
      dateInputRef.current?.focus();
      return false;
    }
    if (items.length === 0) {
      setDetailsError(t("itemsRequired"));
      productInputRef.current?.focus();
      return false;
    }
    setDetailsError(null);
    return true;
  };

  const handleReview = (event: FormEvent) => {
    event.preventDefault();
    if (!saving && validateDetails()) setStep("review");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (saving || !validateDetails()) return;
    void onSubmit({
      ...formData,
      customerName: formData.customerName.trim(),
      customerGstin: formData.customerGstin.trim(),
      customerAddress: formData.customerAddress.trim(),
    }, items, isInterState);
  };

  const openProducts = () => {
    onClose();
    router.push("/dashboard/products");
  };

  const openCustomers = () => {
    onClose();
    router.push("/dashboard/customers");
  };

  const hasNoProducts = products.filter((product) => product.isActive).length === 0;

  return (
    <div className="glass-overlay" aria-hidden={false}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-invoice-title"
        aria-busy={saving}
        className="glass-card glass-modal-panel w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 p-4 sm:p-5 md:p-6 border-b border-[var(--border)]/50 bg-[var(--surface)]/95 backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">{step === "details" ? t("invoiceStepDetails") : t("invoiceStepReview")}</p>
            <h2 id="new-invoice-title" className="text-lg sm:text-xl font-bold text-[var(--foreground)] mt-1">{t("newInvoice")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={t("closeModal")}
          >
            <X size={20} className="text-[var(--foreground)]/60" aria-hidden="true" />
          </button>
        </div>

        {step === "details" ? (
          <form onSubmit={handleReview} className="p-4 sm:p-5 md:p-6 space-y-5">
            {error && <div id="invoice-create-error" className="p-3 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-sm border border-[var(--color-danger)]/20" role="alert">{error}</div>}
            {detailsError && <div id="invoice-details-error" className="p-3 rounded-xl bg-[var(--color-warning)]/10 text-[var(--foreground)] text-sm border border-[var(--color-warning)]/25" role="alert">{detailsError}</div>}

            <section aria-labelledby="invoice-customer-heading" className="space-y-3">
              <div>
                <h3 id="invoice-customer-heading" className="font-semibold text-[var(--foreground)]">{t("customerDetails")}</h3>
                <p className="text-xs text-[var(--foreground)]/55 mt-1">{t("customerDetailsHint")}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <label htmlFor="invoice-customer" className="block text-sm font-medium text-[var(--foreground)]/75 mb-1">{t("customerName")}</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 pointer-events-none" aria-hidden="true" />
                    <input
                      ref={customerInputRef}
                      id="invoice-customer"
                      type="text"
                      value={selectedCustomer?.name ?? formData.customerName}
                      onChange={(event) => handleCustomerInput(event.target.value)}
                      onFocus={() => setCustomerOpen(true)}
                      onKeyDown={handleCustomerKeyDown}
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={customerOpen}
                      aria-haspopup="listbox"
                      aria-autocomplete="list"
                       aria-controls="invoice-customer-listbox"
                       aria-activedescendant={customerActiveIndex >= 0 ? `invoice-customer-option-${customerActiveIndex}` : undefined}
                       aria-invalid={Boolean(detailsError && (!formData.customerName.trim() || (formData.paymentMode === "khata" && !formData.customerId)))}
                       aria-describedby={detailsError ? "invoice-details-error" : undefined}
                      className="w-full glass-input min-h-[46px] pl-9 pr-10"
                      placeholder={t("customerSearchPlaceholder")}
                    />
                    <ChevronDown size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 pointer-events-none" aria-hidden="true" />
                  </div>
                  {customerOpen && (
                    <div id="invoice-customer-dropdown" className="absolute z-40 mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden">
                      <div id="invoice-customer-listbox" role="listbox" className="max-h-56 overflow-y-auto">
                        {filteredCustomers.length > 0 ? filteredCustomers.map((customer, index) => (
                          <button
                            key={customer.id}
                            id={`invoice-customer-option-${index}`}
                            type="button"
                            role="option"
                            aria-selected={formData.customerId === customer.id}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectCustomer(customer)}
                            className={`w-full text-left px-3 py-3 text-sm border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--color-primary)]/10 ${customerActiveIndex === index ? "bg-[var(--color-primary)]/10" : ""}`}
                          >
                            <span className="block font-semibold text-[var(--foreground)]">{customer.name}</span>
                            {customer.phone && <span className="block text-xs text-[var(--foreground)]/55 mt-0.5">{customer.phone}</span>}
                          </button>
                        )) : (
                          <div className="p-3 text-sm text-[var(--foreground)]/55" role="status">{t("customerNoMatch")}</div>
                        )}
                      </div>
                      <button type="button" onClick={openCustomers} className="w-full flex items-center gap-2 px-3 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10">
                        <Plus size={15} aria-hidden="true" />{t("newCustomer")}
                      </button>
                    </div>
                  )}
                  {selectedCustomer && <p className="text-xs text-[var(--color-primary)] mt-1">{t("customerSelected")}</p>}
                </div>

                <div>
                  <label htmlFor="invoice-date" className="block text-sm font-medium text-[var(--foreground)]/75 mb-1">{t("invoiceDate")}</label>
                  <input
                   id="invoice-date"
                    ref={dateInputRef}
                    type="date"
                    required
                    value={formData.invoiceDate}
                    max={getISTDateString()}
                    onChange={(event) => { setFormData((current) => ({ ...current, invoiceDate: event.target.value })); setDetailsError(null); }}
                    className="w-full glass-input min-h-[46px]"
                  />
                </div>
              </div>

              {selectedCustomer ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/45">{t("customerGstin")}</p><p className="mt-1 font-medium">{selectedCustomer.gstin || t("notProvided")}</p></div>
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/45">{t("customerAddress")}</p><p className="mt-1 font-medium whitespace-pre-line">{selectedCustomer.address || t("notProvided")}</p></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="invoice-customer-gstin" className="block text-sm font-medium text-[var(--foreground)]/75 mb-1">{t("customerGstin")} <span className="text-xs font-normal text-[var(--foreground)]/45">({t("optional")})</span></label>
                    <input id="invoice-customer-gstin" type="text" value={formData.customerGstin} onChange={(event) => setFormData((current) => ({ ...current, customerGstin: event.target.value.toUpperCase() }))} className="w-full glass-input min-h-[46px] uppercase" placeholder={t("customerGstinPlaceholder")} />
                  </div>
                  <div>
                    <label htmlFor="invoice-customer-address" className="block text-sm font-medium text-[var(--foreground)]/75 mb-1">{t("customerAddress")} <span className="text-xs font-normal text-[var(--foreground)]/45">({t("optional")})</span></label>
                    <textarea id="invoice-customer-address" value={formData.customerAddress} onChange={(event) => setFormData((current) => ({ ...current, customerAddress: event.target.value }))} rows={2} className="w-full glass-input resize-none" placeholder={t("customerAddressPlaceholder")} />
                  </div>
                </div>
              )}
            </section>

            <section aria-labelledby="invoice-payment-heading" className="space-y-3">
              <div>
                <h3 id="invoice-payment-heading" className="font-semibold text-[var(--foreground)]">{t("paymentMode")}</h3>
                <p className="text-xs text-[var(--foreground)]/55 mt-1">{formData.paymentMode === "khata" ? t("paymentKhataHint") : t("paymentPaidHint")}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label={t("paymentMode")}>
                {(["cash", "upi", "khata"] as const).map((mode) => {
                  const label = mode === "cash" ? t("cash") : mode === "upi" ? t("upi") : t("khataCredit");
                  const selected = formData.paymentMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => { setFormData((current) => ({ ...current, paymentMode: mode })); setDetailsError(null); }}
                      className={`min-h-[50px] text-sm font-semibold rounded-xl border px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--foreground)]" : "border-[var(--border)] text-[var(--foreground)]/65 hover:bg-[var(--surface-elevated)]"}`}
                    >
                      <span className="block">{label}</span>
                      <span className="block text-xs font-normal mt-1 text-[var(--foreground)]/55">{mode === "khata" ? t("paymentStatusKhata") : t("paymentStatusPaid")}</span>
                    </button>
                  );
                })}
              </div>
              {formData.paymentMode === "khata" && !formData.customerId && <p className="text-xs text-[var(--color-warning)] font-medium" role="status">{t("khataCustomerRequired")}</p>}
            </section>

            <section className="rounded-xl border border-[var(--border)] p-3 sm:p-4 space-y-4" aria-labelledby="invoice-items-heading">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h3 id="invoice-items-heading" className="font-semibold text-[var(--foreground)]">{t("items")}</h3>
                  <p className="text-xs text-[var(--foreground)]/55 mt-1">{t("itemsHint")}</p>
                </div>
                <label className="flex items-start gap-2 text-sm cursor-pointer shrink-0">
                  <input type="checkbox" checked={isInterState} onChange={(event) => handleInterStateToggle(event.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span><span className="font-medium">{t("interStateLabel")}</span><span className="block text-xs text-[var(--foreground)]/50 mt-0.5">{t("interStateHint")}</span></span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div>
                    <label htmlFor="invoice-product" className="sr-only">{t("productSearchLabel")}</label>
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 pointer-events-none" aria-hidden="true" />
                    <input
                      ref={productInputRef}
                      id="invoice-product"
                      type="text"
                      value={productQuery}
                      onChange={(event) => handleProductInput(event.target.value)}
                      onFocus={() => setProductOpen(true)}
                      onKeyDown={handleProductKeyDown}
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={productOpen}
                      aria-haspopup="listbox"
                      aria-autocomplete="list"
                       aria-controls={hasNoProducts ? undefined : "invoice-product-listbox"}
                      aria-activedescendant={productActiveIndex >= 0 ? `invoice-product-option-${productActiveIndex}` : undefined}
                      className="w-full glass-input min-h-[46px] pl-9 pr-3"
                      placeholder={t("selectProduct")}
                    />
                  </div>
                  {productOpen && (
                    <div id="invoice-product-dropdown" className="absolute z-30 mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden">
                      {hasNoProducts ? (
                        <div className="p-3 text-sm text-[var(--foreground)]/60 flex flex-col gap-2"><span>{t("noProducts")}</span><button type="button" onClick={openProducts} className="self-start text-[var(--color-primary)] font-semibold">{t("newProduct")}</button></div>
                      ) : (
                        <div id="invoice-product-listbox" role="listbox" className="max-h-60 overflow-y-auto">
                          {filteredProducts.length === 0 ? (
                            <div className="p-3 text-sm text-[var(--foreground)]/60" role="status">{t("noMatchingProducts")}</div>
                          ) : filteredProducts.map((product, index) => {
                            const stock = getStock(product);
                            return (
                              <button
                                key={product.id}
                                id={`invoice-product-option-${index}`}
                                type="button"
                                role="option"
                                aria-selected={selectedProduct === product.id}
                                disabled={stock <= 0}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => selectProduct(product)}
                                className={`w-full text-left px-3 py-3 border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--color-primary)]/10 disabled:opacity-50 disabled:cursor-not-allowed ${productActiveIndex === index ? "bg-[var(--color-primary)]/10" : ""}`}
                              >
                                <span className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold truncate">{product.name}</span><span className="font-mono shrink-0">{formatCurrency(product.rate)}</span></span>
                                <span className="flex items-center justify-between gap-3 text-xs text-[var(--foreground)]/55 mt-1"><span>{t("gstRateLabel", { rate: product.gstRate ?? 0 })}{product.sku ? ` · SKU ${product.sku}` : ""}</span><span className={stock > 0 ? "text-[var(--foreground)]/60" : "text-[var(--color-danger)]"}>{stock > 0 ? t("stockAvailable", { count: formatQuantity(stock), unit: product.unit || t("unitDefault") }) : t("stockUnavailable")}</span></span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="relative sm:w-32">
                  <label htmlFor="invoice-quantity" className="sr-only">{t("quantityLabel")}</label>
                  <input
                     ref={quantityInputRef}
                    id="invoice-quantity"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                     step="0.01"
                     max="100000"
                    value={itemQuantity}
                    onChange={(event) => { setItemQuantity(event.target.value); setQuantityError(null); }}
                    onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addItem(); } }}
                     className={`w-full glass-input min-h-[46px] font-mono font-bold sm:text-center ${selectedProductRecord?.unit ? "pr-12" : ""}`}
                    placeholder={t("quantityPlaceholder")}
                    aria-invalid={Boolean(quantityError)}
                    aria-describedby={quantityError ? "invoice-quantity-error" : undefined}
                  />
                  {selectedProductRecord?.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--foreground)]/40 pointer-events-none">{selectedProductRecord.unit}</span>}
                </div>
                <button type="button" onClick={addItem} disabled={!selectedProductRecord || !itemQuantity || saving} className="glass-btn-primary min-h-[46px] px-5 disabled:opacity-50 disabled:cursor-not-allowed"><Plus size={17} aria-hidden="true" />{t("add")}</button>
              </div>
              {quantityError && <p id="invoice-quantity-error" className="text-xs text-[var(--color-danger)]" role="alert">{quantityError}</p>}

              {items.length > 0 ? (
                <>
                  <div className="hidden sm:block overflow-x-auto -mx-1">
                    <table className="w-full text-sm min-w-[580px]">
                      <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]/30"><tr><th scope="col" className="px-3 py-2 text-left">{t("itemColumn")}</th><th scope="col" className="px-3 py-2 text-right">{t("quantityColumn")}</th><th scope="col" className="px-3 py-2 text-right">{t("rateColumn")}</th><th scope="col" className="px-3 py-2 text-right">{t("gstColumn")}</th><th scope="col" className="px-3 py-2 text-right">{t("totalColumn")}</th><th scope="col" className="px-3 py-2"><span className="sr-only">{t("thActions")}</span></th></tr></thead>
                      <tbody className="divide-y divide-[var(--border)]/30">{items.map((item, index) => <tr key={item.productId}><td className="px-3 py-3 font-medium">{item.productName}</td><td className="px-3 py-3 text-right font-mono">{formatQuantity(item.quantity)}</td><td className="px-3 py-3 text-right font-mono">{formatCurrency(item.rate)}</td><td className="px-3 py-3 text-right text-xs">{isInterState ? `IGST ${formatCurrency(item.igst)}` : `C ${formatCurrency(item.cgst)} · S ${formatCurrency(item.sgst)}`}</td><td className="px-3 py-3 text-right font-mono font-bold">{formatCurrency(item.amount + item.cgst + item.sgst + item.igst)}</td><td className="px-3 py-3 text-right"><button type="button" onClick={() => removeItem(index)} className="p-2 rounded-lg text-[var(--color-danger)]/80 hover:bg-[var(--color-danger)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)]/30" aria-label={t("removeItem", { item: item.productName })}><Trash2 size={16} aria-hidden="true" /></button></td></tr>)}</tbody>
                    </table>
                  </div>
                  <div className="sm:hidden space-y-2">{items.map((item, index) => <div key={item.productId} className="rounded-xl bg-[var(--surface-elevated)] p-3 flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold text-sm truncate">{item.productName}</p><p className="text-xs text-[var(--foreground)]/55 mt-1">{formatQuantity(item.quantity)} × {formatCurrency(item.rate)}</p><p className="text-xs text-[var(--foreground)]/55 mt-1">{isInterState ? `IGST ${formatCurrency(item.igst)}` : `CGST ${formatCurrency(item.cgst)} · SGST ${formatCurrency(item.sgst)}`}</p></div><div className="text-right shrink-0"><p className="font-mono font-bold text-sm">{formatCurrency(item.amount + item.cgst + item.sgst + item.igst)}</p><button type="button" onClick={() => removeItem(index)} className="mt-2 text-xs font-semibold text-[var(--color-danger)] p-2 -mr-2" aria-label={t("removeItem", { item: item.productName })}>{t("removeShort")}</button></div></div>)}</div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-center text-sm text-[var(--foreground)]/55">{t("itemsEmpty")}</div>
              )}
            </section>

            <TotalsSummary totals={totals} grandTotal={grandTotal} isInterState={isInterState} t={t} />

            <div className="sticky bottom-0 -mx-4 sm:-mx-5 md:-mx-6 -mb-4 sm:-mb-5 md:-mb-6 p-4 sm:p-5 md:p-6 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button type="button" onClick={onClose} disabled={saving} className="glass-btn-secondary min-h-[46px] sm:min-w-32 disabled:opacity-50">{t("cancel")}</button>
              <button type="submit" disabled={saving || items.length === 0 || !formData.customerName.trim() || (formData.paymentMode === "khata" && !formData.customerId)} className="glass-btn-primary min-h-[46px] sm:min-w-44 disabled:opacity-50 disabled:cursor-not-allowed"><ArrowRight size={17} aria-hidden="true" />{t("reviewInvoice")}</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 md:p-6 space-y-5">
            {error && <div className="p-3 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-sm border border-[var(--color-danger)]/20" role="alert">{error}</div>}
            <div>
              <h3 ref={reviewHeadingRef} tabIndex={-1} className="text-xl font-bold text-[var(--foreground)] focus:outline-none">{t("reviewTitle")}</h3>
              <p className="text-sm text-[var(--foreground)]/60 mt-1">{t("reviewSubtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               <ReviewCard label={t("billTo")} value={formData.customerName} detail={customerReviewDetail} />
              <ReviewCard label={t("paymentMode")} value={paymentModeLabel} detail={`${t("paymentStatus")}: ${paymentStatusLabel}`} />
              <ReviewCard label={t("invoiceDate")} value={formData.invoiceDate} detail={isInterState ? t("interStateTax") : t("sameStateTax")} />
            </div>

            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="px-4 py-3 bg-[var(--surface-elevated)] border-b border-[var(--border)] flex items-center justify-between gap-3"><h4 className="font-semibold text-sm">{t("reviewItems")}</h4><span className="text-xs text-[var(--foreground)]/55">{isInterState ? t("interStateTax") : t("sameStateTax")}</span></div>
              <div className="divide-y divide-[var(--border)]">{items.map((item) => <div key={item.productId} className="px-4 py-3 flex items-center justify-between gap-3 text-sm"><div className="min-w-0"><p className="font-semibold truncate">{item.productName}</p><p className="text-xs text-[var(--foreground)]/55 mt-0.5">{formatQuantity(item.quantity)} × {formatCurrency(item.rate)} · GST {item.gstRate}%</p></div><p className="font-mono font-bold shrink-0">{formatCurrency(item.amount + item.cgst + item.sgst + item.igst)}</p></div>)}</div>
            </div>

            <TotalsSummary totals={totals} grandTotal={grandTotal} isInterState={isInterState} t={t} />
            <p className="text-xs text-[var(--foreground)]/55 rounded-xl bg-[var(--surface-elevated)] p-3">{t("stockWillDecrease")}</p>
            <div className="sticky bottom-0 -mx-4 sm:-mx-5 md:-mx-6 -mb-4 sm:-mb-5 md:-mb-6 p-4 sm:p-5 md:p-6 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button type="button" onClick={() => setStep("details")} disabled={saving} className="glass-btn-secondary min-h-[46px] sm:min-w-36 disabled:opacity-50"><ArrowLeft size={17} aria-hidden="true" />{t("backToEdit")}</button>
              <button type="submit" disabled={saving} className="glass-btn-primary min-h-[46px] sm:min-w-48 disabled:opacity-50 disabled:cursor-not-allowed">{saving ? t("creating") : <><Check size={17} aria-hidden="true" />{t("createInvoice")}</>}</button>
            </div>
            {saving && <p className="text-sm text-center text-[var(--foreground)]/60" role="status" aria-live="polite">{t("creating")}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-xl border border-[var(--border)] p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/45">{label}</p><p className="mt-1 font-semibold truncate">{value}</p><p className="mt-1 text-xs text-[var(--foreground)]/55 truncate">{detail}</p></div>;
}

function TotalsSummary({
  totals,
  grandTotal,
  isInterState,
  t,
}: {
  totals: { subtotal: number; cgst: number; sgst: number; igst: number };
  grandTotal: number;
  isInterState: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  return (
    <dl className="ml-auto w-full sm:max-w-xs space-y-2 text-sm">
      <div className="flex justify-between gap-4"><dt className="text-[var(--foreground)]/60">{t("subtotal")}</dt><dd className="font-mono font-medium">{formatCurrency(totals.subtotal)}</dd></div>
      {isInterState ? <div className="flex justify-between gap-4"><dt className="text-[var(--foreground)]/60">{t("igst")}</dt><dd className="font-mono font-medium">{formatCurrency(totals.igst)}</dd></div> : <><div className="flex justify-between gap-4"><dt className="text-[var(--foreground)]/60">{t("cgst")}</dt><dd className="font-mono font-medium">{formatCurrency(totals.cgst)}</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--foreground)]/60">{t("sgst")}</dt><dd className="font-mono font-medium">{formatCurrency(totals.sgst)}</dd></div></>}
      <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-3 text-lg font-bold"><dt>{t("total")}</dt><dd className="font-mono">{formatCurrency(grandTotal)}</dd></div>
    </dl>
  );
}
