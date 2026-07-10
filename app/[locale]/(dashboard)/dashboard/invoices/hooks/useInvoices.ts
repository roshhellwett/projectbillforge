"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { getInvoices, createInvoice, cancelInvoice } from "@/lib/actions/invoices";
import { getBusinessProfile } from "@/lib/actions/business";
import { useToast } from "@/components/ui/Toast";

export interface Product {
  id: string; name: string; rate: number;
  gstRate: number | null; stockQuantity: number | null;
  unit: string | null; isActive: boolean | null;
}

export interface Customer {
  id: string; name: string; phone: string | null;
  gstin: string | null; address: string | null;
}

export interface InvoiceItem {
  productId: string; productName: string; quantity: number;
  rate: number; gstRate: number; amount: number;
  cgst: number; sgst: number; igst: number;
}

export interface Invoice {
  id: string; invoiceNumber: string;
  customerId?: string | null; customerName: string;
  invoiceDate: Date; total: number | null;
  status: string | null; paymentMode: string | null;
  paymentStatus: string | null; amountPaid: number | null;
  items: InvoiceItem[] | null;
  customerGstin: string | null; customerAddress: string | null;
  notes: string | null;
}

export interface InvoiceFormData {
  customerId: string; customerName: string;
  customerGstin: string; customerAddress: string;
  invoiceDate: string; notes: string;
  paymentMode: "cash" | "upi" | "khata";
}

export interface BusinessProfile {
  name: string; gstin: string | null; address: string | null;
  phone: string | null; state: string;
  pincode: string | null; termsAndConditions: string | null;
}

interface InvoiceServerRow extends Omit<Invoice, "invoiceDate"> {
  invoiceDate: string;
}

export const PAGE_SIZE = 50;

export function useInvoices() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [printFormat, setPrintFormat] = useState<"a4" | "thermal">("a4");
  const [saving, setSaving] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);
  const [settingsPromptMessage, setSettingsPromptMessage] = useState("");
  const [offset, setOffset] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [productsResult, customersResult, invoicesResult, businessResult] = await Promise.all([
      getProducts(), getCustomers(), getInvoices(PAGE_SIZE, 0), getBusinessProfile(),
    ]);
    if (productsResult.success) setProducts(productsResult.products);
    else if (productsResult.error) addToast(productsResult.error, "error");
    if (customersResult.success) setCustomers(customersResult.customers);
    if (invoicesResult.success) {
      setInvoices(invoicesResult.invoices.map((inv: InvoiceServerRow) => ({ ...inv, invoiceDate: new Date(inv.invoiceDate) })));
      setTotalInvoices(invoicesResult.total ?? 0);
      setOffset(invoicesResult.invoices.length);
    } else if (invoicesResult.error) {
      if (invoicesResult.error === "Unauthorized") { router.push("/en/login"); return; }
      addToast(invoicesResult.error, "error");
    }
    if (businessResult.success && businessResult.business) {
      setBusinessProfile({
        name: businessResult.business.name || "",
        gstin: businessResult.business.gstin || null,
        address: businessResult.business.address || null,
        phone: businessResult.business.phone || null,
        state: businessResult.business.state || "",
        pincode: businessResult.business.pincode || null,
        termsAndConditions: businessResult.business.termsAndConditions || null,
      });
    }
    setLoading(false);
  }, [addToast, router]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setShowNewInvoice(true);
      router.replace("/dashboard/invoices");
    }
  }, [searchParams, router]);

  const loadMoreInvoices = async () => {
    const result = await getInvoices(PAGE_SIZE, offset);
    if (result.success && result.invoices) {
      setInvoices(prev => [...prev, ...result.invoices.map((inv: InvoiceServerRow) => ({ ...inv, invoiceDate: new Date(inv.invoiceDate) }))]);
      setOffset(prev => prev + result.invoices.length);
    }
  };

  const handleCreateSubmit = async (formDataPayload: InvoiceFormData, itemsPayload: InvoiceItem[], isInterStatePayload: boolean) => {
    if (itemsPayload.length === 0) { addToast("Add at least one item", "error"); return; }
    if (!formDataPayload.customerName) { addToast("Customer name is required", "error"); return; }
    setSaving(true);
    const result = await createInvoice({
      ...formDataPayload,
      customerId: formDataPayload.customerId || undefined,
      customerGstin: formDataPayload.customerGstin || undefined,
      customerAddress: formDataPayload.customerAddress || undefined,
      notes: formDataPayload.notes || undefined,
      items: itemsPayload,
      isInterState: isInterStatePayload,
    });
    if (result.error) {
      if ((result as { redirectToSettings?: boolean }).redirectToSettings) {
        setSettingsPromptMessage(result.error);
        setShowSettingsPrompt(true);
      } else {
        addToast(result.error, "error");
      }
    } else {
      addToast("Invoice created", "success");
      setShowNewInvoice(false);
      loadData();
      router.refresh();
    }
    setSaving(false);
  };

  const handleCancelInvoice = async () => {
    if (!cancelId) return;
    setCancelling(true);
    const result = await cancelInvoice(cancelId);
    if (result.success) {
      addToast("Invoice cancelled", "success");
      loadData();
      router.refresh();
    } else if (result.error) {
      if (result.error === "Unauthorized") { router.push("/en/login"); return; }
      addToast(result.error, "error");
    }
    setCancelling(false);
    setCancelId(null);
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return {
    products, customers, invoices, filteredInvoices, loading, search,
    showNewInvoice, printFormat, saving, cancelId, cancelling,
    viewInvoice, businessProfile, showSettingsPrompt, settingsPromptMessage,
    offset, totalInvoices,
    setSearch, setShowNewInvoice, setPrintFormat, setCancelId,
    setViewInvoice, setShowSettingsPrompt,
    openNewInvoice: () => setShowNewInvoice(true),
    loadData, loadMoreInvoices, handleCreateSubmit, handleCancelInvoice,
  };
}
