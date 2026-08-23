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

export default function AptitudePage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Record<string, string[]>>({});
  const [selectedTopic, setSelectedTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [question, setQuestion] = useState<AptitudeQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<AptitudeAnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    getAptitudeTopics()
      .then((data) => {
        setTopics(data);
        const firstCategory = Object.values(data)[0];
        if (firstCategory?.length) setSelectedTopic(firstCategory[0]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load topics"));
  }, [router]);

  async function handleGetQuestion() {
    setError(null);
    setLoading(true);
    setQuestion(null);
    setResult(null);
    setSelectedOption(null);
    try {
      const q = await generateAptitudeQuestion(selectedTopic, difficulty);
      setQuestion(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate question");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!question || !selectedOption) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await answerAptitudeQuestion(question.id, selectedOption);
      setResult(res);
      setTotalAnswered((n) => n + 1);
      setStreak((s) => (res.is_correct ? s + 1 : 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  function optionStyle(option: string) {
    if (!result) {
      return selectedOption === option
        ? "border-[#14213D] bg-[#F7F8FA]"
        : "border-[#E5E7EB] hover:border-[#9CA3AF]";
    }
    // After answering: highlight correct answer green, wrong selection red
    if (option === result.correct_answer) return "border-[#2A9D8F] bg-[#E7F5F3]";
    if (option === selectedOption && !result.is_correct) return "border-[#E63946] bg-[#FDECEE]";
    return "border-[#E5E7EB] opacity-60";
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-[#6B7280] hover:text-[#14213D] font-medium">
          ← Dashboard
        </Link>
        <p className="text-lg font-bold text-[#14213D]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Aptitude Practice
        </p>
        <div className="text-xs text-[#6B7280]">
          {totalAnswered > 0 && (
            <span>
              Streak: <span className="font-semibold text-[#FFB703]">{streak}</span> · Answered:{" "}
              {totalAnswered}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {error && (
          <p className="text-sm text-[#E63946] bg-[#FEE2E2] px-3 py-2 rounded-lg mb-4" role="alert">
            {error}
          </p>
        )}

        {/* Topic + difficulty picker */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 mb-6">
          <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
            Category
          </label>
          {Object.entries(topics).map(([category, topicList]) => (
            <div key={category} className="mb-3">
              <p className="text-xs font-medium text-[#14213D] mb-1.5">{category}</p>
              <div className="flex flex-wrap gap-2">
                {topicList.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedTopic === t
                        ? "bg-[#14213D] text-white border-[#14213D]"
                        : "bg-white text-[#14213D] border-[#E5E7EB] hover:border-[#14213D]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mt-4 mb-2">
            Difficulty
          </label>
          <div className="flex gap-2 mb-4">
            {["easy", "medium", "hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
                  difficulty === d
                    ? "bg-[#FFB703] text-[#14213D] border-[#FFB703] font-semibold"
                    : "bg-white text-[#14213D] border-[#E5E7EB] hover:border-[#FFB703]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={handleGetQuestion}
            disabled={loading || !selectedTopic}
            className="w-full bg-[#14213D] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#1F2E52] transition-colors disabled:opacity-60"
          >
            {loading ? "Generating..." : question ? "Next question" : "Start practicing"}
          </button>
        </div>

        {/* Question + options */}
        {question && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] bg-[#F1F3F5] px-2 py-1 rounded-full mb-3">
              {question.topic} · {question.difficulty}
            </span>
            <p className="text-sm font-medium text-[#14213D] mb-4">{question.question_text}</p>

            <div className="space-y-2 mb-4">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => !result && setSelectedOption(option)}
                  disabled={!!result}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm text-[#14213D] transition-colors ${optionStyle(
                    option
                  )}`}
                >
                  {option}
                </button>
              ))}
            </div>

            {!result && (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption || submitting}
                className="w-full bg-[#14213D] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#1F2E52] transition-colors disabled:opacity-50"
              >
                {submitting ? "Checking..." : "Submit answer"}
              </button>
            )}

            {result && (
              <div
                className={`rounded-lg p-4 ${
                  result.is_correct ? "bg-[#E7F5F3]" : "bg-[#FDECEE]"
                }`}
              >
                <p
                  className={`text-sm font-semibold mb-1 ${
                    result.is_correct ? "text-[#2A9D8F]" : "text-[#E63946]"
                  }`}
                >
                  {result.is_correct ? "Correct! ✓" : "Not quite"}
                </p>
                <p className="text-sm text-[#14213D]">{result.explanation}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}