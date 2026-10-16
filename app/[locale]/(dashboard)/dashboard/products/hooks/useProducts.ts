"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/actions/products";
import { getBusinessProfile } from "@/lib/actions/business";
import { useToast } from "@/components/ui/Toast";

export interface Product {
  id: string; name: string; sku: string | null; hsnCode: string | null;
  unit: string | null; rate: number; gstRate: number | null;
  stockQuantity: number | null; lowStockThreshold: number | null;
  metadata: Record<string, unknown> | null; isActive: boolean | null;
}

export type IndustryType = "mobile" | "pharmacy" | "kirana" | "garments" | "electronics" | "custom";

export const gstRates = [0, 5, 12, 18, 28];
export const PAGE_SIZE = 50;

export function getDefaultUnits(industry: IndustryType) {
  switch (industry) {
    case "kirana": return ["kg", "grams", "packets", "liters", "piece"];
    case "garments": return ["piece", "meter", "dozen", "set"];
    case "electronics": return ["piece", "box", "set"];
    case "pharmacy": return ["piece", "strip", "box", "bottle"];
    default: return ["piece", "kg", "meter", "liter", "box", "dozen"];
  }
}

export function useProducts(initialData?: { products?: Product[]; totalProducts?: number; totalLowStock?: number; industryType?: IndustryType }, initialError?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Products");
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>(initialData?.products ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialError ?? null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [industryType, setIndustryType] = useState<IndustryType>(initialData?.industryType ?? "custom");
  const [formData, setFormData] = useState({
    name: "", sku: "", hsnCode: "", unit: "piece", rate: "",
    gstRate: "0", stockQuantity: "", lowStockThreshold: "",
  });
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [offset, setOffset] = useState(initialData?.products?.length ?? 0);
  const [totalProducts, setTotalProducts] = useState(initialData?.totalProducts ?? 0);
  const [totalLowStock, setTotalLowStock] = useState(initialData?.totalLowStock ?? 0);
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
      const [productsResult, businessResult] = await Promise.all([
        getProducts(PAGE_SIZE, 0, query), getBusinessProfile(),
      ]);
      if (requestVersion !== requestVersionRef.current) return;
      if (productsResult.success) {
        setProducts(productsResult.products);
        setTotalProducts(productsResult.total ?? 0);
        setTotalLowStock(productsResult.totalLowStock ?? 0);
        setOffset(productsResult.products.length);
      } else if (productsResult.error) {
        const message = t("loadErrorMessage");
        setLoadError(message);
        addToast(message, "error");
      }
      if (businessResult.success && businessResult.business) {
        setIndustryType((businessResult.business.industryType as IndustryType) || "custom");
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
      resetForm();
      setEditingProduct(null);
      setShowModal(true);
      router.replace("/dashboard/products");
    }
  }, [searchParams, router]);

  const loadMoreProducts = async () => {
    if (loadingMore || offset >= totalProducts) return;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const result = await getProducts(PAGE_SIZE, offset, search.trim());
      if (result.success && result.products) {
        setProducts(prev => [...prev, ...result.products]);
        setOffset(prev => prev + result.products.length);
        if (typeof result.total === "number") setTotalProducts(result.total);
        if (result.products.length === 0) setTotalProducts(offset);
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

  const resetForm = () => {
    setFormData({
      name: "", sku: "", hsnCode: "",
      unit: industryType === "kirana" ? "kg" : "piece",
      rate: "", gstRate: "0", stockQuantity: "", lowStockThreshold: "",
    });
    setMetadata({});
  };

  const openModal = () => {
    setFormError(null);
    setSuccessMessage(null);
    resetForm();
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setFormError(null);
    setSuccessMessage(null);
    setEditingProduct(product);
    setFormData({
      name: product.name, sku: product.sku || "", hsnCode: product.hsnCode || "",
      unit: product.unit ?? "piece", rate: product.rate?.toString() ?? "",
      gstRate: product.gstRate?.toString() ?? "0",
      stockQuantity: product.stockQuantity?.toString() ?? "",
      lowStockThreshold: product.lowStockThreshold?.toString() ?? "",
    });
    setMetadata(
      product.metadata
        ? Object.fromEntries(Object.entries(product.metadata).filter((e): e is [string, string] => typeof e[1] === "string"))
        : {}
    );
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    const name = formData.name.trim();
    const sku = formData.sku.trim();
    const hsnCode = formData.hsnCode.trim();
    const stockQty = formData.stockQuantity ? Number(formData.stockQuantity) : 0;
    const threshold = formData.lowStockThreshold ? Number(formData.lowStockThreshold) : 0;
    const parsedRate = Number(formData.rate);

    if (!name) {
      setFormError(t("validationName"));
      return;
    }
    if (!formData.rate || !Number.isFinite(parsedRate) || parsedRate <= 0) {
      setFormError(t("validationRate"));
      return;
    }
    if (!Number.isFinite(stockQty) || stockQty < 0 || !Number.isFinite(threshold) || threshold < 0) {
      setFormError(t("validationStock"));
      return;
    }
    if (industryType === "pharmacy" && !editingProduct && (!metadata.batchNumber?.trim() || !metadata.expiryDate)) {
      setFormError(t("validationPharmacyMetadata"));
      return;
    }
    if (industryType === "mobile" && metadata.imei?.trim() && !/^\d{15}$/.test(metadata.imei.trim())) {
      setFormError(t("validationImei"));
      return;
    }
    setSaving(true);
    const data = {
      name, sku: sku || undefined, hsnCode: hsnCode || undefined,
      unit: formData.unit, rate: parsedRate, gstRate: formData.gstRate ? Number(formData.gstRate) : 0,
      stockQuantity: stockQty, lowStockThreshold: threshold,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };
    try {
      const result = editingProduct
        ? await updateProduct(editingProduct.id, data)
        : await createProduct(data);
      if (!result.success) {
        const message = result.error ?? t("saveError");
        setFormError(message);
        addToast(message, "error");
      } else {
        const message = editingProduct ? t("successUpdated") : t("successCreated");
        addToast(message, "success");
        setSuccessMessage(message);
        setShowModal(false);
        setEditingProduct(null);
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
      const result = await deleteProduct(deleteId);
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
  const filteredProducts = products.filter(p => {
    if (!normalizedSearch) return true;
    return [p.name, p.sku ?? "", p.hsnCode ?? "", p.unit ?? ""]
      .some(value => value.toLowerCase().includes(normalizedSearch));
  });

  return {
    products, filteredProducts, totalLowStock, loading, refreshing, search, showModal, editingProduct,
    industryType, formData, metadata, saving, formError, deleteId, deleting, deleteError,
    offset, totalProducts, loadError, loadMoreError, loadingMore, successMessage,
    setSearch, setShowModal, setFormData, setFormError, setMetadata, setDeleteId, setDeleteError,
    openModal, handleEdit, handleSubmit, handleDelete, loadMoreProducts, loadData,
  };
}
