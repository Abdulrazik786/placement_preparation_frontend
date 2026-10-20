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
  correction?: string;
  correctionNote?: string;
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
  const [interviewType, setInterviewType] = useState("mixed");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [status, setStatus] = useState<"not_started" | "in_progress" | "completed">("not_started");
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string[] | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice features
  // Voice features
const [voiceEnabled, setVoiceEnabled] = useState(true);
const [isSpeaking, setIsSpeaking] = useState(false);
const [isListening, setIsListening] = useState(false);
const [voiceSupported, setVoiceSupported] = useState(true);

const recognitionRef = useRef<any>(null);
const shouldKeepListeningRef = useRef(false);
const isRecognitionRunningRef = useRef(false);
const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const transcriptRef = useRef("");

useEffect(() => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition || !window.speechSynthesis) {
    setVoiceSupported(false);
    return;
  }

  const recognition = new SpeechRecognition();

  // Keep the recognition session open across short pauses.
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    isRecognitionRunningRef.current = true;
    setIsListening(true);
  };

  recognition.onresult = (event: any) => {
    let finalText = "";
    let interimText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0]?.transcript ?? "";

      if (result.isFinal) {
        finalText += transcript;
      } else {
        interimText += transcript;
      }
    }

    if (finalText.trim()) {
      transcriptRef.current = [
        transcriptRef.current.trim(),
        finalText.trim(),
      ]
        .filter(Boolean)
        .join(" ");

      setCurrentInput(transcriptRef.current);
    } else if (interimText.trim()) {
      // Show interim speech without permanently duplicating it.
      setCurrentInput(
        [transcriptRef.current.trim(), interimText.trim()]
          .filter(Boolean)
          .join(" ")
      );
    }
  };

  recognition.onerror = (event: any) => {
    if (
      event.error === "not-allowed" ||
      event.error === "service-not-allowed"
    ) {
      shouldKeepListeningRef.current = false;
      setIsListening(false);
      setError(
        "Microphone access was blocked. Allow microphone access in your browser settings and try again."
      );
    } else if (event.error === "audio-capture") {
      shouldKeepListeningRef.current = false;
      setIsListening(false);
      setError("No microphone was found. Check your microphone connection.");
    } else if (event.error === "network") {
      setError(
        "Speech recognition needs an internet connection. Check your connection."
      );
    } else if (event.error !== "no-speech" && event.error !== "aborted") {
      setError(`Voice input error: ${event.error}. You can type your answer instead.`);
    }

    // no-speech is recoverable: don't turn off the user's recording request.
    if (
      event.error === "not-allowed" ||
      event.error === "service-not-allowed" ||
      event.error === "audio-capture"
    ) {
      shouldKeepListeningRef.current = false;
    }
  };

  recognition.onend = () => {
    isRecognitionRunningRef.current = false;

    if (!shouldKeepListeningRef.current) {
      setIsListening(false);
      return;
    }

    // Some browsers end recognition after a pause. Restart while the user
    // still wants to record.
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
    }

    restartTimerRef.current = setTimeout(() => {
      if (
        shouldKeepListeningRef.current &&
        !isRecognitionRunningRef.current
      ) {
        try {
          recognition.start();
        } catch {
          // A browser may still be transitioning between recognition sessions.
          // onend will trigger another attempt if the session ends again.
        }
      }
    }, 250);
  };

  recognitionRef.current = recognition;

  return () => {
    shouldKeepListeningRef.current = false;

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
    }

    try {
      recognition.stop();
    } catch {
      // Recognition may already be stopped.
    }

    recognitionRef.current = null;
    isRecognitionRunningRef.current = false;
  };
}, []);

