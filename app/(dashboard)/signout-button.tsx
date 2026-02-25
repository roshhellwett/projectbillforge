"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-3 px-4 py-3 w-full text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-xl transition-colors"
    >
      <LogOut size={20} />
      <span className="font-medium">Sign Out</span>
    </button>
  );
}
