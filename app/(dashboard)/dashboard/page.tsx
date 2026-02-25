import { getSalesSummary, getRecentInvoices, getWeeklySalesData } from "@/lib/actions/invoices";
import { getLowStockProducts, getProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { DollarSign, FileText, Users, AlertTriangle, TrendingUp, Package, BarChart3, Clock, ArrowUpRight, ArrowDownRight, ShoppingBag } from "lucide-react";
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
      color: "#10b981",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    },
    {
      label: "Total Sales",
      value: `₹${summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "#6366f1",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    },
    {
      label: "Total Invoices",
      value: summary.totalInvoices.toString(),
      icon: FileText,
      color: "#a855f7",
      bg: "bg-purple-500/10 dark:bg-purple-500/15",
    },
    {
      label: "Receivables",
      value: `₹${summary.totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: Users,
      color: "#f59e0b",
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
    },
  ];

  return (
    <StaggerContainer className="space-y-6">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Dashboard</h1>
        <p className="text-[var(--foreground)]/50 mt-1">Welcome back! Here&apos;s your business overview.</p>
      </FadeIn>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StaggerItem key={card.label}>
            <InteractiveItem>
              <div className="glass-card p-5 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${card.bg} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon style={{ color: card.color }} size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--foreground)]/50 mb-0.5 truncate">{card.label}</p>
                    <p className="text-xl font-bold text-[var(--foreground)] tracking-tight truncate">{card.value}</p>
                  </div>
                </div>
              </div>
            </InteractiveItem>
          </StaggerItem>
        ))}
      </div>

      {/* ── Sales Trend + Business Snapshot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Sales Trend Chart — 2/3 width */}
        <StaggerItem className="lg:col-span-2">
          <div className="glass-card p-5 md:p-7">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-xl">
                  <BarChart3 style={{ color: '#6366f1' }} size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">Sales Trend</h2>
                  <p className="text-xs text-[var(--foreground)]/40">Last 7 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium text-[var(--foreground)]/40 uppercase tracking-wider">Weekly Total</p>
                <p className="text-lg font-bold text-[var(--foreground)]">₹{weeklyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* Bar Chart — fixed height with absolute-positioned bars */}
            <div className="relative" style={{ height: '200px' }}>
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-b border-[var(--border)]/30" />
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end gap-2 sm:gap-3 px-1">
                {weeklyData.map((day, i) => {
                  const pct = weeklyMax > 0 ? (day.total / weeklyMax) * 100 : 0;
                  const isToday = i === weeklyData.length - 1;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full">
                      {/* Value label */}
                      {day.total > 0 && (
                        <span className="text-[9px] font-bold text-[var(--foreground)]/50 mb-1.5 whitespace-nowrap">
                          ₹{day.total >= 1000 ? `${(day.total / 1000).toFixed(1)}k` : day.total.toFixed(0)}
                        </span>
                      )}
                      {/* Bar */}
                      <div
                        className={`w-full max-w-[48px] rounded-t-lg transition-all duration-700 ease-out ${isToday
                            ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-violet-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                            : 'bg-gradient-to-t from-indigo-400/40 to-indigo-300/20 dark:from-indigo-400/30 dark:to-indigo-300/10'
                          }`}
                        style={{
                          height: `${Math.max(pct, 3)}%`,
                          minHeight: '6px',
                        }}
                      />
                      {/* Day label */}
                      <span className={`text-[11px] font-semibold mt-2 ${isToday ? 'text-indigo-500' : 'text-[var(--foreground)]/40'}`}>
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Business Snapshot — 1/3 width */}
        <StaggerItem>
          <div className="glass-card p-5 md:p-7 h-full flex flex-col">
            <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] mb-4">Business Snapshot</h2>
            <div className="space-y-3 flex-1">
              {[
                { icon: Users, label: "Customers", value: summary.totalCustomers, color: "#6366f1", bg: "bg-indigo-500/10 dark:bg-indigo-500/15" },
                { icon: Package, label: "Products", value: totalProducts, color: "#a855f7", bg: "bg-purple-500/10 dark:bg-purple-500/15" },
                { icon: FileText, label: "Invoices", value: summary.totalInvoices, color: "#f59e0b", bg: "bg-amber-500/10 dark:bg-amber-500/15" },
                { icon: AlertTriangle, label: "Low Stock", value: lowStock.length, color: lowStock.length > 0 ? "#ef4444" : "#10b981", bg: lowStock.length > 0 ? "bg-red-500/10 dark:bg-red-500/15" : "bg-emerald-500/10 dark:bg-emerald-500/15" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3.5 glass-light rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${item.bg} rounded-lg`}>
                      <item.icon size={15} style={{ color: item.color }} />
                    </div>
                    <span className="text-sm font-medium text-[var(--foreground)]/70">{item.label}</span>
                  </div>
                  <span className="text-base font-bold text-[var(--foreground)]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>
      </div>

      {/* ── Recent Invoices + Top Receivables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Invoices */}
        <StaggerItem>
          <div className="glass-card p-5 md:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-blue-500/10 dark:bg-blue-500/15 rounded-xl">
                <Clock style={{ color: '#6366f1' }} size={17} />
              </div>
              <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">Recent Invoices</h2>
            </div>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-12 glass-light rounded-xl">
                <ShoppingBag className="mx-auto mb-3 text-[var(--foreground)]/20" size={36} />
                <p className="text-[var(--foreground)]/40 font-medium text-sm">No invoices yet</p>
                <p className="text-xs text-[var(--foreground)]/25 mt-1">Create your first invoice to see it here</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentInvoices.map((inv: any) => (
                  <InteractiveItem key={inv.id}>
                    <div className="flex items-center justify-between p-3.5 glass-light rounded-xl hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${inv.paymentStatus === 'paid'
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/15'
                            : 'bg-amber-500/10 dark:bg-amber-500/15'
                          }`}>
                          {inv.paymentStatus === 'paid'
                            ? <ArrowDownRight size={15} style={{ color: '#10b981' }} />
                            : <ArrowUpRight size={15} style={{ color: '#f59e0b' }} />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--foreground)] text-sm truncate">{inv.customerName}</p>
                          <p className="text-xs text-[var(--foreground)]/35">{inv.invoiceNumber}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="font-bold text-sm text-[var(--foreground)]">₹{Number(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${inv.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'
                          }`}>{inv.paymentStatus}</span>
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
          <div className="glass-card p-5 md:p-7">
            <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] mb-5">Top Receivables</h2>
            {topReceivables.length === 0 ? (
              <div className="text-center py-12 glass-light rounded-xl">
                <Users className="mx-auto mb-3 text-[var(--foreground)]/20" size={36} />
                <p className="text-[var(--foreground)]/40 font-medium text-sm">No outstanding balances</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topReceivables.map((customer) => (
                  <InteractiveItem key={customer.id}>
                    <div className="flex items-center justify-between p-3.5 glass-light rounded-xl hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer">
                      <div>
                        <p className="font-semibold text-[var(--foreground)] text-sm">{customer.name}</p>
                        <p className="text-xs text-[var(--foreground)]/35">{customer.phone || "No phone"}</p>
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
        <div className="glass-card p-5 md:p-7">
          <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] mb-4 flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 dark:bg-red-500/15 rounded-xl">
              <AlertTriangle style={{ color: '#ef4444' }} size={17} />
            </div>
            Low Stock Alerts
          </h2>
          {lowStock.length === 0 ? (
            <div className="text-center py-8 glass-light rounded-xl">
              <p className="text-emerald-500 font-medium text-sm">✓ All products are well stocked</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStock.map((product) => (
                <InteractiveItem key={product.id}>
                  <div className="flex items-center justify-between p-3.5 glass-light rounded-xl border border-red-500/10 hover:bg-red-500/5 transition-colors cursor-pointer">
                    <div>
                      <p className="font-semibold text-[var(--foreground)] text-sm">{product.name}</p>
                      <p className="text-xs text-[var(--foreground)]/35">Threshold: {product.lowStockThreshold}</p>
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
