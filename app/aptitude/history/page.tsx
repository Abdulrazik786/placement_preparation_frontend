"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getToken,
  getAptitudeAttempts,
  AptitudeAttempt,
} from "@/lib/api";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "Resume AI", href: "/resume", icon: "▤" },
  { label: "Job Matching", href: "/jobs", icon: "⌕" },
  { label: "Mock Interview", href: "/interview", icon: "◉" },
  { label: "Aptitude", href: "/aptitude", icon: "✓" },
  { label: "Profile", href: "/profile", icon: "○" },
];

export default function AptitudeHistoryPage() {
  const router = useRouter();

  const [attempts, setAttempts] = useState<AptitudeAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    async function loadHistory() {
      try {
        setLoading(true);

        const data = await getAptitudeAttempts();

        setAttempts(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load aptitude history"
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [router]);

  const correctCount = attempts.filter(
    (attempt) => attempt.is_correct
  ).length;

  const incorrectCount = attempts.length - correctCount;

  const accuracy =
    attempts.length > 0
      ? Math.round((correctCount / attempts.length) * 100)
      : 0;

  const topicsPracticed = new Set(
    attempts.map((attempt) => attempt.topic)
  ).size;

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#14213D]">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-[250px] flex-col bg-[#14213D] text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <Link href="/dashboard">
            <p
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Placement<span className="text-[#FFB703]">Prep</span>
            </p>
          </Link>

          <p className="mt-1 text-xs text-white/45">
            AI-powered placement preparation
          </p>
        </div>

        <nav className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Workspace
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const active = item.href === "/aptitude";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    active
                      ? "bg-white text-[#14213D] shadow-sm"
                      : "text-white/65 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${
                      active
                        ? "bg-[#14213D] text-white"
                        : "bg-white/8 text-white/65"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-5">
          <Link
            href="/aptitude"
            className="block rounded-xl bg-white/7 p-4 transition hover:bg-white/10"
          >
            <p className="text-xs font-semibold text-white">
              Continue practicing
            </p>

            <p className="mt-1 text-[11px] leading-5 text-white/45">
              Return to aptitude practice and solve another question.
            </p>

            <p className="mt-3 text-xs font-semibold text-[#FFB703]">
              Practice now →
            </p>
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E5E7EB] bg-white/95 px-5 py-4 backdrop-blur lg:hidden">
        <Link href="/dashboard">
          <p
            className="text-lg font-bold"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Placement<span className="text-[#FFB703]">Prep</span>
          </p>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#14213D]"
          aria-label="Open menu"
        >
          ☰
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/35"
            aria-label="Close menu"
          />

          <aside className="relative h-full w-[280px] bg-[#14213D] p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <p
                className="text-xl font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Placement<span className="text-[#FFB703]">Prep</span>
              </p>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl text-white/60 hover:text-white"
              >
                ×
              </button>
            </div>

            <nav className="mt-6 space-y-1">
              {navItems.map((item) => {
                const active = item.href === "/aptitude";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                      active
                        ? "bg-white text-[#14213D]"
                        : "text-white/65 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="lg:ml-[250px]">
        <div className="mx-auto max-w-[1350px] px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
          {/* Heading */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-xs text-[#6B7280]">
              <Link href="/dashboard" className="hover:text-[#14213D]">
                Dashboard
              </Link>

              <span>›</span>

              <Link href="/aptitude" className="hover:text-[#14213D]">
                Aptitude
              </Link>

              <span>›</span>

              <span className="text-[#14213D]">History</span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1
                  className="text-3xl font-bold tracking-tight sm:text-4xl"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Aptitude History
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Review your previous questions, answers, accuracy, and
                  explanations.
                </p>
              </div>

              <Link
                href="/aptitude"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14213D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3157]"
              >
                Practice aptitude
                <span>→</span>
              </Link>
            </div>
          </div>

          {error && (
            <div
              className="mb-6 rounded-xl border border-[#F3B7BD] bg-[#FDECEE] px-4 py-3 text-sm text-[#A61B29]"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <span className="font-bold">!</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-2xl border border-[#E5E7EB] bg-white"
                  />
                ))}
              </div>

              <div className="h-28 animate-pulse rounded-2xl border border-[#E5E7EB] bg-white" />

              <div className="h-96 animate-pulse rounded-2xl border border-[#E5E7EB] bg-white" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2F7] text-xl text-[#14213D]">
                ✓
              </div>

              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                No attempts yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                Once you answer aptitude questions, your attempts and
                explanations will appear here.
              </p>

              <Link
                href="/aptitude"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#14213D] px-5 py-3 text-sm font-semibold text-white"
              >
                Start practicing
                <span>→</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                        Questions
                      </p>

                      <p
                        className="mt-2 text-3xl font-bold text-[#14213D]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {attempts.length}
                      </p>

                      <p className="mt-1 text-xs text-[#6B7280]">
                        Total attempted
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2F7] text-[#14213D]">
                      #
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                        Correct
                      </p>

                      <p
                        className="mt-2 text-3xl font-bold text-[#2A9D8F]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {correctCount}
                      </p>

                      <p className="mt-1 text-xs text-[#6B7280]">
                        Correct answers
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F5F3] text-[#2A9D8F]">
                      ✓
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                        Accuracy
                      </p>

                      <p
                        className="mt-2 text-3xl font-bold text-[#14213D]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {accuracy}%
                      </p>

                      <p className="mt-1 text-xs text-[#6B7280]">
                        Overall accuracy
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5D6] text-[#14213D]">
                      %
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                        Topics
                      </p>

                      <p
                        className="mt-2 text-3xl font-bold text-[#14213D]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {topicsPracticed}
                      </p>

                      <p className="mt-1 text-xs text-[#6B7280]">
                        Topics practiced
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2F7] text-[#14213D]">
                      ◈
                    </div>
                  </div>
                </div>
              </div>

              {/* Accuracy overview */}
              <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                      Performance overview
                    </p>

                    <h2
                      className="mt-1 text-lg font-bold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Your aptitude accuracy
                    </h2>

                    <p className="mt-1 text-xs text-[#6B7280]">
                      {correctCount} correct and {incorrectCount} incorrect
                      answers across {attempts.length} attempts.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0">
                      <svg
                        viewBox="0 0 64 64"
                        className="h-16 w-16 -rotate-90"
                      >
                        <circle
                          cx="32"
                          cy="32"
                          r="25"
                          fill="none"
                          stroke="#EEF2F7"
                          strokeWidth="7"
                        />

                        <circle
                          cx="32"
                          cy="32"
                          r="25"
                          fill="none"
                          stroke="#2A9D8F"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={`${accuracy * 1.57} 157`}
                        />
                      </svg>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#14213D]">
                          {accuracy}%
                        </span>
                      </div>
                    </div>

                    <div className="min-w-[180px]">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-[#6B7280]">Correct</span>
                        <span className="font-semibold text-[#2A9D8F]">
                          {correctCount}
                        </span>
                      </div>

                      <div className="mb-3 h-2 overflow-hidden rounded-full bg-[#F1F3F5]">
                        <div
                          className="h-full rounded-full bg-[#2A9D8F]"
                          style={{
                            width: `${accuracy}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-[#6B7280]">Incorrect</span>
                        <span className="font-semibold text-[#E63946]">
                          {incorrectCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attempts */}
              <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                <div className="border-b border-[#F0F1F3] px-5 py-5 sm:px-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                    Attempt history
                  </p>

                  <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2
                      className="text-lg font-bold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Previous questions
                    </h2>

                    <p className="text-xs text-[#6B7280]">
                      Click an attempt to view the explanation
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-[#F0F1F3]">
                  {attempts.map((attempt, index) => {
                    const isExpanded = expanded === attempt.id;

                    return (
                      <div key={attempt.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded(isExpanded ? null : attempt.id)
                          }
                          className="w-full px-5 py-4 text-left transition hover:bg-[#FAFBFC] sm:px-6"
                        >
                          <div className="flex items-center gap-4">
                            {/* Result icon */}
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                attempt.is_correct
                                  ? "bg-[#E7F5F3] text-[#2A9D8F]"
                                  : "bg-[#FDECEE] text-[#E63946]"
                              }`}
                            >
                              {attempt.is_correct ? "✓" : "×"}
                            </div>

                            {/* Main */}
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                                  Question {attempts.length - index}
                                </span>

                                <span className="rounded-full bg-[#EEF2F7] px-2 py-1 text-[9px] font-semibold text-[#495057]">
                                  {attempt.topic}
                                </span>

                                <span className="rounded-full bg-[#FFF5D6] px-2 py-1 text-[9px] font-semibold capitalize text-[#495057]">
                                  {attempt.difficulty}
                                </span>
                              </div>

                              <p className="truncate text-sm font-medium text-[#14213D]">
                                {attempt.question_text}
                              </p>
                            </div>

                            {/* Status */}
                            <div className="hidden shrink-0 text-right sm:block">
                              <p
                                className={`text-xs font-bold ${
                                  attempt.is_correct
                                    ? "text-[#2A9D8F]"
                                    : "text-[#E63946]"
                                }`}
                              >
                                {attempt.is_correct ? "Correct" : "Incorrect"}
                              </p>

                              <p className="mt-1 text-[10px] text-[#9CA3AF]">
                                {isExpanded ? "Hide details" : "View details"}
                              </p>
                            </div>

                            <span className="shrink-0 text-[#9CA3AF]">
                              {isExpanded ? "⌃" : "⌄"}
                            </span>
                          </div>
                        </button>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t border-[#F0F1F3] bg-[#FAFBFC] px-5 pb-6 pt-5 sm:px-6">
                            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                              <div>
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                                  Question
                                </p>

                                <p className="text-sm font-semibold leading-6 text-[#14213D]">
                                  {attempt.question_text}
                                </p>

                                <div className="mt-5">
                                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                                    Options
                                  </p>

                                  <div className="space-y-2">
                                    {attempt.options.map((option, optionIndex) => {
                                      const isCorrect =
                                        option === attempt.correct_answer;

                                      const isSelected =
                                        option === attempt.selected_answer;

                                      return (
                                        <div
                                          key={optionIndex}
                                          className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                                            isCorrect
                                              ? "border-[#BFE6DF] bg-[#E7F5F3]"
                                              : isSelected
                                              ? "border-[#F3B7BD] bg-[#FDECEE]"
                                              : "border-[#E5E7EB] bg-white"
                                          }`}
                                        >
                                          <span
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                                              isCorrect
                                                ? "bg-[#2A9D8F] text-white"
                                                : isSelected
                                                ? "bg-[#E63946] text-white"
                                                : "bg-[#F1F3F5] text-[#495057]"
                                            }`}
                                          >
                                            {["A", "B", "C", "D"][
                                              optionIndex
                                            ] || optionIndex + 1}
                                          </span>

                                          <span className="flex-1 text-xs font-medium text-[#495057]">
                                            {option}
                                          </span>

                                          {isCorrect && (
                                            <span className="text-xs font-bold text-[#2A9D8F]">
                                              Correct
                                            </span>
                                          )}

                                          {!isCorrect && isSelected && (
                                            <span className="text-xs font-bold text-[#E63946]">
                                              Your answer
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div
                                  className={`rounded-xl border p-4 ${
                                    attempt.is_correct
                                      ? "border-[#BFE6DF] bg-[#E7F5F3]"
                                      : "border-[#F3B7BD] bg-[#FDECEE]"
                                  }`}
                                >
                                  <p
                                    className={`text-xs font-bold ${
                                      attempt.is_correct
                                        ? "text-[#187568]"
                                        : "text-[#B42332]"
                                    }`}
                                  >
                                    {attempt.is_correct
                                      ? "Correct answer"
                                      : "Review this question"}
                                  </p>

                                  <p className="mt-2 text-xs leading-5 text-[#495057]">
                                    <span className="font-semibold">
                                      Correct:
                                    </span>{" "}
                                    {attempt.correct_answer}
                                  </p>
                                </div>

                                <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
                                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                                    Explanation
                                  </p>

                                  <p className="text-xs leading-6 text-[#6B7280]">
                                    {attempt.explanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}