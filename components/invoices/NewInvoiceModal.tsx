import React, { useState, useMemo, useRef, useEffect } from "react";
import { X, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { formatCurrency } from "@/lib/formatters";
import { Decimal } from "decimal.js";
import { ConfirmDialog } from "@/components/ui/ui";

interface Product {
    id: string;
    name: string;
    rate: number;
    gstRate: number | null;
    stockQuantity: number | null;
    unit: string | null;
    isActive: boolean | null;
}

interface Customer {
    id: string;
    name: string;
    phone: string | null;
    gstin: string | null;
    address: string | null;
}

interface InvoiceItem {
    productId: string;
    productName: string;
    quantity: number;
    rate: number;
    gstRate: number;
    amount: number;
    cgst: number;
    sgst: number;
    igst: number;
}

interface InvoiceFormData {
    customerId: string;
    customerName: string;
    customerGstin: string;
    customerAddress: string;
    invoiceDate: string;
    paymentMode: "cash" | "upi" | "khata";
}

interface NewInvoiceModalProps {
    customers: Customer[];
    products: Product[];
    onClose: () => void;
    onSubmit: (formData: InvoiceFormData, items: InvoiceItem[], isInterState: boolean) => Promise<void>;
    saving: boolean;
    error: string;
}


const round2 = (n: number): number => new Decimal(n).toDecimalPlaces(2).toNumber();

// Match backend: CGST rounds down, SGST gets remainder (avoids 1-paisa mismatch)
function splitGst(totalGst: number): { cgst: number; sgst: number } {
  const cgst = Math.floor(totalGst * 100 / 2) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;
  return { cgst, sgst };
}


const getISTDateString = (): string => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

export function NewInvoiceModal({ customers, products, onClose, onSubmit, saving, error }: NewInvoiceModalProps) {
    const t = useTranslations('Invoices');
    const router = useRouter();

    const [formData, setFormData] = useState({
        customerId: "",
        customerName: "",
        customerGstin: "",
        customerAddress: "",
        invoiceDate: getISTDateString(),
        paymentMode: "cash" as "cash" | "upi" | "khata",
    });

    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [itemQuantity, setItemQuantity] = useState("");
    const [isInterState, setIsInterState] = useState(false);
    const [pendingLowStock, setPendingLowStock] = useState<{ product: Product; qty: number } | null>(null);
    const [productSearch, setProductSearch] = useState("");
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const productRef = useRef<HTMLDivElement>(null);

    const filteredProducts = useMemo(() => {
      if (!productSearch) return products.filter(p => p.isActive);
      const q = productSearch.toLowerCase();
      return products.filter(p => p.isActive && p.name.toLowerCase().includes(q));
    }, [products, productSearch]);

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (productRef.current && !productRef.current.contains(e.target as Node)) {
          setShowProductDropdown(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const addItem = () => {
        if (!selectedProduct) return;
        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        const qty = parseFloat(itemQuantity) || 1;
        if (qty <= 0) return;

        
        if (product.stockQuantity !== null && product.stockQuantity >= 0 && qty > product.stockQuantity) {
            setPendingLowStock({ product, qty });
            return;
        }

        addItemToInvoice(product, qty);
    };

    const addItemToInvoice = (product: Product, qty: number) => {
        const existingIndex = items.findIndex(i => i.productId === product.id);
        if (existingIndex !== -1) {
            const existing = items[existingIndex];
            const newQty = round2(existing.quantity + qty);
            const newAmount = round2(product.rate * newQty);
            const gstRate = product.gstRate ?? 0;
            const newGstAmount = newAmount * (gstRate / 100);
            const updatedItem: InvoiceItem = {
                ...existing,
                quantity: newQty,
                amount: newAmount,
                cgst: isInterState ? 0 : splitGst(newGstAmount).cgst,
                sgst: isInterState ? 0 : splitGst(newGstAmount).sgst,
                igst: isInterState ? round2(newGstAmount) : 0,
            };
            const newItems = [...items];
            newItems[existingIndex] = updatedItem;
            setItems(newItems);
            setSelectedProduct("");
            setItemQuantity("");
            return;
        }

        const amount = round2(product.rate * qty);
        const gstRate = product.gstRate ?? 0;
        const gstAmount = amount * (gstRate / 100);

        let cgst = 0, sgst = 0, igst = 0;
        if (isInterState) {
            igst = round2(gstAmount);
        } else {
            const split = splitGst(gstAmount);
            cgst = split.cgst;
            sgst = split.sgst;
        }

        const newItem: InvoiceItem = {
            productId: product.id,
            productName: product.name,
            quantity: qty,
            rate: product.rate,
            gstRate: gstRate,
            amount,
            cgst,
            sgst,
            igst,
        };

        setItems([...items, newItem]);
        setSelectedProduct("");
        setItemQuantity("");
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleInterStateToggle = (checked: boolean) => {
        setIsInterState(checked);
        setItems(prevItems => prevItems.map(item => {
            const gstAmount = item.amount * (item.gstRate / 100);
            if (checked) {
                return { ...item, cgst: 0, sgst: 0, igst: round2(gstAmount) };
            } else {
                const split = splitGst(gstAmount);
                return { ...item, cgst: split.cgst, sgst: split.sgst, igst: 0 };
            }
        }));
    };

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setFormData({
                ...formData,
                customerId,
                customerName: customer.name,
                customerGstin: customer.gstin || "",
                customerAddress: customer.address || "",
            });
        } else {
            setFormData({ ...formData, customerId, customerName: "", customerGstin: "", customerAddress: "" });
        }
    };

    const totals = useMemo(() => {
        return items.reduce(
            (acc, item) => ({
                subtotal: acc.subtotal + item.amount,
                cgst: acc.cgst + item.cgst,
                sgst: acc.sgst + item.sgst,
                igst: acc.igst + item.igst,
            }),
            { subtotal: 0, cgst: 0, sgst: 0, igst: 0 }
        );
    }, [items]);

    const grandTotal = totals.subtotal + totals.cgst + totals.sgst + totals.igst;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData, items, isInterState);
    };

    return (
        <div className="glass-overlay">
            <div className="glass-card glass-modal-panel w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-[var(--border)]/50">
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">{t('newInvoice')}</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors" aria-label="Close">
                        <X size={20} className="text-[var(--foreground)]/60" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                    {error && <div className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-lg text-sm border border-[var(--color-danger)]/20">{error}</div>}

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                        <div className="sm:col-span-7">
                            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t('customerName')}</label>
                            <div className="flex gap-2">
                                <select
                                    value={formData.customerId}
                                    onChange={(e) => handleCustomerChange(e.target.value)}
                                    className="w-44 glass-input text-sm"
                                >
                                    <option value="">Select</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    required
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    className="w-full glass-input"
                                    placeholder="Walk-in Customer"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-5">
                            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t('paymentMode')}</label>
                            <div className="flex gap-1.5 p-1 bg-[var(--foreground)]/[0.05] rounded-xl">
                                {(["cash", "upi", "khata"] as const).map(mode => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, paymentMode: mode })}
                                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                            formData.paymentMode === mode
                                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm font-bold"
                                                : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/80"
                                        }`}
                                    >
                                        {mode === "cash" ? "💵 Cash" : mode === "upi" ? "📱 UPI" : "📒 Khata"}
                                    </button>
                                ))}
                            </div>
                            {formData.paymentMode === 'khata' && !formData.customerId && (
                                <p className="text-xs text-[var(--color-warning)] mt-1 font-medium">⚠ Select a customer for Khata</p>
                            )}
                        </div>
                        <div className="sm:col-span-4">
                            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t('invoiceDate')}</label>
                            <input
                                type="date"
                                required
                                value={formData.invoiceDate}
                                max={getISTDateString()}
                                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                                className="w-full glass-input"
                            />
                        </div>
                        <div className="sm:col-span-3 flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="isInterState"
                                    checked={isInterState}
                                    onChange={(e) => handleInterStateToggle(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                />
                                <span className="text-sm text-[var(--foreground)]/70">Inter-State</span>
                            </label>
                        </div>
                    </div>

                    <div className="border border-[var(--border)] rounded-xl p-3 sm:p-4">
                        <h3 className="font-semibold text-[var(--foreground)] mb-3 sm:mb-4">{t('items')}</h3>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mb-3 sm:mb-4">
                            <div ref={productRef} className="relative flex-1">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" />
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                                        onFocus={() => setShowProductDropdown(true)}
                                        placeholder={t('selectProduct')}
                                        className="w-full glass-input min-h-[44px] pl-9"
                                    />
                                </div>
                                {showProductDropdown && (
                                    <div className="absolute z-50 mt-1 w-full glass-card max-h-48 overflow-y-auto border border-[var(--border)] rounded-xl shadow-lg">
                                        {filteredProducts.length === 0 ? (
                                            <div className="p-3 text-sm text-[var(--foreground)]/50 text-center">No products found</div>
                                        ) : filteredProducts.map(p => (
                                            <button
                                                key={p.id} type="button"
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-primary)]/10 transition-colors ${selectedProduct === p.id ? "bg-[var(--color-primary)]/10 font-medium" : ""}`}
                                                onClick={() => { setSelectedProduct(p.id); setProductSearch(p.name); setShowProductDropdown(false); }}
                                            >
                                                {p.name} — ₹{p.rate} ({p.gstRate}% GST)
                                                {p.unit && <span className="text-[var(--foreground)]/40 ml-1">/ {p.unit}</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/products')}
                                className="px-3 py-2 border border-[var(--border)] text-[var(--foreground)]/60 rounded-xl hover:bg-[var(--foreground)]/5 text-sm min-h-[44px]"
                                title="Add new product"
                            >
                                + New
                            </button>
                            <div className="relative flex items-center">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    step="any"
                                    min="0.01"
                                    value={itemQuantity}
                                    onChange={(e) => setItemQuantity(e.target.value)}
                                    className="w-20 sm:w-24 glass-input min-h-[44px] font-mono font-bold text-center"
                                    placeholder="0"
                                />
                                {selectedProduct && products.find(p => p.id === selectedProduct)?.unit && (
                                    <span className="absolute right-3 text-xs text-[var(--foreground)]/40 pointer-events-none">
                                        {products.find(p => p.id === selectedProduct)?.unit}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="px-4 py-2 glass-btn-primary rounded-xl min-h-[44px]"
                            >
                                {t('add')}
                            </button>
                        </div>

                        {items.length > 0 ? (
                            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                                <table className="w-full text-xs sm:text-sm min-w-[500px]">
                                    <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]/30 rounded-t-lg">
                                        <tr>
                                            <th className="px-2 sm:px-3 py-2 text-left">Item</th>
                                            <th className="px-2 sm:px-3 py-2 text-right">Qty</th>
                                            <th className="px-2 sm:px-3 py-2 text-right">Rate</th>
                                            <th className="px-2 sm:px-3 py-2 text-right">Amount</th>
                                            <th className="px-2 sm:px-3 py-2 text-right">GST</th>
                                            <th className="px-2 sm:px-3 py-2 text-right">Total</th>
                                            <th className="px-2 sm:px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]/30">
                                        {items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-2 sm:px-3 py-2">{item.productName}</td>
                                                <td className="px-2 sm:px-3 py-2 text-right">{item.quantity}</td>
                                                <td className="px-2 sm:px-3 py-2 text-right">{formatCurrency(item.rate)}</td>
                                                <td className="px-2 sm:px-3 py-2 text-right">{formatCurrency(item.amount)}</td>
                                                <td className="px-2 sm:px-3 py-2 text-right">
                                                    {isInterState
                                                        ? `IGST ${formatCurrency(item.igst)}`
                                                        : `C ${formatCurrency(item.cgst)} S ${formatCurrency(item.sgst)}`
                                                    }
                                                </td>
                                                <td className="px-2 sm:px-3 py-2 text-right font-medium">
                                                    {formatCurrency(item.amount + item.cgst + item.sgst + item.igst)}
                                                </td>
                                                <td className="px-2 sm:px-3 py-2">
                                                    <button type="button" onClick={() => removeItem(idx)} className="text-[var(--color-danger)]/80 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 p-1.5 rounded-lg transition-colors">
                                                        <X size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-[var(--foreground)]/50 py-4">No items added</p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <div className="w-full sm:w-64 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[var(--foreground)]/60">{t('subtotal')}</span>
                                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                            </div>
                            {!isInterState && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--foreground)]/60">CGST:</span>
                                        <span className="font-medium">{formatCurrency(totals.cgst)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--foreground)]/60">SGST:</span>
                                        <span className="font-medium">{formatCurrency(totals.sgst)}</span>
                                    </div>
                                </>
                            )}
                            {isInterState && (
                                <div className="flex justify-between">
                                    <span className="text-[var(--foreground)]/60">IGST:</span>
                                    <span className="font-medium">{formatCurrency(totals.igst)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>{t('total')}</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2 sm:pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="glass-btn-secondary flex-1 min-h-[44px]"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving || items.length === 0}
                            className="glass-btn-primary flex-1 min-h-[44px]"
                        >
                            {saving ? t('creating') : t('createInvoice')}
                        </button>
                    </div>
                </form>
            </div>
            {pendingLowStock && (
                <ConfirmDialog
                    open={true}
                    title="Low Stock Warning"
                    message={`Only ${pendingLowStock.product.stockQuantity} ${pendingLowStock.product.unit ?? 'units'} of "${pendingLowStock.product.name}" in stock. Add ${pendingLowStock.qty} anyway?`}
                    confirmLabel="Add Anyway"
                    onConfirm={() => {
                        addItemToInvoice(pendingLowStock.product, pendingLowStock.qty);
                        setPendingLowStock(null);
                    }}
                    onCancel={() => setPendingLowStock(null)}
                    variant="warning"
                />
            )}
        </div>
    );
}
