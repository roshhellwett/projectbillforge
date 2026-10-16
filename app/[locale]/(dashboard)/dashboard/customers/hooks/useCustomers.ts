"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/lib/actions/customers";
import { recalculateCustomerBalance } from "@/lib/actions/khata";
import { formatCurrency } from "@/lib/formatters";
import { useToast } from "@/components/ui/Toast";

export interface Customer {
  id: string; name: string; phone: string | null; email: string | null;
  gstin: string | null; address: string | null;
  creditLimit: number | null; currentBalance: number | null;
}

export const PAGE_SIZE = 50;

export const fmt = (v: string | number | null | undefined): string => {
  const n = Number(v);
  if (isNaN(n) || !isFinite(n)) return '0.00';
  return formatCurrency(Math.abs(n)).replace('₹', '').trim();
};
export const safeNum = (v: string | number | null | undefined): number => {
  const n = Number(v);
  return isNaN(n) || !isFinite(n) ? 0 : n;
};

export interface CustomerFormData {
  name: string; phone: string; email: string;
  gstin: string; address: string; creditLimit: string;
}

const defaultForm: CustomerFormData = {
  name: "", phone: "", email: "", gstin: "", address: "", creditLimit: "",
};

export function useCustomers(initialData?: { customers?: Customer[]; totalCustomers?: number; totalDue?: number }, initialError?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Customers");
  const { addToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(initialData?.customers ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialError ?? null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [offset, setOffset] = useState(initialData?.customers?.length ?? 0);
  const [totalCustomers, setTotalCustomers] = useState(initialData?.totalCustomers ?? 0);
  const [totalDue, setTotalDue] = useState(initialData?.totalDue ?? 0);
  const initialLoadRef = useRef(!initialData);
  const initialFetchRef = useRef(false);
  const searchEffectReadyRef = useRef(false);
  const requestVersionRef = useRef(0);

  const loadData = useCallback(async (query = search.trim()) => {
    const requestVersion = ++requestVersionRef.current;
    const isInitialLoad = initialLoadRef.current;
    if (isInitialLoad) setLoading(true);
    else setRefreshing(true);
    setLoadError(null);
    setLoadMoreError(null);
    try {
      const result = await getCustomers(PAGE_SIZE, 0, query);
      if (requestVersion !== requestVersionRef.current) return;
      if (result.success) {
        setCustomers(result.customers);
        setTotalCustomers(result.total ?? 0);
        setTotalDue(result.totalDue ?? 0);
        setOffset(result.customers.length);
      } else if (result.error) {
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
  }, [addToast, search, t]);

  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    if (!initialData) void loadData("");
  }, [initialData, loadData]);

  useEffect(() => {
    if (!searchEffectReadyRef.current) {
      searchEffectReadyRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      void loadData(search.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadData, search]);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setFormData(defaultForm);
      setEditingCustomer(null);
      setShowModal(true);
      router.replace("/dashboard/customers");
    }
  }, [searchParams, router]);

  const loadMoreCustomers = async () => {
    if (loadingMore || offset >= totalCustomers) return;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const result = await getCustomers(PAGE_SIZE, offset, search.trim());
      if (result.success && result.customers) {
        setCustomers(prev => [...prev, ...result.customers]);
        setOffset(prev => prev + result.customers.length);
        if (typeof result.total === "number") setTotalCustomers(result.total);
        if (result.customers.length === 0) setTotalCustomers(offset);
      } else if (result.error === "Unauthorized") {
        router.push("/login");
      } else {
        setLoadMoreError(t("loadMoreError"));
      }
    } catch {
      setLoadMoreError(t("loadMoreError"));
    } finally {
      setLoadingMore(false);
    }
  };

  const openModal = () => {
    setFormError(null);
    setSuccessMessage(null);
    setFormData(defaultForm);
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setFormError(null);
    setSuccessMessage(null);
    setEditingCustomer(customer);
    setFormData({
      name: customer.name, phone: customer.phone || "",
      email: customer.email || "", gstin: customer.gstin || "",
      address: customer.address || "", creditLimit: customer.creditLimit?.toString() ?? "",
    });
    setShowModal(true);
  };

  const handleSyncBalance = async (customerId: string) => {
    setSuccessMessage(null);
    setSyncingId(customerId);
    try {
      const result = await recalculateCustomerBalance(customerId);
      if (result.success) {
        addToast(t("successBalanceSync"), "success");
        setSuccessMessage(t("successBalanceSync"));
        await loadData();
        router.refresh();
      } else {
        addToast(result.error ?? t("syncError"), "error");
      }
    } catch {
      const message = t("syncError");
      addToast(message, "error");
    } finally {
      setSyncingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    const gstin = formData.gstin.trim().toUpperCase();
    const address = formData.address.trim();
    const creditLimit = formData.creditLimit.trim() ? Number(formData.creditLimit) : 0;

    if (!name) {
      setFormError(t("validationName"));
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setFormError(t("validationPhone"));
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError(t("validationEmail"));
      return;
    }
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
      setFormError(t("validationGstin"));
      return;
    }
    if (!address) {
      setFormError(t("validationAddress"));
      return;
    }
    if (!Number.isFinite(creditLimit) || creditLimit < 0) {
      setFormError(t("validationCreditLimit"));
      return;
    }
    setSaving(true);
    const data = {
      name, phone,
      email: email || undefined, gstin: gstin || undefined,
      address,
      creditLimit,
    };
    try {
      const result = editingCustomer
        ? await updateCustomer(editingCustomer.id, data)
        : await createCustomer(data);
      if (!result.success) {
        const message = result.error ?? t("saveError");
        setFormError(message);
        addToast(message, "error");
      } else {
        const message = editingCustomer ? t("successUpdated") : t("successCreated");
        addToast(message, "success");
        setSuccessMessage(message);
        setShowModal(false);
        setEditingCustomer(null);
        await loadData();
        router.refresh();
      }
    } catch {
      const message = t("saveError");
      setFormError(message);
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteError(null);
    setDeleting(true);
    let completed = false;
    try {
      const result = await deleteCustomer(deleteId);
      if (result.success) {
        completed = true;
        setDeleteError(null);
        const message = t("successDeleted");
        addToast(message, "success");
        setSuccessMessage(message);
        await loadData();
        router.refresh();
      } else {
        const message = result.error ?? t("deleteError");
        setDeleteError(message);
        addToast(message, "error");
      }
    } catch {
      const message = t("deleteError");
      setDeleteError(message);
      addToast(message, "error");
    } finally {
      setDeleting(false);
      if (completed) setDeleteId(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredCustomers = customers.filter(c => {
    if (!normalizedSearch) return true;
    return [c.name, c.phone ?? "", c.email ?? "", c.gstin ?? "", c.address ?? ""]
      .some(value => value.toLowerCase().includes(normalizedSearch));
  });

  return {
    customers, filteredCustomers, totalDue, loading, refreshing, search, showModal, editingCustomer,
    formData, saving, formError, deleteId, deleting, deleteError, syncingId,
    offset, totalCustomers, loadError, loadMoreError, loadingMore, successMessage,
    setSearch, setShowModal, setFormData, setFormError, setDeleteId, setDeleteError,
    openModal, handleEdit, handleSubmit, handleDelete, handleSyncBalance,
    loadMoreCustomers, loadData,
  };
}
