"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { getCustomers } from "@/lib/actions/customers";
import { getKhataStatement, createKhataTransaction, deleteKhataTransaction, chargeLateFees, getOverdueCustomerIds } from "@/lib/actions/khata";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/formatters";

export function fmt(v: string | number | null | undefined): string {
  const n = Number(v);
  if (isNaN(n) || !isFinite(n)) return "0.00";
  return formatCurrency(Math.abs(n)).replace("₹", "").trim();
}
export function safeNum(v: string | number | null | undefined): number {
  const n = Number(v);
  return isNaN(n) || !isFinite(n) ? 0 : n;
}

interface Customer {
  id: string; name: string; phone: string | null;
  currentBalance: number | null; creditLimit?: number | null;
}
interface Transaction {
  id: string; type: "credit" | "debit"; amount: number;
  note: string | null; createdAt: Date | null;
  referenceInvoiceId: string | null; status?: string | null;
  runningBalance?: number;
}

export function useKhata() {
  const router = useRouter();
  const { addToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [overdueIds, setOverdueIds] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [statement, setStatement] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statementLoading, setStatementLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [accruedFines, setAccruedFines] = useState(0);
  const [totalBalanceDue, setTotalBalanceDue] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collectingFines, setCollectingFines] = useState(false);
  const [modalFormData, setModalFormData] = useState({ type: "credit" as "credit" | "debit", amount: "", note: "" });
  const [paymentData, setPaymentData] = useState({ amount: "", note: "", method: "cash" });

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    const [custResult, overdueResult] = await Promise.all([getCustomers(), getOverdueCustomerIds()]);
    if (custResult.success) {
      setCustomers(custResult.customers);
    } else if (custResult.error) {
      addToast(custResult.error, "error");
    }
    if (overdueResult.success) {
      setOverdueIds(overdueResult.overdueIds ?? []);
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const loadStatement = useCallback(async (customerId: string) => {
    setStatementLoading(true);
    const result = await getKhataStatement(customerId);
    if (result.success) {
      setCustomer(result.customer);
      setStatement(result.statement.map((t: Transaction & { createdAt: Date | string | null }) => ({
        ...t, createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
      })));
      setAccruedFines(result.accruedFines || 0);
      setTotalBalanceDue(result.totalBalanceDue || 0);
    } else if (result.error) {
      addToast(result.error, "error");
    }
    setStatementLoading(false);
  }, [addToast]);

  const handleCustomerSelect = useCallback((customerId: string) => {
    setSelectedCustomer(customerId);
    setAccruedFines(0);
    setTotalBalanceDue(0);
    if (customerId) {
      loadStatement(customerId);
    } else {
      setCustomer(null);
      setStatement([]);
    }
  }, [loadStatement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const parsedAmount = Number(modalFormData.amount);
    if (!modalFormData.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast("Please enter a valid amount greater than 0.", "error");
      return;
    }
    setSaving(true);
    const result = await createKhataTransaction({
      customerId: selectedCustomer, type: modalFormData.type,
      amount: parsedAmount, note: modalFormData.note || undefined,
    });
    if (result.error) {
      addToast(result.error, "error");
    } else {
      addToast("Transaction added successfully", "success");
      if (result.overpayment && result.overpayment > 0) {
        addToast(`Overpayment of ₹${fmt(result.overpayment)} — customer now has credit balance`, "warning");
      }
      setShowModal(false);
      setModalFormData({ type: "credit", amount: "", note: "" });
      loadStatement(selectedCustomer);
      loadCustomers();
      router.refresh();
    }
    setSaving(false);
  };

  const handleDeleteTransaction = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteKhataTransaction(deleteId);
    if (result.success && selectedCustomer) {
      addToast("Transaction cancelled", "success");
      loadStatement(selectedCustomer);
      loadCustomers();
      router.refresh();
    } else if (result.error) {
      addToast(result.error, "error");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amount = Number(paymentData.amount);
    if (!amount || amount <= 0) {
      addToast("Please enter a valid payment amount", "error");
      return;
    }
    setSaving(true);
    const result = await createKhataTransaction({
      customerId: selectedCustomer, type: "debit",
      amount, paymentMethod: paymentData.method, note: paymentData.note || undefined,
    });
    if (result.error) {
      addToast(result.error, "error");
    } else {
      addToast("Payment recorded successfully", "success");
      if (result.overpayment && result.overpayment > 0) {
        addToast(`Overpayment of ₹${fmt(result.overpayment)} — customer now has credit balance`, "warning");
      }
      setShowPaymentModal(false);
      setPaymentData({ amount: "", note: "", method: "cash" });
      loadStatement(selectedCustomer);
      loadCustomers();
      router.refresh();
    }
    setSaving(false);
  };

  const handleCollectFines = useCallback(async () => {
    if (!selectedCustomer) return;
    setCollectingFines(true);
    const result = await chargeLateFees(selectedCustomer);
    if ('error' in result) {
      addToast(result.error!, "error");
    } else if (result.charged > 0) {
      addToast(`Late fees of ₹${fmt(result.charged)} collected from ${result.count} invoice(s)`, "success");
      loadStatement(selectedCustomer);
      loadCustomers();
      router.refresh();
    } else {
      addToast("No late fees to collect", "info");
    }
    setCollectingFines(false);
  }, [selectedCustomer, addToast, loadStatement, loadCustomers, router]);

  return {
    customers, customer, statement, loading, statementLoading, customerSearch,
    selectedCustomer, accruedFines, totalBalanceDue, overdueIds,
    showModal, showPaymentModal, deleteId, deleting, saving, collectingFines,
    modalFormData, paymentData,
    setCustomerSearch, setShowModal, setShowPaymentModal,
    setModalFormData, setPaymentData, setDeleteId,
    handleCustomerSelect, handleSubmit, handleDeleteTransaction, handlePaymentSubmit,
    handleCollectFines,
  };
}
