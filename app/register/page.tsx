"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { registerBusiness } from "@/lib/actions/auth";
import { Mail, Lock, Building2, ArrowRight, Eye, EyeOff, Phone, MapPin, Hash } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 2-step registration
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      // Validate step 1 fields
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill all required fields.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      setError("");
      setStep(2);
      return;
    }

    setLoading(true);
    setError("");

    const result = await registerBusiness(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Auto-login after registration
      const loginResult = await signIn("credentials", {
        redirect: false,
        email: formData.email.toLowerCase(),
        password: formData.password,
      });
      if (loginResult?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Gradient mesh */}
      <div className="gradient-mesh" />

      <motion.div
        animate={{ x: ["0%", "20%", "-15%", "0%"], y: ["0%", "-15%", "20%", "0%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] right-[5%] w-[45%] h-[45%] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "rgba(168, 85, 247, 0.08)" }}
      />

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="glass-heavy w-full max-w-md p-8 relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-1">BillForge</h1>
          <p className="text-sm text-[var(--foreground)]/40">Zenith Open Source</p>
        </div>

        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-1 text-center">
          Create your account
        </h2>
        <p className="text-sm text-[var(--foreground)]/40 text-center mb-6">
          {step === 1 ? "Step 1 of 2 — Business basics" : "Step 2 of 2 — Optional details"}
        </p>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-[var(--color-primary)]' : 'bg-[var(--border)]'}`} />
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--border)]'}`} />
        </div>

        {/* Google Sign In (only on step 1) */}
        {step === 1 && (
          <>
            <button
              onClick={handleGoogleSignIn}
              className="w-full glass-btn-secondary flex items-center justify-center gap-3 py-3 mb-6 rounded-xl"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="font-medium text-[var(--foreground)]">Continue with Google</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs font-medium text-[var(--foreground)]/50 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl text-sm font-medium border border-[var(--color-danger)]/20 mb-4"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                <input
                  type="text"
                  required
                  placeholder="Business name *"
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full glass-input" style={{ paddingLeft: '2.75rem' }}
                />
              </div>

              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                <input
                  type="email"
                  required
                  placeholder="Email address *"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full glass-input" style={{ paddingLeft: '2.75rem' }}
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password *"
                  value={formData.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full glass-input" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Confirm password *"
                  value={formData.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className="w-full glass-input" style={{ paddingLeft: '2.75rem' }}
                  autoComplete="new-password"
                />
              </div>

              <p className="text-xs text-[var(--foreground)]/35">
                Min 8 chars, must include uppercase, lowercase, and a number.
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative">
                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                <input
                  type="text"
                  placeholder="GSTIN (optional)"
                  value={formData.gstin}
                  onChange={(e) => update("gstin", e.target.value.toUpperCase())}
                  className="w-full glass-input" style={{ paddingLeft: '2.75rem' }}
                />
              </div>

              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full glass-input" style={{ paddingLeft: '2.75rem' }}
                />
              </div>

              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                <input
                  type="text"
                  placeholder="Address (optional)"
                  value={formData.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="w-full glass-input" style={{ paddingLeft: '2.75rem' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="w-full glass-input"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                  className="w-full glass-input"
                />
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="glass-btn-secondary flex-1"
              >
                Back
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="glass-btn-primary py-3 flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : step === 1 ? (
                <>
                  Continue
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--foreground)]/40">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
