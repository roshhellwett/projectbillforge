import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { formatCurrency } from "@/lib/formatters";

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
    notes: string;
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

// Round to 2 decimal places to match server-side Decimal.js precision
const round2 = (n: number): number => Math.round(n * 100) / 100;

export function NewInvoiceModal({ customers, products, onClose, onSubmit, saving, error }: NewInvoiceModalProps) {
    const t = useTranslations('Invoices');
    const router = useRouter();

    const [formData, setFormData] = useState({
        customerId: "",
        customerName: "",
        customerGstin: "",
        customerAddress: "",
        invoiceDate: new Date().toISOString().split('T')[0],
        notes: "",
        paymentMode: "cash" as "cash" | "upi" | "khata",
    });

    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [itemQuantity, setItemQuantity] = useState("");
    const [isInterState, setIsInterState] = useState(false);

    const addItem = () => {
        if (!selectedProduct) return;
        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        const qty = parseFloat(itemQuantity) || 1;
        const amount = round2(product.rate * qty);
        const gstRate = product.gstRate ?? 0;
        const gstAmount = amount * (gstRate / 100);

        let cgst = 0, sgst = 0, igst = 0;
        if (isInterState) {
            igst = round2(gstAmount);
        } else {
            cgst = round2(gstAmount / 2);
            sgst = round2(gstAmount / 2);
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
                return { ...item, cgst: round2(gstAmount / 2), sgst: round2(gstAmount / 2), igst: 0 };
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
                    {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">Customer</label>
                            <select
                                value={formData.customerId}
                                onChange={(e) => handleCustomerChange(e.target.value)}
                                className="w-full glass-input"
                            >
                                <option value="">Select Customer (Optional)</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t('customerName')}</label>
                            <input
                                type="text"
                                required
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                className="w-full glass-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">GSTIN</label>
                            <input
                                type="text"
                                value={formData.customerGstin}
                                onChange={(e) => setFormData({ ...formData, customerGstin: e.target.value?.toUpperCase() })}
                                className="w-full glass-input uppercase"
                                pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$"
                                title="Valid 15-character GSTIN"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t('invoiceDate')}</label>
                            <input
                                type="date"
                                required
                                value={formData.invoiceDate}
                                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                                className="w-full glass-input"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <input
                            type="checkbox"
                            id="isInterState"
                            checked={isInterState}
                            onChange={(e) => handleInterStateToggle(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="isInterState" className="text-sm text-[var(--foreground)]/70">Inter-State (IGST instead of CGST+SGST)</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">{t('paymentMode')}</label>
                        <div className="flex flex-wrap gap-3 sm:gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMode"
                                    value="cash"
                                    checked={formData.paymentMode === 'cash'}
                                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as "cash" })}
                                    className="w-4 h-4 text-[var(--color-primary)] bg-[var(--background)] border border-[var(--border)] focus:ring-[var(--color-primary)]"
                                />
                                <span className="text-sm text-[var(--foreground)]/70">{t('cash')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMode"
                                    value="upi"
                                    checked={formData.paymentMode === 'upi'}
                                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as "upi" })}
                                    className="w-4 h-4 text-[var(--color-primary)] bg-[var(--background)] border border-[var(--border)] focus:ring-[var(--color-primary)]"
                                />
                                <span className="text-sm text-[var(--foreground)]/70">{t('upi')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMode"
                                    value="khata"
                                    checked={formData.paymentMode === 'khata'}
                                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as "khata" })}
                                    className="w-4 h-4 text-[var(--color-primary)] bg-[var(--background)] border border-[var(--border)] focus:ring-[var(--color-primary)]"
                                />
                                <span className="text-sm text-[var(--foreground)]/70">{t('khataCredit')}</span>
                            </label>
                        </div>
                    </div>

                    <div className="border border-[var(--border)] rounded-xl p-3 sm:p-4">
                        <h3 className="font-semibold text-[var(--foreground)] mb-3 sm:mb-4">{t('items')}</h3>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mb-3 sm:mb-4">
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="flex-1 glass-input min-h-[44px]"
                            >
                                <option value="">{t('selectProduct')}</option>
                                {products.filter(p => p.isActive).map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - ₹{p.rate} ({p.gstRate}% GST)</option>
                                ))}
                            </select>
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
                                    step="any"
                                    min="0"
                                    value={itemQuantity}
                                    onChange={(e) => setItemQuantity(e.target.value)}
                                    className="w-20 sm:w-24 glass-input min-h-[44px]"
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
                                    <tbody className="divide-y divide-slate-100">
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
                            <div className="flex justify-between">
                                <span className="text-[var(--foreground)]/60">CGST:</span>
                                <span className="font-medium">{formatCurrency(totals.cgst)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--foreground)]/60">SGST:</span>
                                <span className="font-medium">{formatCurrency(totals.sgst)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--foreground)]/60">IGST:</span>
                                <span className="font-medium">{formatCurrency(totals.igst)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>{t('total')}</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t('notes')}</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            className="w-full glass-input"
                            placeholder="Optional notes..."
                        />
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
        </div>
    );
}
