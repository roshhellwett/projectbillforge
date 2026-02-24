"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/actions/products";
import { getBusinessProfile } from "@/lib/actions/business";
import { ConfirmDialog, SkeletonTable } from "@/lib/components/ui";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";

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
  metadata: Record<string, any> | null;
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
    setMetadata(product.metadata || {});
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteProduct(deleteId);
    if (result.success) {
      loadData();
      router.refresh();
    }
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
    setShowModal(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500">Manage your product inventory</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={5} />
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">HSN</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">GST %</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                    <td className="px-4 py-3 text-slate-600">{product.sku || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{product.hsnCode || "-"}</td>
                    <td className="px-4 py-3 text-slate-900">₹{product.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-600">{product.gstRate ?? 0}%</td>
                    <td className="px-4 py-3">
                      <span className={(product.stockQuantity ?? 0) <= (product.lowStockThreshold ?? 0) ? "text-red-600 font-medium" : "text-slate-900"}>
                        {product.stockQuantity ?? 0} {product.unit ?? 'piece'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          aria-label="Edit product"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold">{editingProduct ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getDefaultUnits(industryType).map((u: string) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rate (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GST Rate (%)</label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {gstRates.map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {industryType === "mobile" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">IMEI Number</label>
                    <input
                      type="text"
                      value={metadata.imei || ""}
                      onChange={(e) => setMetadata({ ...metadata, imei: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="15 digit IMEI"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Color/Variant</label>
                    <input
                      type="text"
                      value={metadata.color || ""}
                      onChange={(e) => setMetadata({ ...metadata, color: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Black, 128GB"
                    />
                  </div>
                </div>
              )}

              {industryType === "pharmacy" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Batch Number *</label>
                    <input
                      type="text"
                      required
                      value={metadata.batchNumber || ""}
                      onChange={(e) => setMetadata({ ...metadata, batchNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={metadata.expiryDate || ""}
                      onChange={(e) => setMetadata({ ...metadata, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {industryType === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Custom Label</label>
                  <input
                    type="text"
                    value={metadata.customLabel || ""}
                    onChange={(e) => setMetadata({ ...metadata, customLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Brand, Size, Color"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingProduct ? "Update" : "Create"}
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
    </div>
  );
}
