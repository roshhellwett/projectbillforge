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
    <div className="h-screen bg-[var(--background)] text-[var(--foreground)] flex overflow-hidden">
      <DashboardSidebar session={session} />
      <main className="flex-1 overflow-y-auto relative">
        <DashboardTransition>
          <div className="p-4 md:p-8 min-h-full flex flex-col">
            {children}
          </div>
        </DashboardTransition>
      </main>
    </div>
  );
}
