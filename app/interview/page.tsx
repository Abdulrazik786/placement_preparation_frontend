"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getToken,
  listJobs,
  startInterview,
  respondToInterview,
  endInterview,
  evaluateInterview,
  getSuggestedAnswer,
  JobPosting,
  InterviewEvaluation,
} from "@/lib/api";

interface ChatMessage {
  sender: "interviewer" | "candidate";
  content: string;
  questionType?: string;
}

const TYPE_LABELS: Record<string, string> = {
  hr: "HR",
  technical: "Technical",
  resume: "Resume",
  project: "Project",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 75 ? "#2A9D8F" : score >= 50 ? "#FFB703" : "#E63946";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#6B7280]">{label}</span>
        <span className="font-medium text-[#14213D]">{score}/100</span>
      </div>
      <div className="w-full h-2 bg-[#F1F3F5] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [status, setStatus] = useState<"not_started" | "in_progress" | "completed">("not_started");
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    listJobs().catch(() => {}).then((data) => data && setJobs(data));
  }, [router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleStart() {
    setError(null);
    setLoading(true);
    setSuggestion(null);
    try {
      const jobId = selectedJobId ? parseInt(selectedJobId, 10) : undefined;
      const result = await startInterview(jobId);
      setSessionId(result.session_id);
      setMessages([{ sender: "interviewer", content: result.question_text, questionType: result.question_type }]);
      setStatus("in_progress");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview");
    } finally {
      setLoading(false);
    }
  }

  async function handleSuggestAnswer() {
    if (!sessionId) return;
    setError(null);
    setSuggesting(true);
    try {
      const text = await getSuggestedAnswer(sessionId);
      setSuggestion(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get a suggested answer");
    } finally {
      setSuggesting(false);
    }
  }

  async function handleSend(endNow = false) {
    if (!sessionId || (!currentInput.trim() && !endNow)) return;

    const answerText = currentInput.trim() || "(ended interview)";
    setMessages((prev) => [...prev, { sender: "candidate", content: answerText }]);
    setCurrentInput("");
    setSuggestion(null);
    setError(null);
    setLoading(true);

    try {
      const result = await respondToInterview(sessionId, answerText, endNow);
      if (result.status === "completed") {
        setStatus("completed");
        setMessages((prev) => [...prev, { sender: "interviewer", content: result.question_text }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "interviewer", content: result.question_text, questionType: result.question_type },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send answer");
    } finally {
      setLoading(false);
    }
  }

  async function handleEndNow() {
    if (!sessionId) return;
    setError(null);
    setLoading(true);
    try {
      await endInterview(sessionId);
      setStatus("completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end interview");
    } finally {
      setLoading(false);
    }
  }

  async function handleGetEvaluation() {
    if (!sessionId) return;
    setError(null);
    setLoading(true);
    try {
      const result = await evaluateInterview(sessionId);
      setEvaluation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get evaluation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-[#6B7280] hover:text-[#14213D] font-medium">
          ← Dashboard
        </Link>
        <p className="text-lg font-bold text-[#14213D]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Mock Interview
        </p>
        <div className="w-20" />
      </header>

      <main className="max-w-2xl mx-auto w-full px-6 py-8 flex-1 flex flex-col">
        {error && (
          <p className="text-sm text-[#E63946] bg-[#FEE2E2] px-3 py-2 rounded-lg mb-4" role="alert">
            {error}
          </p>
        )}

        {status === "not_started" && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#14213D] mb-3">Start a mock interview</h2>
            <label className="block text-xs text-[#6B7280] mb-1">Target job (optional)</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] mb-4 focus:outline-none focus:ring-2 focus:ring-[#14213D]"
            >
              <option value="">General interview (no specific job)</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} · {job.company_name}
                </option>
              ))}
            </select>
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-[#14213D] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#1F2E52] transition-colors disabled:opacity-60"
            >
              {loading ? "Starting..." : "Start interview"}
            </button>
          </div>
        )}

        {status !== "not_started" && (
          <>
            <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[55vh]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "candidate" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                      msg.sender === "candidate"
                        ? "bg-[#14213D] text-white"
                        : "bg-white border border-[#E5E7EB] text-[#14213D]"
                    }`}
                  >
                    {msg.questionType && (
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-[#FFB703] mb-1">
                        {TYPE_LABELS[msg.questionType] || msg.questionType}
                      </span>
                    )}
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {status === "in_progress" && (
              <div className="space-y-2">
                {suggestion && (
                  <div className="bg-[#FFF8E8] border border-[#FFB703] rounded-lg p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#B8860B] mb-1">
                      Suggested answer
                    </p>
                    <p className="text-sm text-[#14213D]">{suggestion}</p>
                  </div>
                )}
                <button
                  onClick={handleSuggestAnswer}
                  disabled={suggesting || loading}
                  className="text-xs font-medium text-[#14213D] border border-[#E5E7EB] px-3 py-1.5 rounded-lg hover:border-[#FFB703] transition-colors disabled:opacity-50"
                >
                  {suggesting ? "Thinking of an answer..." : "💡 Suggest an answer"}
                </button>
                <textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                  rows={3}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSend()}
                    disabled={loading || !currentInput.trim()}
                    className="flex-1 bg-[#14213D] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#1F2E52] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Thinking..." : "Send answer"}
                  </button>
                  <button
                    onClick={handleEndNow}
                    disabled={loading}
                    className="px-4 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:border-[#E63946] hover:text-[#E63946] transition-colors"
                  >
                    End interview
                  </button>
                </div>
              </div>
            )}

            {status === "completed" && !evaluation && (
              <button
                onClick={handleGetEvaluation}
                disabled={loading}
                className="w-full bg-[#FFB703] text-[#14213D] text-sm font-semibold py-2.5 rounded-lg hover:bg-[#FFC933] transition-colors disabled:opacity-60"
              >
                {loading ? "Evaluating..." : "Get my evaluation"}
              </button>
            )}
          </>
        )}

        {evaluation && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mt-4">
            <h2 className="text-sm font-semibold text-[#14213D] mb-1">Interview evaluation</h2>
            <p className="text-3xl font-bold text-[#14213D] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {evaluation.overall_score}
              <span className="text-sm font-normal text-[#6B7280]"> / 100 overall</span>
            </p>

            <div className="space-y-3 mb-5">
              <ScoreBar label="Technical" score={evaluation.technical_score} />
              <ScoreBar label="Resume knowledge" score={evaluation.resume_score} />
              <ScoreBar label="Project understanding" score={evaluation.project_score} />
              <ScoreBar label="Communication" score={evaluation.communication_score} />
            </div>

            <p className="text-sm text-[#6B7280] mb-4">{evaluation.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Strong areas</h3>
                <div className="flex flex-wrap gap-2">
                  {evaluation.strong_areas.map((a, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#E7F5F3] text-[#2A9D8F]">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                  Needs preparation
                </h3>
                <div className="flex flex-wrap gap-2">
                  {evaluation.needs_preparation.map((a, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#FDECEE] text-[#E63946]">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {evaluation.question_feedback.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                  Question-by-question breakdown
                </h3>
                <div className="space-y-2">
                  {evaluation.question_feedback.map((qf, i) => (
                    <div key={i} className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFeedback(expandedFeedback === i ? null : i)}
                        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-[#F7F8FA] transition-colors"
                      >
                        <span className="text-sm text-[#14213D] font-medium pr-4">{qf.question}</span>
                        <span className="text-xs text-[#6B7280] whitespace-nowrap">
                          {expandedFeedback === i ? "Hide ▲" : "View ▼"}
                        </span>
                      </button>

                      {expandedFeedback === i && (
                        <div className="px-4 pb-4 space-y-3 border-t border-[#E5E7EB] pt-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1">
                              Your answer
                            </p>
                            <p className="text-sm text-[#14213D] bg-[#F7F8FA] rounded-lg px-3 py-2">{qf.answer}</p>
                          </div>

                          {qf.mistakes.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#E63946] mb-1">
                                Mistakes found
                              </p>
                              <ul className="space-y-1">
                                {qf.mistakes.map((m, j) => (
                                  <li
                                    key={j}
                                    className="text-sm text-[#14213D] bg-[#FDECEE] rounded-lg px-3 py-2 flex gap-2"
                                  >
                                    <span className="text-[#E63946]">•</span>
                                    <span>{m}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {qf.ideal_answer && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2A9D8F] mb-1">
                                Ideal answer
                              </p>
                              <p className="text-sm text-[#14213D] bg-[#E7F5F3] rounded-lg px-3 py-2">
                                {qf.ideal_answer}
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-[#6B7280] italic">{qf.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}