import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTransition from "./DashboardTransition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="h-screen bg-[var(--background)] text-[var(--foreground)] flex overflow-hidden relative">
      {/* Purple wavy background */}
      <div className="dashboard-purple-bg" />

      <DashboardSidebar session={session} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
        <DashboardTransition>
          <div className="p-3 sm:p-4 pt-16 sm:pt-18 md:p-6 lg:p-8 md:pt-8 min-h-full flex flex-col">
            {children}
          </div>
        </DashboardTransition>
      </main>
    </div>
  );
}
