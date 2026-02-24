import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your business profile</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900">
              {session.user.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900">
              {session.user.email}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              To update your business details, please contact support or edit your profile in the registration form.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">About BillForge</h2>
        <div className="space-y-2 text-sm text-slate-600">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Platform:</strong> Indian Billing Solution</p>
          <p className="pt-2">
            BillForge is a comprehensive billing, invoicing, and Khata management platform 
            designed specifically for Indian businesses. It supports GST calculations, 
            inventory management, and customer credit tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
