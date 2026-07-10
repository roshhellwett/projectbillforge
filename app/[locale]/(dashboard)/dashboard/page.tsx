import { Suspense } from "react";
import { getSalesSummary, getRecentInvoices, getWeeklySalesData } from "@/lib/actions/invoices";
import { getLowStockProducts, getProducts } from "@/lib/actions/products";
import { getTopReceivables } from "@/lib/actions/customers";
import { StaggerContainer, StaggerItem } from "@/components/ui/MotionWrapper";

import { WelcomeBanner } from "./components/WelcomeBanner";
import { OverviewCards } from "./components/OverviewCards";
import { SalesTrend } from "./components/SalesTrend";
import { BusinessSnapshot } from "./components/BusinessSnapshot";
import { RecentInvoices } from "./components/RecentInvoices";
import { TopReceivables } from "./components/TopReceivables";
import { LowStockAlerts } from "./components/LowStockAlerts";
import {
  WelcomeBannerSkeleton, OverviewCardsSkeleton, SalesTrendSkeleton,
  BusinessSnapshotSkeleton, RecentInvoicesSkeleton, TopReceivablesSkeleton, LowStockSkeleton,
} from "./components/skeletons";

export default function DashboardPage() {
  const salesPromise = getSalesSummary();
  const lowStockPromise = getLowStockProducts();
  const customersPromise = getTopReceivables(5);
  const recentPromise = getRecentInvoices(5);
  const weeklyPromise = getWeeklySalesData();
  const productsPromise = getProducts();

  return (
    <StaggerContainer className="space-y-6 sm:space-y-8 lg:space-y-10">
      <StaggerItem>
        <Suspense fallback={<WelcomeBannerSkeleton />}>
          <WelcomeBanner salesPromise={salesPromise} />
        </Suspense>
      </StaggerItem>

      <StaggerItem>
        <Suspense fallback={<OverviewCardsSkeleton />}>
          <OverviewCards salesPromise={salesPromise} />
        </Suspense>
      </StaggerItem>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-stretch">
        <StaggerItem className="md:col-span-1 xl:col-span-2">
          <Suspense fallback={<SalesTrendSkeleton />}>
            <SalesTrend weeklyPromise={weeklyPromise} />
          </Suspense>
        </StaggerItem>

        <StaggerItem>
          <Suspense fallback={<BusinessSnapshotSkeleton />}>
            <BusinessSnapshot salesPromise={salesPromise} productsPromise={productsPromise} lowStockPromise={lowStockPromise} />
          </Suspense>
        </StaggerItem>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 items-stretch">
        <StaggerItem>
          <Suspense fallback={<RecentInvoicesSkeleton />}>
            <RecentInvoices recentPromise={recentPromise} />
          </Suspense>
        </StaggerItem>

        <StaggerItem>
          <Suspense fallback={<TopReceivablesSkeleton />}>
            <TopReceivables customersPromise={customersPromise} />
          </Suspense>
        </StaggerItem>
      </div>

      <StaggerItem>
        <Suspense fallback={<LowStockSkeleton />}>
          <LowStockAlerts lowStockPromise={lowStockPromise} />
        </Suspense>
      </StaggerItem>
    </StaggerContainer>
  );
}
