"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
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

export function useCustomers(initialData?: { customers?: Customer[]; totalCustomers?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(initialData?.customers ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [offset, setOffset] = useState(initialData?.customers?.length ?? 0);
  const [totalCustomers, setTotalCustomers] = useState(initialData?.totalCustomers ?? 0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getCustomers(PAGE_SIZE, 0);
    if (result.success) {
      setCustomers(result.customers);
      setTotalCustomers(result.total ?? 0);
      setOffset(result.customers.length);
    } else if (result.error) {
      addToast(result.error, "error");
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => { if (!initialData) loadData(); }, []);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setFormData(defaultForm);
      setEditingCustomer(null);
      setShowModal(true);
      router.replace("/dashboard/customers");
    }
  }, [searchParams, router]);

  const loadMoreCustomers = async () => {
    const result = await getCustomers(PAGE_SIZE, offset);
    if (result.success && result.customers) {
      setCustomers(prev => [...prev, ...result.customers]);
      setOffset(prev => prev + result.customers.length);
    }
  };

  const openModal = () => {
    setFormData(defaultForm);
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name, phone: customer.phone || "",
      email: customer.email || "", gstin: customer.gstin || "",
      address: customer.address || "", creditLimit: customer.creditLimit?.toString() ?? "",
    });
    setShowModal(true);
  };

  const handleSyncBalance = async (customerId: string) => {
    setSyncingId(customerId);
    const result = await recalculateCustomerBalance(customerId);
    if (result.success) {
      addToast("Balance synced", "success");
      loadData();
      router.refresh();
    } else if (result.error) {
      addToast(result.error, "error");
    }
    setSyncingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      name: formData.name, phone: formData.phone,
      email: formData.email || undefined, gstin: formData.gstin || undefined,
      address: formData.address,
      creditLimit: formData.creditLimit ? Number(formData.creditLimit) : 0,
    };
    const result = editingCustomer
      ? await updateCustomer(editingCustomer.id, data)
      : await createCustomer(data);
    if (result.error) {
      addToast(result.error, "error");
    } else {
      addToast(editingCustomer ? "Customer updated" : "Customer created", "success");
      setShowModal(false);
      setEditingCustomer(null);
      loadData();
      router.refresh();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteCustomer(deleteId);
    if (result.success) {
      addToast("Customer deleted", "success");
      loadData();
      router.refresh();
    } else if (result.error) {
      addToast(result.error, "error");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return {
    customers, filteredCustomers, loading, search, showModal, editingCustomer,
    formData, saving, deleteId, deleting, syncingId, offset, totalCustomers,
    setSearch, setShowModal, setFormData, setDeleteId,
    openModal, handleEdit, handleSubmit, handleDelete, handleSyncBalance, loadMoreCustomers, loadData,
  };
}
