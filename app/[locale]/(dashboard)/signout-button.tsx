"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton({ iconOnly = true }: { iconOnly?: boolean }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={`flex items-center justify-center transition-colors text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 
        ${iconOnly ? "p-2 rounded-lg" : "gap-3 px-4 py-3 w-full rounded-xl"}
      `}
      title="Sign Out"
    >
      <LogOut size={iconOnly ? 18 : 20} />
      {!iconOnly && <span className="font-medium">Sign Out</span>}
    </button>
  );
}
