import { getSalesSummary, getRecentInvoices, getWeeklySalesData } from "@/lib/actions/invoices";
import { getLowStockProducts, getProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { DollarSign, FileText, Users, AlertTriangle, TrendingUp, Package, BarChart3, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, InteractiveItem } from "@/lib/components/MotionWrapper";

export default async function DashboardPage() {
  const [salesResult, lowStockResult, customersResult, recentResult, weeklyResult, productsResult] = await Promise.all([
    getSalesSummary(),
    getLowStockProducts(),
    getCustomers(),
    getRecentInvoices(5),
    getWeeklySalesData(),
    getProducts(),
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
  const recentInvoices = recentResult.success ? recentResult.invoices : [];
  const weeklyData = weeklyResult.success ? weeklyResult.days : [];
  const totalProducts = productsResult.success ? productsResult.products.length : 0;

  const topReceivables = customers
    .filter(c => (c.currentBalance ?? 0) > 0)
    .sort((a, b) => (b.currentBalance ?? 0) - (a.currentBalance ?? 0))
    .slice(0, 5);

  // Calculate weekly max for chart scaling
  const weeklyMax = Math.max(...weeklyData.map(d => d.total), 1);
  const weeklyTotal = weeklyData.reduce((acc, d) => acc + d.total, 0);

  const statCards = [
    {
      label: "Today's Sales",
      value: `₹${summary.todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "var(--color-success)",
      gradient: "from-emerald-500/20 to-teal-500/10",
      iconBg: "bg-gradient-to-br from-emerald-500/20 to-teal-500/10",
    },
    {
      label: "Total Sales",
      value: `₹${summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "var(--color-primary)",
      gradient: "from-indigo-500/20 to-violet-500/10",
      iconBg: "bg-gradient-to-br from-indigo-500/20 to-violet-500/10",
    },
    {
      label: "Total Invoices",
      value: summary.totalInvoices.toString(),
      icon: FileText,
      color: "var(--color-accent-purple)",
      gradient: "from-purple-500/20 to-pink-500/10",
      iconBg: "bg-gradient-to-br from-purple-500/20 to-pink-500/10",
    },
    {
      label: "Receivables",
      value: `₹${summary.totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: Users,
      color: "var(--color-warning)",
      gradient: "from-amber-500/20 to-orange-500/10",
      iconBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/10",
    },
  ];

  return (
    <StaggerContainer className="space-y-8">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Dashboard</h1>
        <p className="text-[var(--foreground)]/50 mt-1">Welcome back! Here&apos;s your business overview.</p>
      </FadeIn>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StaggerItem key={card.label}>
            <InteractiveItem>
              <div className="glass-card p-6 group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3.5 rounded-2xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}
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

      {/* ── Sales Trend + Business Snapshot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <StaggerItem className="lg:col-span-2">
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500/15 to-violet-500/10 rounded-xl">
                  <BarChart3 className="text-[var(--color-primary)]" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">Sales Trend</h2>
                  <p className="text-xs text-[var(--foreground)]/40 mt-0.5">Last 7 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-[var(--foreground)]/40">Weekly Total</p>
                <p className="text-lg font-bold text-[var(--foreground)] tracking-tight">₹{weeklyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* CSS Bar Chart */}
            <div className="flex items-end gap-2 sm:gap-4 h-48 mt-4">
              {weeklyData.map((day, i) => {
                const heightPercent = weeklyMax > 0 ? (day.total / weeklyMax) * 100 : 0;
                const isToday = i === weeklyData.length - 1;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-semibold text-[var(--foreground)]/50 whitespace-nowrap">
                      {day.total > 0 ? `₹${(day.total / 1000).toFixed(day.total >= 1000 ? 1 : 0)}${day.total >= 1000 ? 'k' : ''}` : ''}
                    </span>
                    <div
                      className={`w-full rounded-xl transition-all duration-500 ${isToday
                          ? 'bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-primary-light)] shadow-[0_4px_20px_rgba(99,102,241,0.3)]'
                          : 'bg-gradient-to-t from-[var(--color-primary)]/30 to-[var(--color-primary)]/10'
                        }`}
                      style={{
                        height: `${Math.max(heightPercent, 4)}%`,
                        minHeight: '8px',
                      }}
                    />
                    <span className={`text-xs font-semibold ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--foreground)]/40'}`}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </StaggerItem>

        {/* Business Snapshot */}
        <StaggerItem>
          <div className="glass-card p-6 md:p-8 h-full flex flex-col">
            <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] mb-5">Business Snapshot</h2>
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between p-4 glass-light rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 rounded-lg">
                    <Users size={16} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]/70">Customers</span>
                </div>
                <span className="text-lg font-bold text-[var(--foreground)]">{summary.totalCustomers}</span>
              </div>
              <div className="flex items-center justify-between p-4 glass-light rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/15 to-purple-500/5 rounded-lg">
                    <Package size={16} style={{ color: 'var(--color-accent-purple)' }} />
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]/70">Products</span>
                </div>
                <span className="text-lg font-bold text-[var(--foreground)]">{totalProducts}</span>
              </div>
              <div className="flex items-center justify-between p-4 glass-light rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-500/15 to-amber-500/5 rounded-lg">
                    <FileText size={16} style={{ color: 'var(--color-warning)' }} />
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]/70">Invoices</span>
                </div>
                <span className="text-lg font-bold text-[var(--foreground)]">{summary.totalInvoices}</span>
              </div>
              <div className="flex items-center justify-between p-4 glass-light rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-500/15 to-red-500/5 rounded-lg">
                    <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]/70">Low Stock</span>
                </div>
                <span className={`text-lg font-bold ${lowStock.length > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>{lowStock.length}</span>
              </div>
            </div>
          </div>
        </StaggerItem>
      </div>

      {/* ── Recent Invoices + Receivables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <StaggerItem>
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-blue-500/15 to-blue-500/5 rounded-xl">
                <Clock className="text-[var(--color-primary)]" size={18} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">Recent Invoices</h2>
            </div>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[var(--foreground)]/40 font-medium">No invoices yet</p>
                <p className="text-sm text-[var(--foreground)]/30 mt-1">Create your first invoice to see it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((inv: any) => (
                  <InteractiveItem key={inv.id}>
                    <div className="flex items-center justify-between p-4 glass-light rounded-xl hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${inv.paymentStatus === 'paid'
                            ? 'bg-[var(--color-success)]/10'
                            : 'bg-[var(--color-warning)]/10'
                          }`}>
                          {inv.paymentStatus === 'paid'
                            ? <ArrowDownRight size={16} className="text-[var(--color-success)]" />
                            : <ArrowUpRight size={16} className="text-[var(--color-warning)]" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--foreground)] text-sm truncate">{inv.customerName}</p>
                          <p className="text-xs text-[var(--foreground)]/40">{inv.invoiceNumber}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="font-bold text-[var(--foreground)]">₹{Number(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${inv.paymentStatus === 'paid'
                            ? 'text-[var(--color-success)]'
                            : 'text-[var(--color-warning)]'
                          }`}>
                          {inv.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </InteractiveItem>
                ))}
              </div>
            )}
          </div>
        </StaggerItem>

        {/* Top Receivables */}
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
      </div>

      {/* ── Low Stock Alerts ── */}
      <StaggerItem>
        <div className="glass-card p-6 md:p-8">
          <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] mb-5 flex items-center gap-2.5">
            <div className="p-2 bg-[var(--color-danger)]/10 rounded-xl">
              <AlertTriangle className="text-[var(--color-danger)]" size={18} />
            </div>
            Low Stock Alerts
          </h2>
          {lowStock.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--color-success)] font-medium">✓ All products are well stocked</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
    </StaggerContainer>
  );
}
