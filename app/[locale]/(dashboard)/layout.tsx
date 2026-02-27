import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTransition from "./DashboardTransition";
import DashboardClientLayout from "./DashboardClientLayout";

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
    <div className="h-screen bg-[var(--background)] text-[var(--foreground)] flex overflow-hidden relative">
      <DashboardSidebar session={session} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 w-full">
        <DashboardTransition>
          <div className="p-4 sm:p-6 md:pl-6 lg:pl-8 pt-6 sm:pt-8 md:p-8 min-h-full flex flex-col pb-24 md:pb-8">
            <DashboardClientLayout>
              {children}
            </DashboardClientLayout>
          </div>
        </DashboardTransition>
      </main>
    </div>
  );
}
