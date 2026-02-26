import { Suspense } from "react";
import { getSalesSummary, getRecentInvoices, getWeeklySalesData } from "@/lib/actions/invoices";
import { getLowStockProducts, getProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { StaggerContainer, StaggerItem } from "@/lib/components/MotionWrapper";

import {
  WelcomeBannerServer,
  OverviewCardsServer,
  SalesTrendServer,
  BusinessSnapshotServer,
  RecentInvoicesServer,
  TopReceivablesServer,
  LowStockAlertsServer
} from "./components/DashboardServerComponents";
import {
  WelcomeBannerSkeleton,
  OverviewCardsSkeleton,
  SalesTrendSkeleton,
  BusinessSnapshotSkeleton,
  RecentInvoicesSkeleton,
  TopReceivablesSkeleton,
  LowStockSkeleton
} from "./components/Skeletons";

export default function DashboardPage() {
  // Initiate all data fetches concurrently. This allows the shell to render immediately
  // and chunks to stream in as they finish, creating a fast, snappy experience.
  const salesPromise = getSalesSummary();
  const lowStockPromise = getLowStockProducts();
  const customersPromise = getCustomers();
  const recentPromise = getRecentInvoices(5);
  const weeklyPromise = getWeeklySalesData();
  const productsPromise = getProducts();

  return (
    <StaggerContainer className="space-y-6 sm:space-y-8 lg:space-y-10">
      <StaggerItem>
        <Suspense fallback={<WelcomeBannerSkeleton />}>
          <WelcomeBannerServer salesPromise={salesPromise} />
        </Suspense>
      </StaggerItem>

      <StaggerItem>
        <Suspense fallback={<OverviewCardsSkeleton />}>
          <OverviewCardsServer salesPromise={salesPromise} />
        </Suspense>
      </StaggerItem>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-stretch">
        <StaggerItem className="md:col-span-1 xl:col-span-2">
          <Suspense fallback={<SalesTrendSkeleton />}>
            <SalesTrendServer weeklyPromise={weeklyPromise} />
          </Suspense>
        </StaggerItem>

        <StaggerItem>
          <Suspense fallback={<BusinessSnapshotSkeleton />}>
            <BusinessSnapshotServer
              salesPromise={salesPromise}
              productsPromise={productsPromise}
              lowStockPromise={lowStockPromise}
            />
          </Suspense>
        </StaggerItem>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 items-stretch">
        <StaggerItem>
          <Suspense fallback={<RecentInvoicesSkeleton />}>
            <RecentInvoicesServer recentPromise={recentPromise} />
          </Suspense>
        </StaggerItem>

        <StaggerItem>
          <Suspense fallback={<TopReceivablesSkeleton />}>
            <TopReceivablesServer customersPromise={customersPromise} />
          </Suspense>
        </StaggerItem>
      </div>

      <StaggerItem>
        <Suspense fallback={<LowStockSkeleton />}>
          <LowStockAlertsServer lowStockPromise={lowStockPromise} />
        </Suspense>
      </StaggerItem>
    </StaggerContainer>
  );
}
