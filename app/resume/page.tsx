"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getToken,
  uploadResume,
  listResumes,
  analyzeResume,
  generateResume,
  updateGeneratedResume,
  downloadResumeExport,
  listJobs,
  getResumeTemplates,
  improveResumeForAts,
  updateImprovedResume,
  downloadImprovedResume,
  Resume,
  ResumeAnalysis,
  GeneratedResume,
  JobPosting,
  ResumeTemplate,
  ImprovedResume,
} from "@/lib/api";

function ScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#2A9D8F" : score >= 50 ? "#FFB703" : "#E63946";

  return (
    <div className="relative w-28 h-28">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#14213D]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {score}
        </span>
        <span className="text-[10px] text-[#6B7280]">/ 100</span>
      </div>
    </div>
  );
}

function TagList({ items, tone }: { items: string[]; tone: "good" | "bad" | "neutral" }) {
  const styles = {
    good: "bg-[#E7F5F3] text-[#2A9D8F]",
    bad: "bg-[#FDECEE] text-[#E63946]",
    neutral: "bg-[#F1F3F5] text-[#495057]",
  };
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${styles[tone]}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ResumePage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate-from-scratch state
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJobIdForGen, setSelectedJobIdForGen] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [editedText, setEditedText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [savedEdit, setSavedEdit] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);
  const [templates, setTemplates] = useState<Record<string, ResumeTemplate>>({});
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  // Improve-for-ATS state
  const [improving, setImproving] = useState(false);
  const [improvedResume, setImprovedResume] = useState<ImprovedResume | null>(null);
  const [improvedEditedText, setImprovedEditedText] = useState("");
  const [improvedSavingEdit, setImprovedSavingEdit] = useState(false);
  const [improvedSavedEdit, setImprovedSavedEdit] = useState(false);
  const [improvedTemplate, setImprovedTemplate] = useState("modern");
  const [improvedDownloading, setImprovedDownloading] = useState<"pdf" | "docx" | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    loadResumes();
    listJobs().catch(() => {}).then((data) => data && setJobs(data));
    getResumeTemplates().catch(() => {}).then((data) => data && setTemplates(data));
  }, [router]);

  async function loadResumes() {
    try {
      const data = await listResumes();
      setResumes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setAnalysis(null);
    try {
      const uploaded = await uploadResume(file);
      setResumes((prev) => [uploaded, ...prev]);
      setSelectedResumeId(uploaded.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = ""; // allows re-selecting the same file again if needed
    }
  }

  async function handleAnalyze(resumeId: number) {
    setError(null);
    setAnalyzing(true);
    setAnalysis(null);
    setSelectedResumeId(resumeId);
    try {
      const result = await analyzeResume(resumeId);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    setGeneratedResume(null);
    setSavedEdit(false);
    try {
      const jobId = selectedJobIdForGen ? parseInt(selectedJobIdForGen, 10) : undefined;
      const result = await generateResume(jobId);
      setGeneratedResume(result);
      setEditedText(result.resume_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveEdit() {
    if (!generatedResume) return;
    setError(null);
    setSavingEdit(true);
    setSavedEdit(false);
    try {
      const updated = await updateGeneratedResume(generatedResume.id, editedText);
      setGeneratedResume(updated);
      setSavedEdit(true);
      setTimeout(() => setSavedEdit(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDownload(format: "pdf" | "docx") {
    if (!generatedResume) return;
    setError(null);
    setDownloading(format);
    try {
      // Downloads always reflect the last SAVED version - if you've edited the text,
      // save it first so the download matches what you see in the editor.
      await downloadResumeExport("generated", generatedResume.id, format, selectedTemplate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(null);
    }
  }

  async function handleImproveForAts(resumeId: number) {
    setError(null);
    setImproving(true);
    setImprovedResume(null);
    try {
      const result = await improveResumeForAts(resumeId);
      setImprovedResume(result);
      setImprovedEditedText(result.resume_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to improve resume");
    } finally {
      setImproving(false);
    }
  }

  async function handleSaveImprovedEdit() {
    if (!improvedResume) return;
    setError(null);
    setImprovedSavingEdit(true);
    setImprovedSavedEdit(false);
    try {
      const updated = await updateImprovedResume(improvedResume.id, improvedEditedText);
      setImprovedResume(updated);
      setImprovedSavedEdit(true);
      setTimeout(() => setImprovedSavedEdit(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setImprovedSavingEdit(false);
    }
  }

  async function handleDownloadImproved(format: "pdf" | "docx") {
    if (!improvedResume) return;
    setError(null);
    setImprovedDownloading(format);
    try {
      await downloadImprovedResume(improvedResume.id, format, improvedTemplate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setImprovedDownloading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-[#6B7280] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-[#6B7280] hover:text-[#14213D] font-medium">
          ← Dashboard
        </Link>
        <p className="text-lg font-bold text-[#14213D]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Resume &amp; ATS Analysis
        </p>
        <div className="w-20" /> {/* spacer to balance the header */}
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Upload box */}
        <div className="bg-white rounded-xl border border-dashed border-[#D1D5DB] p-6 mb-6 text-center">
          <p className="text-sm text-[#6B7280] mb-3">Upload a PDF resume to get started</p>
          <label className="inline-block cursor-pointer bg-[#14213D] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1F2E52] transition-colors">
            {uploading ? "Uploading..." : "Choose PDF file"}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {error && (
          <p className="text-sm text-[#E63946] bg-[#FEE2E2] px-3 py-2 rounded-lg mb-6" role="alert">
            {error}
          </p>
        )}

        {/* Resume list */}
        {resumes.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 mb-6">
            <h2 className="text-sm font-semibold text-[#14213D] mb-3">Your resumes</h2>
            <div className="space-y-2">
              {resumes.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                    selectedResumeId === r.id ? "border-[#14213D] bg-[#F7F8FA]" : "border-[#E5E7EB]"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-[#14213D]">{r.filename}</p>
                    <p className="text-xs text-[#6B7280]">
                      Uploaded {new Date(r.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAnalyze(r.id)}
                    disabled={analyzing}
                    className="text-xs font-medium text-[#14213D] border border-[#14213D] px-3 py-1.5 rounded-lg hover:bg-[#14213D] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {analyzing && selectedResumeId === r.id ? "Analyzing..." : "Run ATS analysis"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis results */}
        {analysis && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-center gap-6 mb-6">
              <ScoreRing score={analysis.ats_score} />
              <div>
                <h2 className="text-sm font-semibold text-[#14213D] mb-1">ATS Compatibility Score</h2>
                <p className="text-sm text-[#6B7280]">{analysis.summary}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Strengths</h3>
                <TagList items={analysis.strengths} tone="good" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Weaknesses</h3>
                <TagList items={analysis.weaknesses} tone="bad" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                  Missing sections
                </h3>
                <TagList items={analysis.missing_sections} tone="neutral" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                  Suggested keywords
                </h3>
                <TagList items={analysis.keyword_suggestions} tone="neutral" />
              </div>
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                  Formatting issues
                </h3>
                <TagList items={analysis.formatting_issues} tone="bad" />
              </div>
            </div>

            {(analysis.weaknesses.length > 0 ||
              analysis.missing_sections.length > 0 ||
              analysis.formatting_issues.length > 0) &&
              selectedResumeId && (
                <button
                  onClick={() => handleImproveForAts(selectedResumeId)}
                  disabled={improving}
                  className="mt-5 w-full bg-[#FFB703] text-[#14213D] text-sm font-semibold py-2.5 rounded-lg hover:bg-[#FFC933] transition-colors disabled:opacity-60"
                >
                  {improving ? "Fixing formatting..." : "🔧 Fix formatting to improve ATS score"}
                </button>
              )}
          </div>
        )}

        {/* Improved (ATS-fixed) resume results */}
        {improvedResume && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mt-6">
            <h2 className="text-sm font-semibold text-[#14213D] mb-3">ATS-fixed resume</h2>

            <div className="flex items-center gap-6 mb-5">
              <div className="text-center">
                <p className="text-xs text-[#6B7280] mb-1">Before</p>
                <p className="text-2xl font-bold text-[#6B7280]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {improvedResume.ats_score_before}
                </p>
              </div>
              <span className="text-2xl text-[#D1D5DB]">→</span>
              <div className="text-center">
                <p className="text-xs text-[#6B7280] mb-1">After</p>
                <p
                  className={`text-2xl font-bold ${
                    improvedResume.ats_score_after > improvedResume.ats_score_before
                      ? "text-[#2A9D8F]"
                      : "text-[#14213D]"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {improvedResume.ats_score_after}
                </p>
              </div>
              {improvedResume.ats_score_after > improvedResume.ats_score_before && (
                <span className="text-sm font-medium text-[#2A9D8F]">
                  +{improvedResume.ats_score_after - improvedResume.ats_score_before} points
                </span>
              )}
            </div>

            {improvedResume.changes_summary.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                  What was fixed
                </h3>
                <ul className="space-y-1">
                  {improvedResume.changes_summary.map((c, i) => (
                    <li key={i} className="text-sm text-[#14213D] flex gap-2">
                      <span className="text-[#2A9D8F]">✓</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                Edit before downloading
              </label>
              {improvedSavedEdit && <span className="text-xs text-[#2A9D8F] font-medium">Saved ✓</span>}
            </div>
            <textarea
              value={improvedEditedText}
              onChange={(e) => setImprovedEditedText(e.target.value)}
              rows={16}
              className="w-full px-3 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] font-mono focus:outline-none focus:ring-2 focus:ring-[#14213D]"
            />

            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mt-4 mb-2">
              Choose a template
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              {Object.entries(templates).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setImprovedTemplate(key)}
                  className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                    improvedTemplate === key
                      ? "border-[#14213D] bg-[#F7F8FA]"
                      : "border-[#E5E7EB] hover:border-[#9CA3AF]"
                  }`}
                >
                  <p className="text-sm font-medium text-[#14213D]">{t.label}</p>
                  <p className="text-[11px] text-[#6B7280]">{t.description}</p>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSaveImprovedEdit}
                disabled={improvedSavingEdit}
                className="text-sm font-medium text-[#14213D] border border-[#14213D] px-4 py-2 rounded-lg hover:bg-[#14213D] hover:text-white transition-colors disabled:opacity-50"
              >
                {improvedSavingEdit ? "Saving..." : "Save changes"}
              </button>
              <button
                onClick={() => handleDownloadImproved("pdf")}
                disabled={improvedDownloading !== null}
                className="text-sm font-medium text-white bg-[#FFB703] px-4 py-2 rounded-lg hover:bg-[#FFC933] transition-colors disabled:opacity-50"
              >
                {improvedDownloading === "pdf" ? "Downloading..." : "Download PDF"}
              </button>
              <button
                onClick={() => handleDownloadImproved("docx")}
                disabled={improvedDownloading !== null}
                className="text-sm font-medium text-white bg-[#FFB703] px-4 py-2 rounded-lg hover:bg-[#FFC933] transition-colors disabled:opacity-50"
              >
                {improvedDownloading === "docx" ? "Downloading..." : "Download DOCX"}
              </button>
            </div>
          </div>
        )}

        {/* Generate a resume from scratch */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 mt-6">
          <h2 className="text-sm font-semibold text-[#14213D] mb-1">Create a resume from scratch</h2>
          <p className="text-xs text-[#6B7280] mb-3">
            Built entirely from your saved profile (skills, projects, certifications, internships). Make sure
            your profile is filled in first.
          </p>
          <div className="flex flex-col md:flex-row gap-2 mb-2">
            <select
              value={selectedJobIdForGen}
              onChange={(e) => setSelectedJobIdForGen(e.target.value)}
              className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
            >
              <option value="">General resume (no specific job)</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} · {job.company_name}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-[#14213D] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1F2E52] transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {generating ? "Generating..." : "Generate resume"}
            </button>
          </div>

          {generatedResume && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                  Edit before downloading
                </label>
                {savedEdit && <span className="text-xs text-[#2A9D8F] font-medium">Saved ✓</span>}
              </div>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={16}
                className="w-full px-3 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] font-mono focus:outline-none focus:ring-2 focus:ring-[#14213D]"
              />

              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mt-4 mb-2">
                Choose a template
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {Object.entries(templates).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                      selectedTemplate === key
                        ? "border-[#14213D] bg-[#F7F8FA]"
                        : "border-[#E5E7EB] hover:border-[#9CA3AF]"
                    }`}
                  >
                    <p className="text-sm font-medium text-[#14213D]">{t.label}</p>
                    <p className="text-[11px] text-[#6B7280]">{t.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="text-sm font-medium text-[#14213D] border border-[#14213D] px-4 py-2 rounded-lg hover:bg-[#14213D] hover:text-white transition-colors disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save changes"}
                </button>
                <button
                  onClick={() => handleDownload("pdf")}
                  disabled={downloading !== null}
                  className="text-sm font-medium text-white bg-[#FFB703] px-4 py-2 rounded-lg hover:bg-[#FFC933] transition-colors disabled:opacity-50"
                >
                  {downloading === "pdf" ? "Downloading..." : "Download PDF"}
                </button>
                <button
                  onClick={() => handleDownload("docx")}
                  disabled={downloading !== null}
                  className="text-sm font-medium text-white bg-[#FFB703] px-4 py-2 rounded-lg hover:bg-[#FFC933] transition-colors disabled:opacity-50"
                >
                  {downloading === "docx" ? "Downloading..." : "Download DOCX"}
                </button>
              </div>
              <p className="text-xs text-[#6B7280] mt-2">
                Downloads use the last saved version — click &quot;Save changes&quot; after editing, before downloading.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}