function speak(text: string) {
  if (!voiceEnabled || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;

  utterance.onstart = () => setIsSpeaking(true);
  utterance.onend = () => setIsSpeaking(false);
  utterance.onerror = () => setIsSpeaking(false);

  window.speechSynthesis.speak(utterance);
}

async function toggleListening() {
  const recognition = recognitionRef.current;

  if (!recognition) {
    setError("Speech recognition is not available in this browser.");
    return;
  }

  // Clicking again stops recording immediately and prevents auto-restarting.
  if (shouldKeepListeningRef.current) {
    shouldKeepListeningRef.current = false;

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    try {
      recognition.stop();
    } catch {
      // It may already have stopped.
    }

    setIsListening(false);

    // Commit the last displayed input, including any interim words.
    setCurrentInput((previous) => {
      transcriptRef.current = previous;
      return previous;
    });

    return;
  }

  setError(null);
  window.speechSynthesis?.cancel();
  setIsSpeaking(false);

  // Start with the existing text so recording can append to a typed answer.
  transcriptRef.current = currentInput.trim();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
  } catch {
    setError(
      "Microphone access was blocked or no microphone was found. Allow microphone access in your browser settings and try again."
    );
    return;
  }

  shouldKeepListeningRef.current = true;

  try {
    recognition.start();
    setIsListening(true);
  } catch {
    shouldKeepListeningRef.current = false;
    setIsListening(false);
    setError("Could not start the microphone. Please click the mic and try again.");
  }
}

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    listJobs().catch(() => {}).then((data) => data && setJobs(data));
  }, [router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const last = messages[messages.length - 1];
    if (last && last.sender === "interviewer") {
      speak(last.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  async function handleStart() {
    setError(null);
    setLoading(true);
    setSuggestion(null);
    try {
      const jobId = selectedJobId ? parseInt(selectedJobId, 10) : undefined;
      const result = await startInterview(jobId, undefined, interviewType);
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

      // Attach any grammar/fluency correction to the candidate message that was just sent
      if (result.previous_answer_correction) {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1 && m.sender === "candidate"
              ? {
                  ...m,
                  correction: result.previous_answer_correction ?? undefined,
                  correctionNote: result.previous_answer_correction_note ?? undefined,
                }
              : m
          )
        );
      }

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
        {voiceSupported ? (
          <button
            onClick={() => {
              window.speechSynthesis?.cancel();
              setIsSpeaking(false);
              setVoiceEnabled((v) => !v);
            }}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              voiceEnabled
                ? "border-[#14213D] text-[#14213D] bg-[#F7F8FA]"
                : "border-[#E5E7EB] text-[#6B7280]"
            }`}
          >
            {voiceEnabled ? "🔊 Voice on" : "🔇 Voice off"}
          </button>
        ) : (
          <div className="w-20" />
        )}
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

            <label className="block text-xs text-[#6B7280] mb-2">Interview focus</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { value: "mixed", label: "Full Mix", desc: "HR + Technical + Resume + Project" },
                { value: "hr", label: "HR Interview", desc: "Behavioral & motivation questions" },
                { value: "project", label: "Project-Based", desc: "Deep dive into your projects" },
                { value: "jd", label: "JD-Based", desc: "Requires selecting a target job" },
                { value: "resume", label: "Resume-Based", desc: "Questions about your skills" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setInterviewType(opt.value)}
                  className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                    interviewType === opt.value
                      ? "border-[#14213D] bg-[#F7F8FA]"
                      : "border-[#E5E7EB] hover:border-[#9CA3AF]"
                  }`}
                >
                  <p className="text-sm font-medium text-[#14213D]">{opt.label}</p>
                  <p className="text-[11px] text-[#6B7280]">{opt.desc}</p>
                </button>
              ))}
            </div>

            <label className="block text-xs text-[#6B7280] mb-1">
              Target job {interviewType === "jd" ? "(required for JD-Based)" : "(optional)"}
            </label>
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

            {interviewType === "jd" && !selectedJobId && (
              <p className="text-xs text-[#E63946] mb-3">Select a target job above to start a JD-Based interview.</p>
            )}

            <button
              onClick={handleStart}
              disabled={loading || (interviewType === "jd" && !selectedJobId)}
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
                <div key={i} className={`flex flex-col ${msg.sender === "candidate" ? "items-end" : "items-start"}`}>
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
                    {msg.sender === "interviewer" && isSpeaking && i === messages.length - 1 && (
                      <span className="inline-block mt-1 text-[10px] text-[#6B7280]">🔊 Speaking...</span>
                    )}
                  </div>

                  {msg.correction && (
                    <div className="max-w-[80%] mt-1.5 bg-[#FDECEE] border border-[#F5B5BC] rounded-lg px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#E63946] mb-1">
                        Grammar/fluency fix
                      </p>
                      <p className="text-sm text-[#14213D] italic mb-1">&ldquo;{msg.correction}&rdquo;</p>
                      {msg.correctionNote && <p className="text-xs text-[#6B7280]">{msg.correctionNote}</p>}
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {status === "in_progress" && (
              <div className="space-y-2">
                {suggestion && suggestion.length > 0 && (
                  <div className="bg-[#FFF8E8] border border-[#FFB703] rounded-lg p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#B8860B] mb-1.5">
                      Key points to cover
                    </p>
                    <ul className="space-y-1">
                      {suggestion.map((point, i) => (
                        <li key={i} className="text-sm text-[#14213D] flex gap-2">
                          <span className="text-[#FFB703]">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={handleSuggestAnswer}
                  disabled={suggesting || loading}
                  className="text-xs font-medium text-[#14213D] border border-[#E5E7EB] px-3 py-1.5 rounded-lg hover:border-[#FFB703] transition-colors disabled:opacity-50"
                >
                  {suggesting ? "Thinking..." : "💡 Show key points"}
                </button>
                <div className="relative">
                  <textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={
                      isListening ? "Listening..." : "Type your answer... (Enter to send, Shift+Enter for new line)"
                    }
                    rows={3}
                    disabled={loading}
                    className="w-full px-3 py-2 pr-12 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                  />
                  {voiceSupported && (
                    <button
                      onClick={toggleListening}
                      disabled={loading}
                      title={isListening ? "Stop recording" : "Speak your answer"}
                      className={`absolute right-2 bottom-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isListening
                          ? "bg-[#E63946] text-white animate-pulse"
                          : "bg-[#F1F3F5] text-[#14213D] hover:bg-[#E5E7EB]"
                      }`}
                    >
                      🎤
                    </button>
                  )}
                </div>
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