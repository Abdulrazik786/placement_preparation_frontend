"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getToken,
  getAptitudeTopics,
  generateAptitudeQuestion,
  answerAptitudeQuestion,
  AptitudeQuestion,
  AptitudeAnswerResult,
} from "@/lib/api";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "Resume AI", href: "/resume", icon: "▤" },
  { label: "Job Matching", href: "/jobs", icon: "⌕" },
  { label: "Mock Interview", href: "/interview", icon: "◉" },
  { label: "Aptitude", href: "/aptitude", icon: "✓" },
  { label: "Profile", href: "/profile", icon: "○" },
];

export default function AptitudePage() {
  const router = useRouter();

  const [topics, setTopics] = useState<Record<string, string[]>>({});
  const [selectedTopic, setSelectedTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");

  const [question, setQuestion] = useState<AptitudeQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<AptitudeAnswerResult | null>(null);

  const [loadingTopics, setLoadingTopics] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    async function loadTopics() {
      try {
        setLoadingTopics(true);
        setError(null);

        const data = await getAptitudeTopics();

        setTopics(data);

        const categories = Object.values(data);

        if (categories.length > 0 && categories[0].length > 0) {
          setSelectedTopic(categories[0][0]);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load aptitude topics"
        );
      } finally {
        setLoadingTopics(false);
      }
    }

    loadTopics();
  }, [router]);

  async function handleGetQuestion() {
    if (!selectedTopic) return;

    try {
      setGenerating(true);
      setError(null);

      setQuestion(null);
      setSelectedOption(null);
      setResult(null);

      const newQuestion = await generateAptitudeQuestion(
        selectedTopic,
        difficulty
      );

      setQuestion(newQuestion);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate question"
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!question || !selectedOption) return;

    try {
      setSubmitting(true);
      setError(null);

      const answerResult = await answerAptitudeQuestion(
        question.id,
        selectedOption
      );

      setResult(answerResult);

      setTotalAnswered((value) => value + 1);

      if (answerResult.is_correct) {
        setStreak((value) => value + 1);
      } else {
        setStreak(0);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit answer"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getOptionClass(option: string) {
    if (!result) {
      if (selectedOption === option) {
        return "border-[#14213D] bg-[#EEF2F7]";
      }

      return "border-[#E5E7EB] bg-white hover:border-[#9CA3AF] hover:bg-[#FAFBFC]";
    }

    if (option === result.correct_answer) {
      return "border-[#2A9D8F] bg-[#E7F5F3]";
    }

    if (option === selectedOption && !result.is_correct) {
      return "border-[#E63946] bg-[#FDECEE]";
    }

    return "border-[#E5E7EB] bg-white opacity-50";
  }

  function getOptionLetter(index: number) {
    const letters = ["A", "B", "C", "D"];
    return letters[index] || String(index + 1);
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#14213D]">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-[250px] flex-col bg-[#14213D] text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <Link href="/dashboard">
            <p
              className="text-xl font-bold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
              }}
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
                      ? "bg-white text-[#14213D]"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      active
                        ? "bg-[#14213D] text-white"
                        : "bg-white/10 text-white/60"
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
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs font-semibold text-white">
              Keep practicing
            </p>

            <p className="mt-1 text-[11px] leading-5 text-white/45">
              Practice consistently to improve your placement test
              preparation.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-5 py-4 lg:hidden">
        <Link href="/dashboard">
          <p
            className="text-lg font-bold"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Placement<span className="text-[#FFB703]">Prep</span>
          </p>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB]"
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
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
          />

          <aside className="relative h-full w-[280px] bg-[#14213D] p-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <p
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Placement<span className="text-[#FFB703]">Prep</span>
              </p>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl text-white/60"
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
                        : "text-white/65 hover:bg-white/10 hover:text-white"
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

      {/* Main Content */}
      <main className="lg:ml-[250px]">
        <div className="mx-auto max-w-[1300px] px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
          {/* Page Header */}
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs text-[#6B7280]">
                <Link
                  href="/dashboard"
                  className="hover:text-[#14213D]"
                >
                  Dashboard
                </Link>

                <span>›</span>

                <span className="text-[#14213D]">Aptitude</span>
              </div>

              <h1
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Aptitude Practice
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                Practice aptitude questions, test your knowledge, and
                review explanations instantly.
              </p>
            </div>

            <Link
              href="/aptitude/history"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#14213D] shadow-sm hover:border-[#14213D]"
            >
              View history
              <span>→</span>
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-6 rounded-xl border border-[#F3B7BD] bg-[#FDECEE] px-4 py-3 text-sm text-[#A61B29]"
              role="alert"
            >
              {error}
            </div>
          )}

          {loadingTopics ? (
            <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
              <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
              <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
              {/* Setup Panel */}
              <section className="h-fit rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">
                    Practice setup
                  </p>

                  <h2
                    className="mt-1 text-lg font-bold"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Choose your challenge
                  </h2>
                </div>

                {/* Topics */}
                <div>
                  <label className="mb-3 block text-xs font-semibold text-[#495057]">
                    Topic
                  </label>

                  <div className="space-y-4">
                    {Object.entries(topics).map(
                      ([category, topicList]) => (
                        <div key={category}>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                            {category}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {topicList.map((topic) => {
                              const active =
                                selectedTopic === topic;

                              return (
                                <button
                                  key={topic}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTopic(topic);
                                    setQuestion(null);
                                    setSelectedOption(null);
                                    setResult(null);
                                  }}
                                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                    active
                                      ? "border-[#14213D] bg-[#14213D] text-white"
                                      : "border-[#E5E7EB] bg-white text-[#495057] hover:border-[#14213D]"
                                  }`}
                                >
                                  {topic}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="mt-6 border-t border-[#F0F1F3] pt-5">
                  <label className="mb-3 block text-xs font-semibold text-[#495057]">
                    Difficulty
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {["easy", "medium", "hard"].map((level) => {
                      const active = difficulty === level;

                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setDifficulty(level);
                            setQuestion(null);
                            setSelectedOption(null);
                            setResult(null);
                          }}
                          className={`rounded-lg border px-2 py-2.5 text-xs font-semibold capitalize ${
                            active
                              ? "border-[#FFB703] bg-[#FFF5D6] text-[#14213D]"
                              : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#FFB703]"
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generate */}
                <button
                  type="button"
                  onClick={handleGetQuestion}
                  disabled={generating || !selectedTopic}
                  className="mt-6 w-full rounded-xl bg-[#14213D] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1E3157] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generating
                    ? "Generating..."
                    : question
                    ? "Next question"
                    : "Start practicing"}
                </button>

                {/* Session Stats */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#F6F8FB] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Answered
                    </p>

                    <p
                      className="mt-1 text-xl font-bold"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {totalAnswered}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FFF8E5] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Streak
                    </p>

                    <p
                      className="mt-1 text-xl font-bold"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {streak}
                    </p>
                  </div>
                </div>
              </section>

              {/* Question Panel */}
              <section className="min-h-[500px] rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                {!question && !generating && (
                  <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#14213D] text-2xl text-white">
                      ✓
                    </div>

                    <h2
                      className="text-xl font-bold"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      Ready to practice?
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                      Choose a topic and difficulty, then click Start
                      practicing to generate your first question.
                    </p>

                    {selectedTopic && (
                      <div className="mt-5 flex gap-2">
                        <span className="rounded-full bg-[#EEF2F7] px-3 py-1.5 text-xs font-medium">
                          {selectedTopic}
                        </span>

                        <span className="rounded-full bg-[#FFF5D6] px-3 py-1.5 text-xs font-medium capitalize">
                          {difficulty}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {generating && (
                  <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-5 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-[#EEF2F7] text-xl">
                      ✦
                    </div>

                    <h2 className="text-lg font-bold">
                      Creating your question...
                    </h2>

                    <p className="mt-2 text-sm text-[#6B7280]">
                      Preparing a {difficulty} question for{" "}
                      {selectedTopic}.
                    </p>
                  </div>
                )}

                {question && !generating && (
                  <div className="p-5 sm:p-7 lg:p-9">
                    {/* Question Header */}
                    <div className="mb-7 border-b border-[#F0F1F3] pb-6">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#EEF2F7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide">
                          {question.topic}
                        </span>

                        <span className="rounded-full bg-[#FFF5D6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide">
                          {question.difficulty}
                        </span>
                      </div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                        Question
                      </p>
                    </div>

                    {/* Question */}
                    <div className="mb-7">
                      <h2
                        className="text-xl font-bold leading-8 sm:text-2xl"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {question.question_text}
                      </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {question.options.map((option, index) => (
                        <button
                          key={`${question.id}-${index}`}
                          type="button"
                          disabled={!!result}
                          onClick={() => {
                            if (!result) {
                              setSelectedOption(option);
                            }
                          }}
                          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${getOptionClass(
                            option
                          )}`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              result &&
                              option === result.correct_answer
                                ? "bg-[#2A9D8F] text-white"
                                : result &&
                                  option === selectedOption &&
                                  !result.is_correct
                                ? "bg-[#E63946] text-white"
                                : selectedOption === option
                                ? "bg-[#14213D] text-white"
                                : "bg-[#F1F3F5] text-[#495057]"
                            }`}
                          >
                            {getOptionLetter(index)}
                          </span>

                          <span className="flex-1 text-sm font-medium leading-6">
                            {option}
                          </span>

                          {result &&
                            option === result.correct_answer && (
                              <span className="font-bold text-[#2A9D8F]">
                                ✓
                              </span>
                            )}

                          {result &&
                            option === selectedOption &&
                            !result.is_correct && (
                              <span className="font-bold text-[#E63946]">
                                ×
                              </span>
                            )}
                        </button>
                      ))}
                    </div>

                    {/* Submit */}
                    {!result && (
                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOption || submitting}
                        className="mt-6 w-full rounded-xl bg-[#14213D] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#1E3157] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting
                          ? "Checking answer..."
                          : "Submit answer"}
                      </button>
                    )}

                    {/* Result */}
                    {result && (
                      <div className="mt-6">
                        <div
                          className={`rounded-2xl border p-5 ${
                            result.is_correct
                              ? "border-[#BFE6DF] bg-[#E7F5F3]"
                              : "border-[#F3B7BD] bg-[#FDECEE]"
                          }`}
                        >
                          <div className="flex gap-4">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white ${
                                result.is_correct
                                  ? "bg-[#2A9D8F]"
                                  : "bg-[#E63946]"
                              }`}
                            >
                              {result.is_correct ? "✓" : "×"}
                            </div>

                            <div>
                              <h3
                                className={`text-sm font-bold ${
                                  result.is_correct
                                    ? "text-[#187568]"
                                    : "text-[#B42332]"
                                }`}
                              >
                                {result.is_correct
                                  ? "Correct answer!"
                                  : "Not quite"}
                              </h3>

                              <p className="mt-1 text-sm leading-6 text-[#495057]">
                                {result.is_correct
                                  ? "Great job. Keep going."
                                  : `The correct answer is ${result.correct_answer}.`}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 border-t border-black/5 pt-4">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
                              Explanation
                            </p>

                            <p className="text-sm leading-6 text-[#495057]">
                              {result.explanation}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleGetQuestion}
                          disabled={generating}
                          className="mt-4 w-full rounded-xl border border-[#14213D] bg-white px-5 py-3.5 text-sm font-semibold text-[#14213D] hover:bg-[#F6F8FB] disabled:opacity-50"
                        >
                          {generating
                            ? "Generating..."
                            : "Continue to next question →"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}