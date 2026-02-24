"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FadeIn, AnimatedBackground, StaggerContainer, StaggerItem, InteractiveItem } from "@/lib/components/MotionWrapper";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 relative overflow-hidden font-sans">
      <AnimatedBackground />
      <FadeIn className="relative w-full max-w-md z-10">
        <div className="neo-clay p-8 md:p-10 relative overflow-hidden group">
          {/* Subtle inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-inherit"></div>

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] mb-1">BillForge</h1>
              <p className="text-[10px] font-bold tracking-wider uppercase text-[var(--color-primary)] opacity-80 mb-4">Zenith Open Source Projects</p>
              <p className="text-[var(--foreground)]/60 font-medium">Indian Billing Platform</p>
            </div>

            <StaggerContainer className="space-y-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <StaggerItem>
                    <div className="p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-xl text-[var(--color-danger)] text-sm font-medium">
                      {error}
                    </div>
                  </StaggerItem>
                )}

                <StaggerItem>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]/80 ml-1">
                      Email Address
                    </label>
                    <InteractiveItem>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-5 py-4 neo-input text-[var(--foreground)] placeholder-[var(--foreground)]/30 font-medium focus:ring-0"
                        placeholder="you@business.com"
                      />
                    </InteractiveItem>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]/80 ml-1">
                      Password
                    </label>
                    <InteractiveItem>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-5 py-4 neo-input text-[var(--foreground)] placeholder-[var(--foreground)]/30 font-medium focus:ring-0"
                        placeholder="••••••••"
                      />
                    </InteractiveItem>
                  </div>
                </StaggerItem>

                <StaggerItem className="pt-2">
                  <InteractiveItem>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[var(--color-primary)] text-white font-bold rounded-full transition-all neo-soft hover:-translate-y-1 hover:shadow-lg shadow-[0_10px_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                  </InteractiveItem>
                </StaggerItem>
              </form>

              <StaggerItem>
                <div className="mt-8 text-center text-sm">
                  <p className="text-[var(--foreground)]/60">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition-colors">
                      Register
                    </Link>
                  </p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
