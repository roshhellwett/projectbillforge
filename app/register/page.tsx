"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerBusiness } from "@/lib/actions/auth";
import { FadeIn, AnimatedBackground, StaggerContainer, StaggerItem, InteractiveItem } from "@/lib/components/MotionWrapper";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gstin: "",
    phone: "",
    address: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await registerBusiness({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        gstin: formData.gstin || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        state: formData.state || undefined,
        pincode: formData.pincode || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 py-12 relative overflow-hidden font-sans">
      <AnimatedBackground />
      <FadeIn className="relative w-full max-w-2xl z-10">
        <div className="neo-clay p-8 md:p-10 relative overflow-hidden group">
          {/* Subtle inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-inherit"></div>

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] mb-1">BillForge</h1>
              <p className="text-[10px] font-bold tracking-wider uppercase text-[var(--color-primary)] opacity-80 mb-4">Zenith Open Source Projects</p>
              <p className="text-[var(--foreground)]/60 font-medium">Create your billing account</p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <StaggerItem className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]/80 ml-1 mb-2">
                      Business Name *
                    </label>
                    <InteractiveItem>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 neo-input text-[var(--foreground)] placeholder-[var(--foreground)]/30 font-medium focus:ring-0"
                        placeholder="Your Business Name"
                      />
                    </InteractiveItem>
                  </StaggerItem>

                  <StaggerItem className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]/80 ml-1 mb-2">
                      Email Address *
                    </label>
                    <InteractiveItem>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 neo-input text-[var(--foreground)] placeholder-[var(--foreground)]/30 font-medium focus:ring-0"
                        placeholder="you@business.com"
                      />
                    </InteractiveItem>
                  </StaggerItem>

                  <StaggerItem>
                    <label className="block text-sm font-semibold text-[var(--foreground)]/80 ml-1 mb-2">
                      Password *
                    </label>
                    <InteractiveItem>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className="w-full px-5 py-4 neo-input text-[var(--foreground)] placeholder-[var(--foreground)]/30 font-medium focus:ring-0"
                        placeholder="Min 8 characters"
                      />
                    </InteractiveItem>
                  </StaggerItem>

                  <StaggerItem>
                    <label className="block text-sm font-semibold text-[var(--foreground)]/80 ml-1 mb-2">
                      Confirm Password *
                    </label>
                    <InteractiveItem>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 neo-input text-[var(--foreground)] placeholder-[var(--foreground)]/30 font-medium focus:ring-0"
                        placeholder="Confirm password"
                      />
                    </InteractiveItem>
                  </StaggerItem>

                  <StaggerItem>
                    <label className="block text-sm font-semibold text-[var(--foreground)]/80 ml-1 mb-2">
                      GSTIN
                    </label>
                    <InteractiveItem>
                      <input
                        type="text"
                        name="gstin"
                        value={formData.gstin}
                        onChange={handleChange}
                        className="w-full px-5 py-4 neo-input text-[var(--foreground)] placeholder-[var(--foreground)]/30 font-medium focus:ring-0"
                        placeholder="27AABCU9603R1ZM"
                      />
                    </InteractiveItem>
                  </StaggerItem>

                  <StaggerItem>
                    <label className="block text-sm font-semibold text-[var(--foreground)]/80 ml-1 mb-2">
                      Phone
                    </label>
                    <InteractiveItem>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-5 py-4 neo-input text-[var(--foreground)] placeholder-[var(--foreground)]/30 font-medium focus:ring-0"
                        placeholder="+91 9876543210"
                      />
                    </InteractiveItem>
                  </StaggerItem>

                  <StaggerItem className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]/80 ml-1 mb-2">
                      Address
                    </label>
                    <InteractiveItem>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-5 py-4 neo-input text-[var(--foreground)] placeholder-[var(--foreground)]/30 font-medium focus:ring-0"
                        placeholder="Full address"
                      />
                    </InteractiveItem>
                  </StaggerItem>

                  <StaggerItem>
                    <label className="block text-sm font-semibold text-[var(--foreground)]/80 ml-1 mb-2">
                      State
                    </label>
                    <InteractiveItem>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-5 py-4 neo-input text-[var(--foreground)] placeholder-[var(--foreground)]/30 font-medium focus:ring-0"
                        placeholder="Maharashtra"
                      />
                    </InteractiveItem>
                  </StaggerItem>

                  <StaggerItem>
                    <label className="block text-sm font-semibold text-[var(--foreground)]/80 ml-1 mb-2">
                      Pincode
                    </label>
                    <InteractiveItem>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full px-5 py-4 neo-input text-[var(--foreground)] placeholder-[var(--foreground)]/30 font-medium focus:ring-0"
                        placeholder="400001"
                      />
                    </InteractiveItem>
                  </StaggerItem>
                </div>

                <StaggerItem className="pt-6">
                  <InteractiveItem>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[var(--color-primary)] text-white font-bold rounded-full transition-all neo-soft hover:-translate-y-1 hover:shadow-lg shadow-[0_10px_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {loading ? "Creating Account..." : "Register Business"}
                    </button>
                  </InteractiveItem>
                </StaggerItem>
              </form>

              <StaggerItem>
                <div className="mt-8 text-center text-sm">
                  <p className="text-[var(--foreground)]/60">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition-colors">
                      Sign In
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
