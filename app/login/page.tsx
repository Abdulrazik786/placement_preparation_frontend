"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup, saveToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await signup(email, password, name);
      }
      const result = await login(email, password);
      saveToken(result.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Signature mark: a small climbing bar-chart glyph, ties into "readiness" theme */}
        <div className="flex items-end gap-1 mb-8 justify-center" aria-hidden="true">
          <div className="w-2 h-4 bg-[#FFB703] rounded-sm" />
          <div className="w-2 h-6 bg-[#FFB703] rounded-sm" />
          <div className="w-2 h-8 bg-[#14213D] rounded-sm" />
        </div>

        <h1
          className="text-3xl font-bold text-center text-[#14213D] mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Placement Prep
        </h1>
        <p className="text-center text-[#6B7280] text-sm mb-8">
          {mode === "login" ? "Welcome back. Let's keep preparing." : "Create your account to get started."}
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 space-y-4"
        >
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-1">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D] focus:border-transparent"
                placeholder="Your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#14213D] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D] focus:border-transparent"
              placeholder="you@college.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#14213D] mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-16 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D] focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#6B7280] hover:text-[#14213D]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#E63946] bg-[#FEE2E2] px-3 py-2 rounded-lg" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#14213D] text-white font-medium py-2.5 rounded-lg text-sm hover:bg-[#1F2E52] transition-colors disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B7280] mt-4">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            className="text-[#14213D] font-medium hover:underline"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}