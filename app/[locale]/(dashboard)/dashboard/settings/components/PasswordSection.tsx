"use client";

import { useState } from "react";
import { changePassword } from "@/lib/actions/auth";
import { useToast } from "@/components/ui/Toast";
import { Lock, Eye, EyeOff } from "lucide-react";

export function PasswordSection() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await changePassword(form);
    if (result?.error) {
      addToast(result.error, "error");
    } else {
      addToast("Password changed successfully.", "success");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
    setLoading(false);
  };

  return (
    <div className="glass-card p-8">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Password</h2>
      <p className="text-sm text-[var(--foreground)]/60 mb-6">Update your account password.</p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
          <input
            type={show ? "text" : "password"}
            required
            placeholder="Current password"
            value={form.currentPassword}
            onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
            className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm"
            style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70 transition-colors">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
          <input
            type={show ? "text" : "password"}
            required
            placeholder="New password"
            value={form.newPassword}
            onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
            className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm"
            style={{ paddingLeft: "2.75rem" }}
            autoComplete="new-password"
          />
        </div>

        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
          <input
            type={show ? "text" : "password"}
            required
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
            className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm"
            style={{ paddingLeft: "2.75rem" }}
            autoComplete="new-password"
          />
        </div>

        <p className="text-xs text-[var(--foreground)]/35">Min 8 characters with uppercase, lowercase, and a number.</p>

        <button
          type="submit"
          disabled={loading}
          className="glass-btn-primary px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}