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

  const statCards = [
    {
      label: "Today's Sales",
      value: `₹${summary.todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "var(--color-success)",
      gradient: "from-emerald-500/20 to-teal-500/10",
    },
    {
      label: "Total Sales",
      value: `₹${summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "var(--color-primary)",
      gradient: "from-indigo-500/20 to-violet-500/10",
    },
    {
      label: "Total Invoices",
      value: summary.totalInvoices.toString(),
      icon: FileText,
      color: "var(--color-accent-purple)",
      gradient: "from-purple-500/20 to-pink-500/10",
    },
    {
      label: "Receivables",
      value: `₹${summary.totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: Users,
      color: "var(--color-warning)",
      gradient: "from-amber-500/20 to-orange-500/10",
    },
  ];

  return (
    <StaggerContainer className="space-y-8">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Dashboard</h1>
        <p className="text-[var(--foreground)]/50 mt-1">Welcome back! Here&apos;s your business overview.</p>
      </FadeIn>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StaggerItem key={card.label}>
            <InteractiveItem>
              <div className="glass-card p-6 group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3.5 rounded-2xl bg-gradient-to-br ${card.gradient} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <card.icon style={{ color: card.color }} size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]/50 mb-0.5">{card.label}</p>
                    <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">{card.value}</p>
                  </div>
                </div>
              </div>
            </InteractiveItem>
          </StaggerItem>
        ))}
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaggerItem>
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] mb-5">Top Receivables</h2>
            {topReceivables.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[var(--foreground)]/40 font-medium">No outstanding balances</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topReceivables.map((customer) => (
                  <InteractiveItem key={customer.id}>
                    <div className="flex items-center justify-between p-4 glass-light rounded-xl hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer">
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{customer.name}</p>
                        <p className="text-sm text-[var(--foreground)]/40">{customer.phone || "No phone"}</p>
                      </div>
                      <div className="badge badge-warning">
                        ₹{(customer.currentBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </InteractiveItem>
                ))}
              </div>
            )}
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] mb-5 flex items-center gap-2.5">
              <div className="p-2 bg-[var(--color-danger)]/10 rounded-xl">
                <AlertTriangle className="text-[var(--color-danger)]" size={18} />
              </div>
              Low Stock Alerts
            </h2>
            {lowStock.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[var(--foreground)]/40 font-medium">All products are well stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStock.map((product) => (
                  <InteractiveItem key={product.id}>
                    <div className="flex items-center justify-between p-4 glass-light rounded-xl border border-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/5 transition-colors cursor-pointer">
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{product.name}</p>
                        <p className="text-sm text-[var(--foreground)]/40">Threshold: {product.lowStockThreshold}</p>
                      </div>
                      <div className="badge badge-danger">
                        {product.stockQuantity} left
                      </div>
                    </div>
                  </InteractiveItem>
                ))}
              </div>
            )}
          </div>
        </StaggerItem>
      </div>
    </StaggerContainer>
  );
}
