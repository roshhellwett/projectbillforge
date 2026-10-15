import { StaggerContainer, StaggerItem } from "@/components/ui/MotionWrapper";
import {
  AttentionSkeleton,
  BusinessSnapshotSkeleton,
  LowStockSkeleton,
  OverviewCardsSkeleton,
  QuickActionsSkeleton,
  RecentInvoicesSkeleton,
  SalesTrendSkeleton,
  TopReceivablesSkeleton,
  WelcomeBannerSkeleton,
} from "./components/skeletons";

export default function DashboardLoading() {
  return (
    <div aria-busy="true">
      <StaggerContainer className="mx-auto w-full max-w-[1600px] space-y-6 sm:space-y-8">
        <StaggerItem>
          <WelcomeBannerSkeleton />
        </StaggerItem>
        <StaggerItem>
          <AttentionSkeleton />
        </StaggerItem>
        <StaggerItem>
          <QuickActionsSkeleton />
        </StaggerItem>
        <StaggerItem>
          <OverviewCardsSkeleton />
        </StaggerItem>
        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:gap-6 xl:grid-cols-3">
          <StaggerItem className="xl:col-span-2">
            <SalesTrendSkeleton />
          </StaggerItem>
          <StaggerItem>
            <BusinessSnapshotSkeleton />
          </StaggerItem>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <StaggerItem>
            <RecentInvoicesSkeleton />
          </StaggerItem>
          <StaggerItem>
            <TopReceivablesSkeleton />
          </StaggerItem>
        </div>
        <StaggerItem>
          <LowStockSkeleton />
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
