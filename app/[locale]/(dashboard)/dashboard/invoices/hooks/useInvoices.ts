"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getProducts, searchProducts } from "@/lib/actions/products";
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
  email?: string | null; gstin: string | null; address: string | null;
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

export type InvoiceStatusFilter = "all" | "open" | "paid" | "cancelled" | "archived";

type InvoiceQueryFilters = {
  search?: string;
  status?: InvoiceStatusFilter;
};

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
  const [appliedFilters, setAppliedFilters] = useState<InvoiceQueryFilters>({ search: "", status: "all" });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const initialLoadRef = useRef(!initialData);
  const invoiceIdempotencyKeyRef = useRef<{ key: string; signature: string } | null>(null);
  const initialFetchRef = useRef(false);
  const filterEffectReadyRef = useRef(false);
  const requestVersionRef = useRef(0);

  const loadData = useCallback(async (filters: InvoiceQueryFilters = {}) => {
    const requestVersion = ++requestVersionRef.current;
    const isInitialLoad = initialLoadRef.current;
    const queryFilters: InvoiceQueryFilters = {
      search: filters.search ?? search.trim(),
      status: filters.status ?? statusFilter,
    };
    if (isInitialLoad) setLoading(true);
    else setRefreshing(true);
    setLoadError(null);
    setLoadMoreError(null);
    try {
      const [productsResult, customersResult, invoicesResult, businessResult] = await Promise.all([
        getProducts(REFERENCE_DATA_LIMIT, 0),
        getCustomers(REFERENCE_DATA_LIMIT, 0),
        getInvoices(PAGE_SIZE, 0, queryFilters),
        getBusinessProfile(),
      ]);
      if (requestVersion !== requestVersionRef.current) return;
      const results = [productsResult, customersResult, invoicesResult, businessResult];
      const unauthorized = results.find((result) => result.error === "Unauthorized");
      if (unauthorized) {
        router.push("/login");
        return;
      }
      let hasDataError = false;
      if (productsResult.success) setProducts(productsResult.products);
      else if (productsResult.error) hasDataError = true;
      if (customersResult.success) setCustomers(customersResult.customers);
      else if (customersResult.error) hasDataError = true;
      if (invoicesResult.success) {
        setInvoices(invoicesResult.invoices.map((inv: InvoiceServerRow) => ({ ...inv, invoiceDate: new Date(inv.invoiceDate) })));
        setTotalInvoices(invoicesResult.total ?? 0);
        setOffset(invoicesResult.invoices.length);
        setAppliedFilters({
          search: queryFilters.search?.trim() ?? "",
          status: queryFilters.status ?? "all",
        });
      } else if (invoicesResult.error) {
        if (invoicesResult.error === "Unauthorized") { router.push("/login"); return; }
        hasDataError = true;
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
        hasDataError = true;
      }
      if (hasDataError) {
        const message = t("loadErrorMessage");
        setLoadError(message);
        addToast(message, "error");
      }
    } catch {
      if (requestVersion !== requestVersionRef.current) return;
      const message = t("loadErrorMessage");
      setLoadError(message);
      addToast(message, "error");
    } finally {
      if (requestVersion === requestVersionRef.current) {
        initialLoadRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [addToast, router, search, statusFilter, t]);

  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    if (!initialData) void loadData({ search: "", status: "all" });
  }, [initialData, loadData]);

  useEffect(() => {
    if (!filterEffectReadyRef.current) {
      filterEffectReadyRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      void loadData({ search: search.trim(), status: statusFilter });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadData, search, statusFilter]);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
       invoiceIdempotencyKeyRef.current = null;
      setShowNewInvoice(true);
      router.replace("/dashboard/invoices");
    }
  }, [searchParams, router]);

  const loadMoreInvoices = async () => {
    if (loadingMore || offset >= totalInvoices) return;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const result = await getInvoices(PAGE_SIZE, offset, {
        search: search.trim(),
        status: statusFilter,
      });
      if (result.success && result.invoices) {
        setInvoices(prev => [...prev, ...result.invoices.map((inv: InvoiceServerRow) => ({ ...inv, invoiceDate: new Date(inv.invoiceDate) }))]);
        setOffset(prev => prev + result.invoices.length);
        if (typeof result.total === "number") setTotalInvoices(result.total);
        if (result.invoices.length === 0) setTotalInvoices(offset);
      } else if (result.error) {
        if (result.error === "Unauthorized") { router.push("/login"); return; }
        setLoadMoreError(t("loadMoreError"));
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
    const signature = JSON.stringify({ formDataPayload, itemsPayload, isInterStatePayload });
    const existingIdempotency = invoiceIdempotencyKeyRef.current;
    const idempotencyKey = existingIdempotency?.signature === signature
      ? existingIdempotency.key
      : crypto.randomUUID();
    invoiceIdempotencyKeyRef.current = { key: idempotencyKey, signature };
    try {
      const result = await createInvoice({
        ...formDataPayload,
        customerId: formDataPayload.customerId || undefined,
        customerGstin: formDataPayload.customerGstin || undefined,
        customerAddress: formDataPayload.customerAddress || undefined,
        items: itemsPayload,
        isInterState: isInterStatePayload,
        idempotencyKey,
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
        invoiceIdempotencyKeyRef.current = null;
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

  const normalizedSearch = (appliedFilters.search ?? "").trim().toLowerCase();
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = normalizedSearch.length === 0 || [
      inv.invoiceNumber,
      inv.customerName,
      inv.customerGstin ?? "",
      inv.customerAddress ?? "",
      inv.paymentMode ?? "",
      inv.paymentStatus ?? "",
      ...(Array.isArray(inv.items) ? inv.items.map((item) => item.productName) : []),
    ].some(value => value.toLowerCase().includes(normalizedSearch))
      || (normalizedSearch.length > 0
        && Boolean(inv.customerId)
        && !customers.some((customer) => customer.id === inv.customerId));

    const appliedStatus = appliedFilters.status ?? "all";
    const matchesStatus = appliedStatus === "all"
      || (appliedStatus === "cancelled" && inv.status === "cancelled")
      || (appliedStatus === "archived" && inv.status === "archived")
      || (appliedStatus === "paid" && inv.status === "active" && inv.paymentStatus === "paid")
      || (appliedStatus === "open" && inv.status === "active" && inv.paymentStatus !== "paid");

    return matchesSearch && matchesStatus;
  });

  const openNewInvoice = () => {
    invoiceIdempotencyKeyRef.current = null;
    setCreateError(null);
    setSuccessMessage(null);
    setShowNewInvoice(true);
  };

  const closeNewInvoice = () => {
    if (saving) return;
    invoiceIdempotencyKeyRef.current = null;
    setShowNewInvoice(false);
  };

  const searchInvoiceProducts = useCallback(async (query: string): Promise<Product[]> => {
    const result = await searchProducts(query, 50);
    return result.success ? result.products : [];
  }, []);

  const searchInvoiceCustomers = useCallback(async (query: string): Promise<Customer[]> => {
    const result = await getCustomers(50, 0, query);
    return result.success ? result.customers : [];
  }, []);

  return {
    products, customers, invoices, filteredInvoices, loading, search,
    showNewInvoice, printFormat, saving, cancelId, cancelling,
    viewInvoice, businessProfile, showSettingsPrompt, settingsPromptMessage,
    offset, totalInvoices, statusFilter, loadError, loadMoreError, loadingMore, createError,
    cancelError, refreshing, successMessage,
    setSearch, setShowNewInvoice, setPrintFormat, setCancelId, setStatusFilter,
    setViewInvoice, setShowSettingsPrompt, setCancelError,
    openNewInvoice,
    closeNewInvoice,
    searchInvoiceCustomers,
    searchInvoiceProducts,
    loadData, loadMoreInvoices, handleCreateSubmit, handleCancelInvoice,
  };
}
