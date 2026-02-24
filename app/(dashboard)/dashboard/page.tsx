import { getSalesSummary } from "@/lib/actions/invoices";
import { getLowStockProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { DollarSign, FileText, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, InteractiveItem } from "@/lib/components/MotionWrapper";

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
    <StaggerContainer className="space-y-8">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Dashboard</h1>
        <p className="text-[var(--foreground)]/60 mt-1">Welcome back! Here&apos;s your business overview.</p>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StaggerItem>
          <div className="neo-clay p-6 hover:-translate-y-1 hover:shadow-[var(--shadow-clay-hover)] group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[var(--color-success)]/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="text-[var(--color-success)]" size={26} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]/60 mb-1">Today&apos;s Sales</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">₹{summary.todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="neo-clay p-6 hover:-translate-y-1 hover:shadow-[var(--shadow-clay-hover)] group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[var(--color-primary)]/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="text-[var(--color-primary)]" size={26} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]/60 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">₹{summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="neo-clay p-6 hover:-translate-y-1 hover:shadow-[var(--shadow-clay-hover)] group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[var(--color-accent-purple)]/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FileText className="text-[var(--color-accent-purple)]" size={26} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]/60 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">{summary.totalInvoices}</p>
              </div>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="neo-clay p-6 hover:-translate-y-1 hover:shadow-[var(--shadow-clay-hover)] group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[var(--color-warning)]/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Users className="text-[var(--color-warning)]" size={26} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]/60 mb-1">Receivables</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">₹{summary.totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </StaggerItem>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaggerItem className="neo-clay p-6 md:p-8">
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] mb-6">Top Receivables</h2>
          {topReceivables.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--foreground)]/50 font-medium">No outstanding balances</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topReceivables.map((customer) => (
                <InteractiveItem key={customer.id}>
                  <div className="flex items-center justify-between p-4 bg-[var(--foreground)]/5 rounded-2xl border border-[var(--border)]/30 hover:bg-[var(--foreground)]/10 transition-colors cursor-pointer">
                    <div>
                      <p className="font-semibold text-[var(--foreground)] text-lg mb-0.5">{customer.name}</p>
                      <p className="text-sm font-medium text-[var(--foreground)]/50">{customer.phone || "No phone"}</p>
                    </div>
                    <div className="px-4 py-2 bg-[var(--color-warning)]/10 rounded-full">
                      <p className="font-bold text-[var(--color-warning)]">₹{(customer.currentBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </InteractiveItem>
              ))}
            </div>
          )}
        </StaggerItem>

        <StaggerItem className="neo-clay p-6 md:p-8">
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] mb-6 flex items-center gap-3">
            <div className="p-2 bg-[var(--color-danger)]/10 rounded-xl">
              <AlertTriangle className="text-[var(--color-danger)]" size={20} />
            </div>
            Low Stock Alerts
          </h2>
          {lowStock.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--foreground)]/50 font-medium">All products are well stocked</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStock.map((product) => (
                <InteractiveItem key={product.id}>
                  <div className="flex items-center justify-between p-4 bg-[var(--color-danger)]/5 rounded-2xl border border-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/10 transition-colors cursor-pointer">
                    <div>
                      <p className="font-semibold text-[var(--foreground)] text-lg mb-0.5">{product.name}</p>
                      <p className="text-sm font-medium text-[var(--foreground)]/50">Threshold: {product.lowStockThreshold}</p>
                    </div>
                    <div className="px-4 py-2 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-full">
                      <p className="font-bold text-[var(--color-danger)]">{product.stockQuantity} left</p>
                    </div>
                  </div>
                </InteractiveItem>
              ))}
            </div>
          )}
        </StaggerItem>
      </div>
    </StaggerContainer>
  );
}
