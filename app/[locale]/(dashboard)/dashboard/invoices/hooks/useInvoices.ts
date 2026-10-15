"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { getInvoices, createInvoice, cancelInvoice } from "@/lib/actions/invoices";
import { getBusinessProfile } from "@/lib/actions/business";
import { useToast } from "@/components/ui/Toast";

export interface Product {
  id: string; name: string; rate: number;
  gstRate: number | null; stockQuantity: number | null;
  unit: string | null; isActive: boolean | null;
  sku?: string | null; hsnCode?: string | null;
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
}

export interface InvoiceFormData {
  customerId: string; customerName: string;
  customerGstin: string; customerAddress: string;
  invoiceDate: string;
  paymentMode: "cash" | "upi" | "khata";
}

export interface BusinessProfile {
  name: string; gstin: string | null; address: string | null;
  phone: string | null; state: string;
  pincode: string | null; termsAndConditions: string | null;
}

export type InvoiceStatusFilter = "all" | "open" | "paid" | "cancelled";

interface InvoiceServerRow extends Omit<Invoice, "invoiceDate"> {
  invoiceDate: string;
}

export const PAGE_SIZE = 50;
export const REFERENCE_DATA_LIMIT = 200;

export function useInvoices(initialData?: {
  products?: Product[]; customers?: Customer[]; invoices?: Invoice[];
  businessProfile?: BusinessProfile | null; totalInvoices?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Invoices");
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>(initialData?.products ?? []);
  const [customers, setCustomers] = useState<Customer[]>(initialData?.customers ?? []);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData?.invoices ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [search, setSearch] = useState("");
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [printFormat, setPrintFormat] = useState<"a4" | "thermal">("a4");
  const [saving, setSaving] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(initialData?.businessProfile ?? null);
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);
  const [settingsPromptMessage, setSettingsPromptMessage] = useState("");
  const [offset, setOffset] = useState(initialData?.invoices?.length ?? 0);
  const [totalInvoices, setTotalInvoices] = useState(initialData?.totalInvoices ?? 0);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const initialLoadRef = useRef(!initialData);

  const loadData = useCallback(async () => {
    const isInitialLoad = initialLoadRef.current;
    if (isInitialLoad) setLoading(true);
    else setRefreshing(true);
    setLoadError(null);
    setLoadMoreError(null);
    try {
      const [productsResult, customersResult, invoicesResult, businessResult] = await Promise.all([
        getProducts(REFERENCE_DATA_LIMIT, 0),
        getCustomers(REFERENCE_DATA_LIMIT, 0),
        getInvoices(PAGE_SIZE, 0),
        getBusinessProfile(),
      ]);
      const results = [productsResult, customersResult, invoicesResult, businessResult];
      const unauthorized = results.find((result) => result.error === "Unauthorized");
      if (unauthorized) {
        router.push("/login");
        return;
      }
      const dataErrors: string[] = [];
      if (productsResult.success) setProducts(productsResult.products);
      else if (productsResult.error) dataErrors.push(productsResult.error);
      if (customersResult.success) setCustomers(customersResult.customers);
      else if (customersResult.error) dataErrors.push(customersResult.error);
      if (invoicesResult.success) {
        setInvoices(invoicesResult.invoices.map((inv: InvoiceServerRow) => ({ ...inv, invoiceDate: new Date(inv.invoiceDate) })));
        setTotalInvoices(invoicesResult.total ?? 0);
        setOffset(invoicesResult.invoices.length);
      } else if (invoicesResult.error) {
        if (invoicesResult.error === "Unauthorized") { router.push("/login"); return; }
        dataErrors.push(invoicesResult.error);
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
      } else if (businessResult.error) {
        dataErrors.push(businessResult.error);
      }
      if (dataErrors.length > 0) {
        const message = dataErrors[0];
        setLoadError(message);
        addToast(message, "error");
      }
    } catch {
      const message = t("loadErrorMessage");
      setLoadError(message);
      addToast(message, "error");
    } finally {
      initialLoadRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast, router, t]);

  useEffect(() => { if (!initialData) void loadData(); }, [initialData, loadData]);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setShowNewInvoice(true);
      router.replace("/dashboard/invoices");
    }
  }, [searchParams, router]);

  const loadMoreInvoices = async () => {
    if (loadingMore || offset >= totalInvoices) return;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const result = await getInvoices(PAGE_SIZE, offset);
      if (result.success && result.invoices) {
        setInvoices(prev => [...prev, ...result.invoices.map((inv: InvoiceServerRow) => ({ ...inv, invoiceDate: new Date(inv.invoiceDate) }))]);
        setOffset(prev => prev + result.invoices.length);
        if (typeof result.total === "number") setTotalInvoices(result.total);
        if (result.invoices.length === 0) setTotalInvoices(offset);
      } else if (result.error) {
        if (result.error === "Unauthorized") { router.push("/login"); return; }
        setLoadMoreError(result.error);
      }
    } catch {
      setLoadMoreError(t("loadMoreError"));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreateSubmit = async (formDataPayload: InvoiceFormData, itemsPayload: InvoiceItem[], isInterStatePayload: boolean) => {
    setCreateError(null);
    if (itemsPayload.length === 0) {
      const message = t("itemsRequired");
      setCreateError(message);
      addToast(message, "error");
      return;
    }
    if (!formDataPayload.customerName.trim()) {
      const message = t("customerRequired");
      setCreateError(message);
      addToast(message, "error");
      return;
    }
    setSaving(true);
    try {
      const result = await createInvoice({
        ...formDataPayload,
        customerId: formDataPayload.customerId || undefined,
        customerGstin: formDataPayload.customerGstin || undefined,
        customerAddress: formDataPayload.customerAddress || undefined,
        items: itemsPayload,
        isInterState: isInterStatePayload,
      });
      if (result.error) {
        if ((result as { redirectToSettings?: boolean }).redirectToSettings) {
          setSettingsPromptMessage(result.error);
          setShowSettingsPrompt(true);
        } else {
          setCreateError(result.error);
          addToast(result.error, "error");
        }
      } else if (result.success) {
        addToast(t("createdSuccess"), "success");
        setSuccessMessage(t("createdSuccess"));
        setCreateError(null);
        setShowNewInvoice(false);
        await loadData();
        router.refresh();
      } else {
        const message = t("createError");
        setCreateError(message);
        addToast(message, "error");
      }
    } catch {
      const message = t("createError");
      setCreateError(message);
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (!cancelId) return;
    setCancelError(null);
    setCancelling(true);
    let completed = false;
    try {
      const result = await cancelInvoice(cancelId);
      if (result.success) {
        completed = true;
        addToast(t("cancelledSuccess"), "success");
        setSuccessMessage(t("cancelledSuccess"));
        await loadData();
        router.refresh();
      } else if (result.error) {
        if (result.error === "Unauthorized") { router.push("/login"); return; }
        setCancelError(result.error);
        addToast(result.error, "error");
      } else {
        const message = t("cancelError");
        setCancelError(message);
        addToast(message, "error");
      }
    } catch {
      const message = t("cancelError");
      setCancelError(message);
      addToast(message, "error");
    } finally {
      setCancelling(false);
      if (completed) setCancelId(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredInvoices = invoices.filter(inv => {
    const matchingCustomer = customers.find((customer) =>
      (inv.customerId && customer.id === inv.customerId) || customer.name === inv.customerName,
    );
    const matchesSearch = normalizedSearch.length === 0 || [
      inv.invoiceNumber,
      inv.customerName,
      inv.paymentMode ?? "",
      inv.paymentStatus ?? "",
      matchingCustomer?.phone ?? "",
      ...(Array.isArray(inv.items) ? inv.items.map((item) => item.productName) : []),
    ].some(value => value.toLowerCase().includes(normalizedSearch));

    const matchesStatus = statusFilter === "all"
      || (statusFilter === "cancelled" && inv.status === "cancelled")
      || (statusFilter === "paid" && inv.status === "active" && inv.paymentStatus === "paid")
      || (statusFilter === "open" && inv.status === "active" && inv.paymentStatus !== "paid");

    return matchesSearch && matchesStatus;
  });

  const openNewInvoice = () => {
    setCreateError(null);
    setSuccessMessage(null);
    setShowNewInvoice(true);
  };

  return {
    products, customers, invoices, filteredInvoices, loading, search,
    showNewInvoice, printFormat, saving, cancelId, cancelling,
    viewInvoice, businessProfile, showSettingsPrompt, settingsPromptMessage,
    offset, totalInvoices, statusFilter, loadError, loadMoreError, loadingMore, createError,
    cancelError, refreshing, successMessage,
    setSearch, setShowNewInvoice, setPrintFormat, setCancelId, setStatusFilter,
    setViewInvoice, setShowSettingsPrompt, setCancelError,
    openNewInvoice,
    loadData, loadMoreInvoices, handleCreateSubmit, handleCancelInvoice,
  };
}
