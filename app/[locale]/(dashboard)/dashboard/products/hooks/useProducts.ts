"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
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

export function useProducts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [industryType, setIndustryType] = useState<IndustryType>("custom");
  const [formData, setFormData] = useState({
    name: "", sku: "", hsnCode: "", unit: "piece", rate: "",
    gstRate: "0", stockQuantity: "", lowStockThreshold: "",
  });
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [offset, setOffset] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [productsResult, businessResult] = await Promise.all([
      getProducts(PAGE_SIZE, 0), getBusinessProfile(),
    ]);
    if (productsResult.success) {
      setProducts(productsResult.products);
      setTotalProducts(productsResult.total ?? 0);
      setOffset(productsResult.products.length);
    } else if (productsResult.error) {
      addToast(productsResult.error, "error");
    }
    if (businessResult.success && businessResult.business) {
      setIndustryType((businessResult.business.industryType as IndustryType) || "custom");
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      resetForm();
      setEditingProduct(null);
      setShowModal(true);
      router.replace("/dashboard/products");
    }
  }, [searchParams, router]);

  const loadMoreProducts = async () => {
    const result = await getProducts(PAGE_SIZE, offset);
    if (result.success && result.products) {
      setProducts(prev => [...prev, ...result.products]);
      setOffset(prev => prev + result.products.length);
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
    resetForm();
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
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
    const stockQty = formData.stockQuantity ? Number(formData.stockQuantity) : 0;
    const threshold = formData.lowStockThreshold ? Number(formData.lowStockThreshold) : 0;
    if (threshold >= stockQty && stockQty > 0) {
      addToast("Low stock threshold cannot be greater than or equal to stock.", "error");
      return;
    }
    const parsedRate = Number(formData.rate);
    if (!formData.rate || isNaN(parsedRate) || parsedRate <= 0) {
      addToast("Rate must be greater than 0.", "error");
      return;
    }
    setSaving(true);
    const data = {
      name: formData.name, sku: formData.sku || undefined, hsnCode: formData.hsnCode || undefined,
      unit: formData.unit, rate: parsedRate, gstRate: formData.gstRate ? Number(formData.gstRate) : 0,
      stockQuantity: stockQty, lowStockThreshold: threshold,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };
    const result = editingProduct
      ? await updateProduct(editingProduct.id, data)
      : await createProduct(data);
    if (result.error) {
      addToast(result.error, "error");
    } else {
      addToast(editingProduct ? "Product updated" : "Product created", "success");
      setShowModal(false);
      setEditingProduct(null);
      loadData();
      router.refresh();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteProduct(deleteId);
    if (result.success) {
      addToast("Product deleted", "success");
      loadData();
      router.refresh();
    } else if (result.error) {
      addToast(result.error, "error");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return {
    products, filteredProducts, loading, search, showModal, editingProduct,
    industryType, formData, metadata, saving, deleteId, deleting,
    offset, totalProducts,
    setSearch, setShowModal, setFormData, setMetadata, setDeleteId,
    openModal, handleEdit, handleSubmit, handleDelete, loadMoreProducts,
  };
}
