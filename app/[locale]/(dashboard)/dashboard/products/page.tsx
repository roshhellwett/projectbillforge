"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/actions/products";
import { getBusinessProfile } from "@/lib/actions/business";
import { ConfirmDialog, SkeletonTable } from "@/lib/components/ui";
import { useTranslations } from "next-intl";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn } from "@/lib/components/MotionWrapper";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  hsnCode: string | null;
  unit: string | null;
  rate: number;
  gstRate: number | null;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean | null;
}

type IndustryType = "mobile" | "pharmacy" | "kirana" | "garments" | "electronics" | "custom";

const gstRates = [0, 5, 12, 18, 28];

const getDefaultUnits = (industry: IndustryType) => {
  switch (industry) {
    case "kirana": return ["kg", "grams", "packets", "liters", "piece"];
    case "garments": return ["piece", "meter", "dozen", "set"];
    case "electronics": return ["piece", "box", "set"];
    case "pharmacy": return ["piece", "strip", "box", "bottle"];
    default: return ["piece", "kg", "meter", "liter", "box", "dozen"];
  }
};

export default function ProductsPage() {
  const t = useTranslations('Products');
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [industryType, setIndustryType] = useState<IndustryType>("custom");
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    hsnCode: "",
    unit: "piece",
    rate: "",
    gstRate: "0",
    stockQuantity: "",
    lowStockThreshold: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [productsResult, businessResult] = await Promise.all([
      getProducts(),
      getBusinessProfile()
    ]);
    if (productsResult.success) {
      setProducts(productsResult.products);
    }
    if (businessResult.success && businessResult.business) {
      setIndustryType((businessResult.business.industryType as IndustryType) || "custom");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const stockQty = formData.stockQuantity ? Number(formData.stockQuantity) : 0;
    const threshold = formData.lowStockThreshold ? Number(formData.lowStockThreshold) : 0;

    if (threshold >= stockQty && stockQty > 0) {
      setError("Low stock threshold cannot be greater than or equal to the actual stock.");
      return;
    }

    setSaving(true);

    const data = {
      name: formData.name,
      sku: formData.sku || undefined,
      hsnCode: formData.hsnCode || undefined,
      unit: formData.unit,
      rate: Number(formData.rate) || 0,
      gstRate: formData.gstRate ? Number(formData.gstRate) : 0,
      stockQuantity: stockQty,
      lowStockThreshold: threshold,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, data);
    } else {
      result = await createProduct(data);
    }

    if (result.error) {
      setError(result.error);
    } else {
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadData();
      router.refresh();
    }
    setSaving(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setError("");
    setFormData({
      name: product.name,
      sku: product.sku || "",
      hsnCode: product.hsnCode || "",
      unit: product.unit ?? "piece",
      rate: product.rate?.toString() ?? "",
      gstRate: product.gstRate?.toString() ?? "0",
      stockQuantity: product.stockQuantity?.toString() ?? "",
      lowStockThreshold: product.lowStockThreshold?.toString() ?? "",
    });
    setMetadata(normalizeMetadata(product.metadata));
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteProduct(deleteId);
    if (result.success) {
      loadData();
      router.refresh();
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      hsnCode: "",
      unit: industryType === "kirana" ? "kg" : "piece",
      rate: "",
      gstRate: "0",
      stockQuantity: "",
      lowStockThreshold: "",
    });
    setMetadata({});
  };

  const openModal = () => {
    resetForm();
    setEditingProduct(null);
    setError("");
    setShowModal(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StaggerContainer className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{t('title')}</h1>
          <p className="text-[var(--foreground)]/60 mt-1">{t('subtitle')}</p>
        </div>
        <button
          onClick={openModal}
          className="glass-btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          {t('addProduct')}
        </button>
      </FadeIn>

      <StaggerItem className="glass-card overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[var(--border)]/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-[var(--color-primary)]/60 pointer-events-none" size={18} />
            <input
              type="text"
              placeholder={t('searchProduct')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-4 py-3 glass-input text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 font-medium focus:ring-0"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4"><SkeletonTable rows={5} /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-[var(--foreground)]/50 font-medium">{t('noProducts')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--foreground)]/5 border-b border-[var(--border)]/30">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">Name</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">SKU</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">HSN</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t('rate')}</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t('gstRate')}</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t('stock')}</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/30">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[var(--foreground)]/[0.02] transition-colors">
                    <td className="px-5 py-4 font-medium text-[var(--foreground)]">{product.name}</td>
                    <td className="px-5 py-4 text-[var(--foreground)]/70 text-sm">{product.sku || "-"}</td>
                    <td className="px-5 py-4 text-[var(--foreground)]/70 text-sm">{product.hsnCode || "-"}</td>
                    <td className="px-5 py-4 text-[var(--foreground)] font-medium">₹{product.rate.toFixed(2)}</td>
                    <td className="px-5 py-4 text-[var(--foreground)]/70 text-sm">{product.gstRate ?? 0}%</td>
                    <td className="px-5 py-4 text-sm">
                      <span className={(product.stockQuantity ?? 0) <= (product.lowStockThreshold ?? 0) ? "text-[var(--color-danger)] font-semibold" : "text-[var(--foreground)]"}>
                        {product.stockQuantity ?? 0} <span className="text-[var(--foreground)]/50">{product.unit ?? 'piece'}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100" style={{ opacity: 1 }}> {/* simplified for touch */}
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 text-[var(--foreground)]/40 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                          aria-label="Edit product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-1.5 text-[var(--foreground)]/40 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-lg transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </StaggerItem>

      {showModal && (
        <div className="glass-overlay">
          <div className="glass-card glass-modal-panel max-w-lg">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]/50">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{editingProduct ? t('editProduct') : t('addProduct')}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors" aria-label="Close">
                <X size={20} className="text-[var(--foreground)]/60" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl text-sm font-medium border border-[var(--color-danger)]/20">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t('productName')}</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full glass-input" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">SKU</label>
                  <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">HSN Code</label>
                  <input type="text" value={formData.hsnCode} onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })} className="w-full glass-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Unit</label>
                  <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full glass-input">
                    {getDefaultUnits(industryType).map((u: string) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Rate (₹) *</label>
                  <input type="number" step="0.01" min="0" required value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} className="w-full glass-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t('gstRate')}</label>
                  <select value={formData.gstRate} onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })} className="w-full glass-input">
                    {gstRates.map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Initial {t('stock')}</label>
                  <input type="number" min="0" step="any" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} className="w-full glass-input" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Low Stock Threshold</label>
                <input type="number" min="0" step="any" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })} className="w-full glass-input" />
              </div>

              {industryType === "mobile" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">IMEI Number</label>
                    <input type="text" value={metadata.imei || ""} onChange={(e) => setMetadata({ ...metadata, imei: e.target.value })} className="w-full glass-input" placeholder="15 digit IMEI" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Color/Variant</label>
                    <input type="text" value={metadata.color || ""} onChange={(e) => setMetadata({ ...metadata, color: e.target.value })} className="w-full glass-input" placeholder="e.g., Black, 128GB" />
                  </div>
                </div>
              )}

              {industryType === "pharmacy" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Batch Number *</label>
                    <input type="text" required value={metadata.batchNumber || ""} onChange={(e) => setMetadata({ ...metadata, batchNumber: e.target.value })} className="w-full glass-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Expiry Date *</label>
                    <input type="date" required value={metadata.expiryDate || ""} onChange={(e) => setMetadata({ ...metadata, expiryDate: e.target.value })} className="w-full glass-input" />
                  </div>
                </div>
              )}

              {industryType === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">Custom Label</label>
                  <input type="text" value={metadata.customLabel || ""} onChange={(e) => setMetadata({ ...metadata, customLabel: e.target.value })} className="w-full glass-input" placeholder="e.g., Brand, Size, Color" />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="glass-btn-secondary flex-1">{t('cancel')}</button>
                <button type="submit" disabled={saving} className="glass-btn-primary flex-1">
                  {saving ? t('saving') : editingProduct ? t('updateProduct') : t('createProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </StaggerContainer>
  );
}
  const normalizeMetadata = (value: Record<string, unknown> | null): Record<string, string> => {
    if (!value) return {};
    return Object.fromEntries(
      Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string")
    );
  };
