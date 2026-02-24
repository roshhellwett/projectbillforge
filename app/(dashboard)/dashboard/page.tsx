import { getSalesSummary } from "@/lib/actions/invoices";
import { getLowStockProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { DollarSign, FileText, Users, AlertTriangle, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const [salesResult, lowStockResult, customersResult] = await Promise.all([
    getSalesSummary(),
    getLowStockProducts(),
    getCustomers(),
  ]);

  const summary = salesResult.success ? salesResult.summary : {
    todaySales: 0,
    totalSales: 0,
    totalInvoices: 0,
    totalCustomers: 0,
    totalReceivable: 0,
  };

  const lowStock = lowStockResult.success ? lowStockResult.products : [];
  const customers = customersResult.success ? customersResult.customers : [];

  const topReceivables = customers
    .filter(c => (c.currentBalance ?? 0) > 0)
    .sort((a, b) => (b.currentBalance ?? 0) - (a.currentBalance ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here&apos;s your business overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Today&apos;s Sales</p>
              <p className="text-2xl font-bold text-slate-900">₹{summary.todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Sales</p>
              <p className="text-2xl font-bold text-slate-900">₹{summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Invoices</p>
              <p className="text-2xl font-bold text-slate-900">{summary.totalInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Users className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Receivables</p>
              <p className="text-2xl font-bold text-slate-900">₹{summary.totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Receivables (Khata)</h2>
          {topReceivables.length === 0 ? (
            <p className="text-slate-500 text-sm">No outstanding balances</p>
          ) : (
            <div className="space-y-3">
              {topReceivables.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">{customer.name}</p>
                    <p className="text-xs text-slate-500">{customer.phone || "No phone"}</p>
                  </div>
                  <p className="font-semibold text-orange-600">₹{(customer.currentBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Low Stock Alerts
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-slate-500 text-sm">All products are well stocked</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">Threshold: {product.lowStockThreshold}</p>
                  </div>
                  <p className="font-semibold text-red-600">{product.stockQuantity} left</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
