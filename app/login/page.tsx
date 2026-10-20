"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup, saveToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
    setPassword("");
  }

  return (
    <main className="min-h-screen bg-[#F6F8FB]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left branding panel */}
        <section className="relative hidden overflow-hidden bg-[#14213D] lg:flex lg:flex-col lg:justify-between">
          {/* Decorative shapes */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-white/10" />

          <div className="relative z-10 px-12 pt-12 xl:px-16 xl:pt-14">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-end justify-center gap-1 rounded-xl bg-white/10 pb-2">
                <span className="h-3 w-1.5 rounded-sm bg-[#FFB703]" />
                <span className="h-5 w-1.5 rounded-sm bg-[#FFB703]" />
                <span className="h-7 w-1.5 rounded-sm bg-white" />
              </div>

              <div>
                <p
                  className="text-xl font-bold text-white"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Placement<span className="text-[#FFB703]">Prep</span>
                </p>

                <p className="text-[10px] text-white/40">
                  AI-powered placement preparation
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 px-12 pb-16 xl:px-16">
            <div className="mb-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FFB703]" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Your placement workspace
              </span>
            </div>

            <h1
              className="max-w-xl text-4xl font-bold leading-tight text-white xl:text-5xl"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Prepare smarter.
              <br />
              <span className="text-[#FFB703]">Get placement ready.</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-white/55">
              Build your resume, practice aptitude, prepare for interviews,
              and discover jobs that match your skills — all from one
              workspace.
            </p>

            <div className="mt-9 grid max-w-lg grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">
                  Resume AI
                </p>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  Analyze and improve your resume.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">
                  Mock Interview
                </p>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  Practice interview questions.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">
                  Job Matching
                </p>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  Identify skill gaps for roles.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">
                  Aptitude
                </p>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  Practice placement questions.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 px-12 py-5 xl:px-16">
            <p className="text-xs text-white/30">
              Placement preparation workspace
            </p>
          </div>
        </section>

        {/* Right authentication panel */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[440px]">
            {/* Mobile logo */}
            <div className="mb-9 text-center lg:hidden">
              <div className="mb-4 flex items-end justify-center gap-1">
                <span className="h-3 w-1.5 rounded-sm bg-[#FFB703]" />
                <span className="h-5 w-1.5 rounded-sm bg-[#FFB703]" />
                <span className="h-7 w-1.5 rounded-sm bg-[#14213D]" />
              </div>

              <p
                className="text-2xl font-bold text-[#14213D]"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Placement<span className="text-[#FFB703]">Prep</span>
              </p>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <div className="mb-4 inline-flex rounded-full bg-[#EEF2F7] px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#14213D]">
                  {mode === "login"
                    ? "Welcome back"
                    : "Get started"}
                </span>
              </div>

              <h2
                className="text-3xl font-bold tracking-tight text-[#14213D]"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {mode === "login"
                  ? "Sign in to your workspace"
                  : "Create your account"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                {mode === "login"
                  ? "Continue your placement preparation from where you left off."
                  : "Create your account and start building your placement profile."}
              </p>
            </div>

            {/* Form card */}
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-7"
            >
              {mode === "signup" && (
                <div className="mb-5">
                  <label className="mb-2 block text-xs font-semibold text-[#495057]">
                    Full name
                  </label>

                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm text-[#14213D] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
                  />
                </div>
              )}

              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold text-[#495057]">
                  Email address
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm text-[#14213D] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
                />
              </div>

              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#495057]">
                    Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete={
                      mode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 pr-16 text-sm text-[#14213D] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-[#6B7280] hover:bg-[#F6F8FB] hover:text-[#14213D]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="mb-5 flex items-start gap-3 rounded-xl border border-[#F3B7BD] bg-[#FDECEE] px-4 py-3"
                  role="alert"
                >
                  <span className="font-bold text-[#E63946]">!</span>

                  <p className="text-xs leading-5 text-[#A61B29]">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-[#14213D] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3157] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {mode === "login"
                      ? "Signing in..."
                      : "Creating account..."}
                  </span>
                ) : mode === "login" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            {/* Switch mode */}
            <div className="mt-5 text-center">
              <p className="text-sm text-[#6B7280]">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-semibold text-[#14213D] hover:underline"
                >
                  {mode === "login" ? "Create one" : "Sign in"}
                </button>
              </p>
            </div>

            {/* Small footer */}
            <p className="mt-8 text-center text-[11px] leading-5 text-[#9CA3AF]">
              Your placement preparation starts here.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}