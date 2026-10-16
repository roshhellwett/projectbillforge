"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { getCustomers } from "@/lib/actions/customers";
import { getKhataStatement, createKhataTransaction, deleteKhataTransaction, chargeLateFees, getOverdueCustomerIds, resetCustomerKhata, getCustomerResetHistory } from "@/lib/actions/khata";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/formatters";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Khata");
  const { addToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerTotal, setCustomerTotal] = useState(0);
  const [overdueIds, setOverdueIds] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [statement, setStatement] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statementLoading, setStatementLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [loadMoreCustomersError, setLoadMoreCustomersError] = useState<string | null>(null);
  const [statementError, setStatementError] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [accruedFines, setAccruedFines] = useState(0);
  const [totalBalanceDue, setTotalBalanceDue] = useState(0);
  const [successState, setSuccessState] = useState<"transaction" | "payment" | "cancel" | "fine" | "reset" | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collectingFines, setCollectingFines] = useState(false);
  const [modalFormData, setModalFormData] = useState({ type: "credit" as "credit" | "debit", amount: "", note: "" });
  const [paymentData, setPaymentData] = useState({ amount: "", note: "", method: "cash" });
  const [resetHistory, setResetHistory] = useState<{ id: string; resetDate: Date | string | null; amountReset: number; invoiceCount: number; createdAt: Date | string | null }[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [loadingMoreCustomers, setLoadingMoreCustomers] = useState(false);
  const statementRequestRef = useRef(0);
  const customerListRequestRef = useRef(0);
  const initialCustomerFetchRef = useRef(false);
  const customerSearchEffectReadyRef = useRef(false);
  const transactionIdempotencyRef = useRef<{ key: string; signature: string } | null>(null);
  const paymentIdempotencyRef = useRef<{ key: string; signature: string } | null>(null);

  const loadCustomers = useCallback(async (query = customerSearch.trim()) => {
    const requestId = ++customerListRequestRef.current;
    const isInitialRequest = !initialCustomerFetchRef.current && query === "";
    if (isInitialRequest) setLoading(true);
    setCustomersError(null);
    try {
      const [custResult, overdueResult] = await Promise.all([getCustomers(200, 0, query), getOverdueCustomerIds()]);
      if (requestId !== customerListRequestRef.current) return;
      if (custResult.success) {
        setCustomers(custResult.customers);
        setCustomerTotal(custResult.total ?? custResult.customers.length);
        setLoadMoreCustomersError(null);
      } else if (custResult.error) {
        const message = t("customerLoadError");
        setCustomersError(message);
        setCustomers([]);
        setCustomerTotal(0);
        addToast(message, "error");
      }
      if (overdueResult.success) {
        setOverdueIds(overdueResult.overdueIds ?? []);
      }
    } catch {
      if (requestId !== customerListRequestRef.current) return;
      const message = t("customerLoadError");
      setCustomersError(message);
      addToast(message, "error");
    } finally {
      if (requestId === customerListRequestRef.current) setLoading(false);
    }
  }, [addToast, customerSearch, t]);

  useEffect(() => {
    if (initialCustomerFetchRef.current) return;
    void loadCustomers("");
    initialCustomerFetchRef.current = true;
  }, [loadCustomers]);

  useEffect(() => {
    if (!customerSearchEffectReadyRef.current) {
      customerSearchEffectReadyRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      void loadCustomers(customerSearch.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [customerSearch, loadCustomers]);

  const loadMoreCustomers = useCallback(async () => {
    if (loadingMoreCustomers || customers.length >= customerTotal) return;
    setLoadingMoreCustomers(true);
    setLoadMoreCustomersError(null);
    try {
      const result = await getCustomers(200, customers.length, customerSearch.trim());
      if (result.success) {
        setCustomers(previous => [...previous, ...result.customers]);
        setCustomerTotal(result.total ?? customerTotal);
      } else if (result.error) {
        const message = t("loadMoreCustomersError");
        setLoadMoreCustomersError(message);
        addToast(message, "error");
      }
    } catch {
      const message = t("loadMoreCustomersError");
      setLoadMoreCustomersError(message);
      addToast(message, "error");
    } finally {
      setLoadingMoreCustomers(false);
    }
  }, [addToast, customerSearch, customerTotal, customers.length, loadingMoreCustomers, t]);

  const loadStatement = useCallback(async (customerId: string) => {
    const requestId = ++statementRequestRef.current;
    setStatementLoading(true);
    setStatementError(null);
    try {
      const result = await getKhataStatement(customerId);
      if (requestId !== statementRequestRef.current) return;
      if (result.success) {
        setCustomer(result.customer);
        setStatement(result.statement.map((t: Transaction & { createdAt: Date | string | null }) => ({
          ...t, createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
        })));
        setAccruedFines(result.accruedFines || 0);
        setTotalBalanceDue(result.totalBalanceDue || 0);
      } else if (result.error) {
        const message = t("statementLoadError");
        setStatementError(message);
        addToast(message, "error");
      }
    } catch {
      if (requestId !== statementRequestRef.current) return;
      const message = t("statementLoadError");
      setStatementError(message);
      addToast(message, "error");
    } finally {
      if (requestId === statementRequestRef.current) setStatementLoading(false);
    }
  }, [addToast, t]);

  const loadResetHistory = useCallback(async (customerId: string) => {
    try {
      const result = await getCustomerResetHistory(customerId);
      if (result.success) {
        setResetHistory(result.resets ?? []);
      }
    } catch {
      // Reset history is audit context; a missing history response should not
      // prevent the customer statement from opening.
    }
  }, []);

  const handleCustomerSelect = useCallback((customerId: string) => {
    setSelectedCustomer(customerId);
    setAccruedFines(0);
    setTotalBalanceDue(0);
    setStatementError(null);
    setSuccessState(null);
    setResetHistory([]);
    if (customerId) {
      const immediateCust = customers.find(c => c.id === customerId);
      if (immediateCust) {
        setCustomer(immediateCust);
      }
      setStatement([]);
      loadStatement(customerId);
      loadResetHistory(customerId);
    } else {
      setCustomer(null);
      setStatement([]);
    }
  }, [customers, loadStatement, loadResetHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSuccessState(null);
    const parsedAmount = Number(modalFormData.amount);
    if (!modalFormData.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast(t("invalidAmount"), "error");
      return;
    }
    setSaving(true);
    const signature = JSON.stringify({
      customerId: selectedCustomer,
      type: modalFormData.type,
      amount: parsedAmount,
      note: modalFormData.note.trim(),
    });
    const existingIdempotency = transactionIdempotencyRef.current;
    const idempotencyKey = existingIdempotency?.signature === signature
      ? existingIdempotency.key
      : crypto.randomUUID();
    transactionIdempotencyRef.current = { key: idempotencyKey, signature };
    try {
      const result = await createKhataTransaction({
        customerId: selectedCustomer, type: modalFormData.type,
        amount: parsedAmount, note: modalFormData.note || undefined, idempotencyKey,
      });
      if (result.error) {
        addToast(result.error, "error");
      } else {
        addToast(t("transactionAdded"), "success");
        setSuccessState("transaction");
        if (result.overpayment && result.overpayment > 0) {
          addToast(t("overpaymentNotice", { amount: fmt(result.overpayment) }), "warning");
        }
        setShowModal(false);
        setModalFormData({ type: "credit", amount: "", note: "" });
        transactionIdempotencyRef.current = null;
        void loadStatement(selectedCustomer);
        void loadCustomers();
        router.refresh();
      }
    } catch {
      addToast(t("transactionResultUnknown"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelTransaction = async () => {
    if (!cancelId) return;
    setSuccessState(null);
    setCancelling(true);
    try {
      const result = await deleteKhataTransaction(cancelId);
      if (result.success && selectedCustomer) {
        addToast(t("transactionCancelled"), "success");
        setSuccessState("cancel");
        void loadStatement(selectedCustomer);
        void loadCustomers();
        router.refresh();
      } else if (result.error) {
        addToast(result.error, "error");
      }
    } catch {
      addToast(t("cancelResultUnknown"), "error");
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setSuccessState(null);
    const amount = Number(paymentData.amount);
    if (!amount || amount <= 0) {
      addToast(t("invalidAmount"), "error");
      return;
    }
    setSaving(true);
    const signature = JSON.stringify({
      customerId: selectedCustomer,
      type: "debit",
      amount,
      method: paymentData.method,
      note: paymentData.note.trim(),
    });
    const existingIdempotency = paymentIdempotencyRef.current;
    const idempotencyKey = existingIdempotency?.signature === signature
      ? existingIdempotency.key
      : crypto.randomUUID();
    paymentIdempotencyRef.current = { key: idempotencyKey, signature };
    try {
      const result = await createKhataTransaction({
        customerId: selectedCustomer, type: "debit",
        amount, paymentMethod: paymentData.method, note: paymentData.note || undefined, idempotencyKey,
      });
      if (result.error) {
        addToast(result.error, "error");
      } else {
        addToast(t("paymentRecorded"), "success");
        setSuccessState("payment");
        if (result.overpayment && result.overpayment > 0) {
          addToast(t("overpaymentNotice", { amount: fmt(result.overpayment) }), "warning");
        }
        setShowPaymentModal(false);
        setPaymentData({ amount: "", note: "", method: "cash" });
        paymentIdempotencyRef.current = null;
        void loadStatement(selectedCustomer);
        void loadCustomers();
        router.refresh();
      }
    } catch {
      addToast(t("paymentResultUnknown"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCollectFines = useCallback(async () => {
    if (!selectedCustomer) return;
    setSuccessState(null);
    setCollectingFines(true);
    try {
      const result = await chargeLateFees(selectedCustomer);
      if ('error' in result) {
        addToast(result.error!, "error");
      } else if (result.charged > 0) {
        addToast(t("feesCollected", { amount: fmt(result.charged), count: result.count }), "success");
        setSuccessState("fine");
        void loadStatement(selectedCustomer);
        void loadCustomers();
        router.refresh();
      } else {
        addToast(t("noFeesToCollect"), "info");
      }
    } catch {
      addToast(t("feeResultUnknown"), "error");
    } finally {
      setCollectingFines(false);
    }
  }, [selectedCustomer, addToast, loadStatement, loadCustomers, router, t]);

  const handleResetKhata = useCallback(async () => {
    if (!selectedCustomer) return;
    setSuccessState(null);
    setResetting(true);
    try {
      const result = await resetCustomerKhata(selectedCustomer, true);
      if ('error' in result) {
        addToast(result.error!, "error");
      } else {
        addToast(t("khataResetComplete", { amount: fmt(result.amountReset), count: result.invoiceCount }), "success");
        setSuccessState("reset");
        setShowResetModal(false);
        void loadStatement(selectedCustomer);
        void loadCustomers();
        void loadResetHistory(selectedCustomer);
        router.refresh();
      }
    } catch {
      addToast(t("resetResultUnknown"), "error");
    } finally {
      setResetting(false);
    }
  }, [selectedCustomer, addToast, loadStatement, loadCustomers, loadResetHistory, router, t]);

  const retryStatement = useCallback(() => {
    if (selectedCustomer) void loadStatement(selectedCustomer);
  }, [selectedCustomer, loadStatement]);

  return {
    customers, customer, statement, loading, statementLoading, customersError, statementError, customerSearch,
    customerTotal, loadingMoreCustomers, loadMoreCustomersError,
    selectedCustomer, accruedFines, totalBalanceDue, overdueIds,
    successState,
    resetHistory, showResetModal, resetting,
    showModal, showPaymentModal, cancelId, cancelling, saving, collectingFines,
    modalFormData, paymentData,
    setCustomerSearch, setShowModal, setShowPaymentModal,
    setModalFormData, setPaymentData, setCancelId,
    setShowResetModal,
    loadCustomers, loadMoreCustomers, retryStatement,
    handleCustomerSelect, handleSubmit, handleCancelTransaction, handlePaymentSubmit,
    handleCollectFines, handleResetKhata,
  };
}
