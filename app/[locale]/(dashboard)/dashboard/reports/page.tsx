import { getSalesSummary, getWeeklySalesData } from "@/lib/actions/invoices";
import ReportsPage from "@/components/reports/ReportsPage";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("Reports");
  return { title: t("title") };
}

export default async function ReportsRoute() {
  const [summaryResult, trendResult] = await Promise.all([
    getSalesSummary(),
    getWeeklySalesData(),
  ]);

  const summary = "success" in summaryResult && summaryResult.success ? summaryResult.summary : null;
  const days = "success" in trendResult && trendResult.success ? trendResult.days : [];

  return (
    <ReportsPage
      summary={summary}
      days={days}
      hasError={!summary || !("success" in trendResult && trendResult.success)}
    />
  );
}
