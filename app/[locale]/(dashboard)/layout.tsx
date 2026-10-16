import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardTransition from "@/components/layout/DashboardTransition";
import DashboardClientLayout from "@/components/layout/DashboardClientLayout";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="dashboard-shell h-dvh max-h-dvh w-full bg-[var(--background)] text-[var(--foreground)] flex overflow-hidden relative">
      <DashboardSidebar session={session} />
      <main id="main-content" className="dashboard-main flex-1 h-full overflow-y-auto overflow-x-hidden relative z-10 w-full">
        <DashboardTransition>
          <div className="dashboard-content-shell dashboard-content-padding min-h-full flex flex-col">
            <DashboardClientLayout session={session}>{children}</DashboardClientLayout>
          </div>
        </DashboardTransition>
      </main>
    </div>
  );
}
