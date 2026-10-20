"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

/* =========================================================
   ICON
========================================================= */

function Icon({
  name,
  size = 20,
}: {
  name:
    | "resume"
    | "upload"
    | "analysis"
    | "sparkles"
    | "download"
    | "edit"
    | "check"
    | "alert"
    | "target"
    | "briefcase"
    | "template"
    | "dashboard"
    | "jobs"
    | "close"
    | "menu"
    | "arrow"
    | "refresh"
    | "file";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "resume":
      return (
        <svg {...common}>
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h5M9 9h2" />
        </svg>
      );

    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M5 20h14" />
        </svg>
      );

    case "analysis":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 3-4 3 2 5-7" />
        </svg>
      );

    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3-1.3 5.2L6 10l4.7 1.8L12 17l1.3-5.2L18 10l-4.7-1.8z" />
          <path d="m19 15-.7 2.3L16 18l2.3.7L19 21l.7-2.3L22 18l-2.3-.7z" />
        </svg>
      );

    case "download":
      return (
        <svg {...common}>
          <path d="M12 4v11" />
          <path d="m7 11 5 5 5-5" />
          <path d="M5 20h14" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "alert":
      return (
        <svg {...common}>
          <path d="M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      );

    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );

    case "briefcase":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );

    case "template":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
      );

    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "jobs":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 1 0 2 5" />
          <path d="M20 4v7h-7" />
        </svg>
      );

    case "file":
      return (
        <svg {...common}>
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M14 3v5h5" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   SCORE RING
========================================================= */

function ScoreRing({
  score,
  size = "large",
}: {
  score: number;
  size?: "small" | "large";
}) {
  const radius = size === "large" ? 52 : 36;
  const box = size === "large" ? 132 : 92;
  const stroke = size === "large" ? 9 : 7;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.max(0, Math.min(100, score));
  const offset =
    circumference - (safeScore / 100) * circumference;

  const color =
    safeScore >= 75
      ? "#2A9D8F"
      : safeScore >= 50
      ? "#F59E0B"
      : "#E63946";

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: box, height: box }}
    >
      <svg
        width={box}
        height={box}
        viewBox="0 0 120 120"
        className="-rotate-90"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#E8EDF3"
          strokeWidth={stroke}
        />

        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-bold text-[#14213D] ${
            size === "large" ? "text-3xl" : "text-xl"
          }`}
        >
          {score}
        </span>

        <span className="text-[10px] text-[#94A3B8]">
          / 100
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   TAG LIST
========================================================= */

function TagList({
  items,
  tone,
}: {
  items: string[];
  tone: "good" | "bad" | "neutral";
}) {
  const styles = {
    good: "bg-[#E9F7F4] text-[#278F82]",
    bad: "bg-[#FDEEEF] text-[#D93648]",
    neutral: "bg-[#F1F4F7] text-[#526174]",
  };

  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-[#94A3B8]">
        None found
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`text-xs px-3 py-1.5 rounded-lg ${styles[tone]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

const sidebarItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard" as const,
  },
  {
    label: "Resume AI",
    href: "/resume",
    icon: "resume" as const,
  },
  {
    label: "Job Matching",
    href: "/jobs",
    icon: "jobs" as const,
  },
  {
    label: "Mock Interview",
    href: "/interview",
    icon: "analysis" as const,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function ResumePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] =
    useState<number | null>(null);

  const [analysis, setAnalysis] =
    useState<ResumeAnalysis | null>(null);

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [mobileMenu, setMobileMenu] = useState(false);

  const [activeSection, setActiveSection] =
    useState<"upload" | "analysis" | "generate">("upload");

  /* Generate */

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJobIdForGen, setSelectedJobIdForGen] =
    useState("");

  const [generating, setGenerating] = useState(false);

  const [generatedResume, setGeneratedResume] =
    useState<GeneratedResume | null>(null);

  const [editedText, setEditedText] = useState("");

  const [savingEdit, setSavingEdit] = useState(false);
  const [savedEdit, setSavedEdit] = useState(false);

  const [downloading, setDownloading] =
    useState<"pdf" | "docx" | null>(null);

  const [templates, setTemplates] =
    useState<Record<string, ResumeTemplate>>({});

  const [selectedTemplate, setSelectedTemplate] =
    useState("modern");

  /* Improve ATS */

  const [improving, setImproving] = useState(false);

  const [improvedResume, setImprovedResume] =
    useState<ImprovedResume | null>(null);

  const [improvedEditedText, setImprovedEditedText] =
    useState("");

  const [improvedSavingEdit, setImprovedSavingEdit] =
    useState(false);

  const [improvedSavedEdit, setImprovedSavedEdit] =
    useState(false);

  const [improvedTemplate, setImprovedTemplate] =
    useState("modern");

  const [improvedDownloading, setImprovedDownloading] =
    useState<"pdf" | "docx" | null>(null);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        const resumeData = await listResumes();
        setResumes(resumeData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load resumes"
        );
      } finally {
        setLoading(false);
      }

      listJobs()
        .then((data) => setJobs(data))
        .catch(() => {});

      getResumeTemplates()
        .then((data) => setTemplates(data))
        .catch(() => {});
    }

    load();
  }, [router]);

  /* =========================================================
     UPLOAD
  ========================================================= */

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setError(null);
    setUploading(true);
    setAnalysis(null);
    setImprovedResume(null);

    try {
      const uploaded = await uploadResume(file);

      setResumes((prev) => [uploaded, ...prev]);
      setSelectedResumeId(uploaded.id);
      setActiveSection("analysis");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);

      if (e.target) {
        e.target.value = "";
      }
    }
  }

  /* =========================================================
     ANALYZE
  ========================================================= */

  async function handleAnalyze(resumeId: number) {
    setError(null);
    setAnalyzing(true);
    setAnalysis(null);
    setSelectedResumeId(resumeId);
    setImprovedResume(null);
    setActiveSection("analysis");

    try {
      const result = await analyzeResume(resumeId);
      setAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Analysis failed"
      );
    } finally {
      setAnalyzing(false);
    }
  }

  /* =========================================================
     IMPROVE ATS
  ========================================================= */

  async function handleImproveForAts(
    resumeId: number
  ) {
    setError(null);
    setImproving(true);
    setImprovedResume(null);

    try {
      const result =
        await improveResumeForAts(resumeId);

      setImprovedResume(result);
      setImprovedEditedText(result.resume_text);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to improve resume"
      );
    } finally {
      setImproving(false);
    }
  }

  /* =========================================================
     SAVE IMPROVED
  ========================================================= */

  async function handleSaveImprovedEdit() {
    if (!improvedResume) return;

    setError(null);
    setImprovedSavingEdit(true);
    setImprovedSavedEdit(false);

    try {
      const updated =
        await updateImprovedResume(
          improvedResume.id,
          improvedEditedText
        );

      setImprovedResume(updated);
      setImprovedSavedEdit(true);

      setTimeout(() => {
        setImprovedSavedEdit(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save changes"
      );
    } finally {
      setImprovedSavingEdit(false);
    }
  }

  /* =========================================================
     DOWNLOAD IMPROVED
  ========================================================= */

  async function handleDownloadImproved(
    format: "pdf" | "docx"
  ) {
    if (!improvedResume) return;

    setError(null);
    setImprovedDownloading(format);

    try {
      await downloadImprovedResume(
        improvedResume.id,
        format,
        improvedTemplate
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Download failed"
      );
    } finally {
      setImprovedDownloading(null);
    }
  }

  /* =========================================================
     GENERATE
  ========================================================= */

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    setGeneratedResume(null);
    setSavedEdit(false);

    try {
      const jobId = selectedJobIdForGen
        ? parseInt(selectedJobIdForGen, 10)
        : undefined;

      const result = await generateResume(jobId);

      setGeneratedResume(result);
      setEditedText(result.resume_text);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Resume generation failed"
      );
    } finally {
      setGenerating(false);
    }
  }

  /* =========================================================
     SAVE GENERATED
  ========================================================= */

  async function handleSaveEdit() {
    if (!generatedResume) return;

    setError(null);
    setSavingEdit(true);
    setSavedEdit(false);

    try {
      const updated =
        await updateGeneratedResume(
          generatedResume.id,
          editedText
        );

      setGeneratedResume(updated);
      setSavedEdit(true);

      setTimeout(() => {
        setSavedEdit(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save changes"
      );
    } finally {
      setSavingEdit(false);
    }
  }

  /* =========================================================
     DOWNLOAD GENERATED
  ========================================================= */

  async function handleDownload(
    format: "pdf" | "docx"
  ) {
    if (!generatedResume) return;

    setError(null);
    setDownloading(format);

    try {
      await downloadResumeExport(
        "generated",
        generatedResume.id,
        format,
        selectedTemplate
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Download failed"
      );
    } finally {
      setDownloading(null);
    }
  }

  /* =========================================================
     SELECTED RESUME
  ========================================================= */

  const selectedResume = useMemo(() => {
    return resumes.find(
      (resume) => resume.id === selectedResumeId
    );
  }, [resumes, selectedResumeId]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#E5EAF0] border-t-[#14213D] animate-spin mx-auto" />

          <p className="mt-4 text-sm text-[#64748B]">
            Loading Resume AI...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#14213D]">
      {/* MOBILE HEADER */}

      <header className="lg:hidden sticky top-0 z-40 h-16 bg-white border-b border-[#E5EAF0] px-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">
            Resume AI
          </p>

          <p className="text-[10px] text-[#94A3B8]">
            Build a stronger resume
          </p>
        </div>

        <button
          onClick={() => setMobileMenu(true)}
          className="w-10 h-10 rounded-xl bg-[#F1F4F8] flex items-center justify-center"
        >
          <Icon name="menu" size={20} />
        </button>
      </header>

      {/* MOBILE MENU */}

      {mobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          />

          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#14213D] text-white p-5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xl font-bold">
                  Placement Prep
                </p>

                <p className="text-xs text-white/45 mt-1">
                  Career preparation
                </p>
              </div>

              <button
                onClick={() => setMobileMenu(false)}
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <nav className="space-y-1.5">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenu(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm ${
                    item.href === "/resume"
                      ? "bg-white text-[#14213D] font-semibold"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} size={19} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[245px] bg-[#14213D] text-white flex-col p-5 z-40">
        <div className="px-2 mb-9">
          <p className="text-xl font-bold">
            Placement Prep
          </p>

          <p className="text-xs text-white/45 mt-1">
            Career preparation platform
          </p>
        </div>

        <nav className="space-y-1.5">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-colors ${
                item.href === "/resume"
                  ? "bg-white text-[#14213D] font-semibold"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={item.icon} size={19} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Icon name="resume" size={18} />
            My profile
          </Link>
        </div>
      </aside>

      {/* MAIN */}

      <main className="lg:ml-[245px]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-7 lg:py-9">
          {/* HEADER */}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#94A3B8] hover:text-[#14213D] mb-3"
              >
                ← Dashboard
              </Link>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Resume AI
              </h1>

              <p className="text-sm text-[#64748B] mt-2">
                Analyze, improve and generate a job-ready resume.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-xl bg-white border border-[#E3E8EF] text-xs text-[#64748B]">
                {resumes.length} resume
                {resumes.length === 1 ? "" : "s"} uploaded
              </div>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 flex items-start gap-3">
              <div className="text-red-500 mt-0.5">
                <Icon name="alert" size={17} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                  Something went wrong
                </p>

                <p className="text-xs text-red-600 mt-1">
                  {error}
                </p>
              </div>

              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          )}

          {/* WORKFLOW NAVIGATION */}

          <div className="bg-white border border-[#E3E8EF] rounded-2xl p-2 mb-7 overflow-x-auto">
            <div className="flex min-w-max gap-1">
              <button
                onClick={() => setActiveSection("upload")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === "upload"
                    ? "bg-[#14213D] text-white"
                    : "text-[#64748B] hover:bg-[#F4F6F8]"
                }`}
              >
                <Icon name="upload" size={17} />
                Upload
              </button>

              <button
                onClick={() => setActiveSection("analysis")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === "analysis"
                    ? "bg-[#14213D] text-white"
                    : "text-[#64748B] hover:bg-[#F4F6F8]"
                }`}
              >
                <Icon name="analysis" size={17} />
                ATS Analysis
              </button>

              <button
                onClick={() => setActiveSection("generate")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === "generate"
                    ? "bg-[#14213D] text-white"
                    : "text-[#64748B] hover:bg-[#F4F6F8]"
                }`}
              >
                <Icon name="sparkles" size={17} />
                Generate Resume
              </button>
            </div>
          </div>

          {/* =================================================
              UPLOAD SECTION
          ================================================= */}

          {activeSection === "upload" && (
            <section className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-5">
                {/* UPLOAD */}

                <div className="bg-white border border-[#E3E8EF] rounded-3xl p-6 sm:p-8">
                  <div className="max-w-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-[#14213D] text-white flex items-center justify-center">
                      <Icon name="upload" size={22} />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold">
                      Upload your resume
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#64748B]">
                      Upload your PDF resume and use AI to analyze its ATS compatibility, identify weaknesses and suggest improvements.
                    </p>

                    <div
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="mt-7 border-2 border-dashed border-[#D9E0E8] hover:border-[#14213D] rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-colors group"
                    >
                      <div className="mx-auto w-14 h-14 rounded-2xl bg-[#F2F5F8] group-hover:bg-[#E9EDF2] flex items-center justify-center transition-colors">
                        <Icon
                          name="file"
                          size={25}
                        />
                      </div>

                      <p className="mt-5 text-sm font-semibold">
                        {uploading
                          ? "Uploading resume..."
                          : "Choose your PDF resume"}
                      </p>

                      <p className="mt-2 text-xs text-[#94A3B8]">
                        Click here to browse files
                      </p>

                      <button
                        type="button"
                        disabled={uploading}
                        className="mt-5 px-5 py-2.5 rounded-xl bg-[#14213D] text-white text-sm font-semibold disabled:opacity-50"
                      >
                        {uploading
                          ? "Uploading..."
                          : "Select PDF"}
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>

                {/* HOW IT WORKS */}

                <div className="bg-[#14213D] text-white rounded-3xl p-6 sm:p-7">
                  <p className="text-xs uppercase tracking-wider text-white/45 font-bold">
                    How it works
                  </p>

                  <h3 className="text-xl font-bold mt-2">
                    Three simple steps
                  </h3>

                  <div className="mt-7 space-y-5">
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        1
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Upload
                        </p>

                        <p className="text-xs text-white/50 mt-1 leading-5">
                          Upload your existing PDF resume.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        2
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Analyze
                        </p>

                        <p className="text-xs text-white/50 mt-1 leading-5">
                          Get your ATS score and detailed feedback.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        3
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Improve
                        </p>

                        <p className="text-xs text-white/50 mt-1 leading-5">
                          Use AI to fix issues and create a better resume.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RESUME LIST */}

              {resumes.length > 0 && (
                <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-[#94A3B8]">
                        Your files
                      </p>

                      <h2 className="text-lg font-bold mt-1">
                        Uploaded resumes
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {resumes.map((resume) => (
                      <div
                        key={resume.id}
                        className={`group border rounded-2xl p-4 transition-all ${
                          selectedResumeId === resume.id
                            ? "border-[#14213D] bg-[#F8FAFC]"
                            : "border-[#E3E8EF] hover:border-[#C7D0DB]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F1F4F8] flex items-center justify-center flex-shrink-0">
                            <Icon name="file" size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">
                              {resume.filename}
                            </p>

                            <p className="text-[11px] text-[#94A3B8] mt-1">
                              {new Date(
                                resume.uploaded_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleAnalyze(resume.id)
                          }
                          disabled={analyzing}
                          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#14213D] text-white text-xs font-semibold disabled:opacity-50"
                        >
                          <Icon
                            name="analysis"
                            size={15}
                          />

                          {analyzing &&
                          selectedResumeId ===
                            resume.id
                            ? "Analyzing..."
                            : "Analyze resume"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* =================================================
              ANALYSIS SECTION
          ================================================= */}

          {activeSection === "analysis" && (
            <section className="space-y-6">
              {/* SELECT RESUME */}

              {resumes.length > 0 && (
                <div className="bg-white border border-[#E3E8EF] rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-[#F1F4F8] flex items-center justify-center">
                        <Icon name="resume" size={17} />
                      </div>

                      <div>
                        <p className="text-xs text-[#94A3B8]">
                          Selected resume
                        </p>

                        <p className="text-sm font-semibold truncate max-w-[300px]">
                          {selectedResume?.filename ||
                            "Choose a resume below"}
                        </p>
                      </div>
                    </div>

                    <select
                      value={selectedResumeId ?? ""}
                      onChange={(e) => {
                        const id = Number(
                          e.target.value
                        );

                        if (id) {
                          handleAnalyze(id);
                        }
                      }}
                      className="px-3 py-2.5 rounded-xl border border-[#E3E8EF] text-sm bg-white"
                    >
                      <option value="">
                        Select resume
                      </option>

                      {resumes.map((resume) => (
                        <option
                          key={resume.id}
                          value={resume.id}
                        >
                          {resume.filename}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* EMPTY */}

              {!analysis && !analyzing && (
                <div className="bg-white border border-dashed border-[#D7DEE7] rounded-3xl p-10 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-[#F1F4F8] flex items-center justify-center">
                    <Icon
                      name="analysis"
                      size={25}
                    />
                  </div>

                  <h2 className="mt-5 text-xl font-bold">
                    Run an ATS analysis
                  </h2>

                  <p className="mt-2 text-sm text-[#64748B] max-w-md mx-auto">
                    Select an uploaded resume to see its ATS score, strengths, weaknesses and improvement suggestions.
                  </p>
                </div>
              )}

              {/* ANALYZING */}

              {analyzing && (
                <div className="bg-white border border-[#E3E8EF] rounded-3xl p-12 text-center">
                  <div className="w-12 h-12 border-4 border-[#E5EAF0] border-t-[#14213D] rounded-full animate-spin mx-auto" />

                  <h2 className="mt-5 text-lg font-bold">
                    Analyzing your resume
                  </h2>

                  <p className="mt-2 text-sm text-[#64748B]">
                    Checking ATS compatibility and resume structure...
                  </p>
                </div>
              )}

              {/* ANALYSIS */}

              {analysis && (
                <>
                  {/* SCORE HERO */}

                  <div className="bg-white border border-[#E3E8EF] rounded-3xl p-6 sm:p-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-7">
                      <ScoreRing
                        score={analysis.ats_score}
                      />

                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-wider font-bold text-[#94A3B8]">
                          ATS compatibility
                        </p>

                        <h2 className="text-2xl font-bold mt-1">
                          Your resume score
                        </h2>

                        <p className="text-sm text-[#64748B] leading-6 mt-2 max-w-2xl">
                          {analysis.summary}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {analysis.ats_score >= 75 ? (
                            <span className="px-3 py-1.5 rounded-lg bg-[#E9F7F4] text-[#278F82] text-xs font-semibold">
                              Strong ATS compatibility
                            </span>
                          ) : analysis.ats_score >= 50 ? (
                            <span className="px-3 py-1.5 rounded-lg bg-[#FFF6DF] text-[#A56A00] text-xs font-semibold">
                              Needs improvement
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 rounded-lg bg-[#FDEEEF] text-[#D93648] text-xs font-semibold">
                              Significant improvements needed
                            </span>
                          )}
                        </div>
                      </div>

                      {selectedResumeId && (
                        <button
                          onClick={() =>
                            handleImproveForAts(
                              selectedResumeId
                            )
                          }
                          disabled={improving}
                          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#14213D] text-white text-sm font-semibold hover:bg-[#1D3157] disabled:opacity-50"
                        >
                          <Icon
                            name="sparkles"
                            size={17}
                          />

                          {improving
                            ? "Improving..."
                            : "Improve with AI"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ANALYSIS GRID */}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#E9F7F4] text-[#278F82] flex items-center justify-center">
                          <Icon
                            name="check"
                            size={16}
                          />
                        </div>

                        <h3 className="text-sm font-bold">
                          Strengths
                        </h3>
                      </div>

                      <TagList
                        items={analysis.strengths}
                        tone="good"
                      />
                    </div>

                    <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#FDEEEF] text-[#D93648] flex items-center justify-center">
                          <Icon
                            name="alert"
                            size={16}
                          />
                        </div>

                        <h3 className="text-sm font-bold">
                          Weaknesses
                        </h3>
                      </div>

                      <TagList
                        items={analysis.weaknesses}
                        tone="bad"
                      />
                    </div>

                    <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#F1F4F8] text-[#526174] flex items-center justify-center">
                          <Icon
                            name="resume"
                            size={16}
                          />
                        </div>

                        <h3 className="text-sm font-bold">
                          Missing sections
                        </h3>
                      </div>

                      <TagList
                        items={analysis.missing_sections}
                        tone="neutral"
                      />
                    </div>

                    <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#F1F4F8] text-[#526174] flex items-center justify-center">
                          <Icon
                            name="target"
                            size={16}
                          />
                        </div>

                        <h3 className="text-sm font-bold">
                          Suggested keywords
                        </h3>
                      </div>

                      <TagList
                        items={analysis.keyword_suggestions}
                        tone="neutral"
                      />
                    </div>
                  </div>

                  {/* FORMATTING */}

                  <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider font-bold text-[#94A3B8]">
                          Resume quality
                        </p>

                        <h3 className="text-lg font-bold mt-1">
                          Formatting issues
                        </h3>
                      </div>

                      <Icon
                        name="template"
                        size={20}
                      />
                    </div>

                    <TagList
                      items={analysis.formatting_issues}
                      tone="bad"
                    />
                  </div>
                </>
              )}

              {/* IMPROVED RESUME */}

              {improvedResume && (
                <div className="bg-white border border-[#E3E8EF] rounded-3xl p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4 mb-7">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-[#94A3B8]">
                        AI improvement
                      </p>

                      <h2 className="text-xl font-bold mt-1">
                        ATS-fixed resume
                      </h2>
                    </div>

                    <span className="px-3 py-1.5 rounded-lg bg-[#E9F7F4] text-[#278F82] text-xs font-bold">
                      Improved
                    </span>
                  </div>

                  {/* BEFORE AFTER */}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
                    <div className="rounded-2xl bg-[#F7F9FB] p-5">
                      <p className="text-xs text-[#94A3B8]">
                        Before
                      </p>

                      <p className="text-3xl font-bold mt-2 text-[#64748B]">
                        {improvedResume.ats_score_before}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#F7F9FB] p-5">
                      <p className="text-xs text-[#94A3B8]">
                        After
                      </p>

                      <p className="text-3xl font-bold mt-2 text-[#278F82]">
                        {improvedResume.ats_score_after}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#14213D] text-white p-5">
                      <p className="text-xs text-white/50">
                        Difference
                      </p>

                      <p className="text-3xl font-bold mt-2">
                        {improvedResume.ats_score_after -
                          improvedResume.ats_score_before >
                        0
                          ? "+"
                          : ""}
                        {improvedResume.ats_score_after -
                          improvedResume.ats_score_before}
                      </p>
                    </div>
                  </div>

                  {/* CHANGES */}

                  {improvedResume.changes_summary
                    .length > 0 && (
                    <div className="mb-7">
                      <p className="text-xs uppercase tracking-wider font-bold text-[#94A3B8] mb-3">
                        What was fixed
                      </p>

                      <div className="space-y-2">
                        {improvedResume.changes_summary.map(
                          (change, index) => (
                            <div
                              key={`${change}-${index}`}
                              className="flex gap-3 items-start"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#E9F7F4] text-[#278F82] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Icon
                                  name="check"
                                  size={13}
                                />
                              </div>

                              <p className="text-sm text-[#475569]">
                                {change}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* EDIT */}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs uppercase tracking-wider font-bold text-[#94A3B8]">
                        Edit improved resume
                      </label>

                      {improvedSavedEdit && (
                        <span className="text-xs font-semibold text-[#278F82]">
                          Saved ✓
                        </span>
                      )}
                    </div>

                    <textarea
                      value={improvedEditedText}
                      onChange={(e) =>
                        setImprovedEditedText(
                          e.target.value
                        )
                      }
                      rows={18}
                      className="w-full px-4 py-4 rounded-2xl border border-[#E3E8EF] bg-[#FAFBFC] text-sm font-mono leading-6 text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#14213D]/10 focus:border-[#14213D]"
                    />
                  </div>

                  {/* TEMPLATE */}

                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-wider font-bold text-[#94A3B8] mb-3">
                      Choose template
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(templates).map(
                        ([key, template]) => (
                          <button
                            key={key}
                            onClick={() =>
                              setImprovedTemplate(
                                key
                              )
                            }
                            className={`text-left rounded-xl border p-3 transition-all ${
                              improvedTemplate === key
                                ? "border-[#14213D] bg-[#F5F7FA]"
                                : "border-[#E3E8EF] hover:border-[#AEB8C5]"
                            }`}
                          >
                            <p className="text-sm font-semibold">
                              {template.label}
                            </p>

                            <p className="text-[11px] text-[#94A3B8] mt-1 leading-4">
                              {template.description}
                            </p>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={
                        handleSaveImprovedEdit
                      }
                      disabled={
                        improvedSavingEdit
                      }
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#14213D] text-[#14213D] text-sm font-semibold hover:bg-[#14213D] hover:text-white disabled:opacity-50"
                    >
                      <Icon
                        name="check"
                        size={16}
                      />

                      {improvedSavingEdit
                        ? "Saving..."
                        : "Save changes"}
                    </button>

                    <button
                      onClick={() =>
                        handleDownloadImproved(
                          "pdf"
                        )
                      }
                      disabled={
                        improvedDownloading !==
                        null
                      }
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#14213D] text-white text-sm font-semibold disabled:opacity-50"
                    >
                      <Icon
                        name="download"
                        size={16}
                      />

                      {improvedDownloading ===
                      "pdf"
                        ? "Downloading..."
                        : "Download PDF"}
                    </button>

                    <button
                      onClick={() =>
                        handleDownloadImproved(
                          "docx"
                        )
                      }
                      disabled={
                        improvedDownloading !==
                        null
                      }
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#DCE2E9] text-[#14213D] text-sm font-semibold disabled:opacity-50"
                    >
                      <Icon
                        name="download"
                        size={16}
                      />

                      {improvedDownloading ===
                      "docx"
                        ? "Downloading..."
                        : "Download DOCX"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* =================================================
              GENERATE SECTION
          ================================================= */}

          {activeSection === "generate" && (
            <section className="space-y-6">
              <div className="bg-[#14213D] text-white rounded-3xl p-6 sm:p-8">
                <div className="max-w-3xl">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Icon
                      name="sparkles"
                      size={23}
                    />
                  </div>

                  <h2 className="text-2xl font-bold mt-6">
                    Generate a resume with AI
                  </h2>

                  <p className="text-sm text-white/55 leading-6 mt-2">
                    Create a resume using the information saved in your profile. You can optionally target a specific job.
                  </p>

                  <div className="mt-7 flex flex-col sm:flex-row gap-3">
                    <select
                      value={selectedJobIdForGen}
                      onChange={(e) =>
                        setSelectedJobIdForGen(
                          e.target.value
                        )
                      }
                      className="flex-1 px-4 py-3 rounded-xl bg-white text-[#14213D] text-sm outline-none"
                    >
                      <option value="">
                        General resume
                      </option>

                      {jobs.map((job) => (
                        <option
                          key={job.id}
                          value={job.id}
                        >
                          {job.title} ·{" "}
                          {job.company_name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#14213D] text-sm font-bold disabled:opacity-50"
                    >
                      <Icon
                        name="sparkles"
                        size={17}
                      />

                      {generating
                        ? "Generating..."
                        : "Generate resume"}
                    </button>
                  </div>
                </div>
              </div>

              {/* GENERATING */}

              {generating && (
                <div className="bg-white border border-[#E3E8EF] rounded-3xl p-10 text-center">
                  <div className="w-11 h-11 border-4 border-[#E5EAF0] border-t-[#14213D] rounded-full animate-spin mx-auto" />

                  <p className="mt-4 text-sm font-semibold">
                    Creating your resume...
                  </p>

                  <p className="mt-1 text-xs text-[#94A3B8]">
                    AI is using your saved profile information.
                  </p>
                </div>
              )}

              {/* GENERATED RESUME */}

              {generatedResume && (
                <div className="bg-white border border-[#E3E8EF] rounded-3xl p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-[#94A3B8]">
                        Generated resume
                      </p>

                      <h2 className="text-xl font-bold mt-1">
                        Edit before downloading
                      </h2>
                    </div>

                    {savedEdit && (
                      <span className="text-xs font-semibold text-[#278F82]">
                        Saved ✓
                      </span>
                    )}
                  </div>

                  <textarea
                    value={editedText}
                    onChange={(e) =>
                      setEditedText(
                        e.target.value
                      )
                    }
                    rows={20}
                    className="w-full px-4 py-4 rounded-2xl border border-[#E3E8EF] bg-[#FAFBFC] text-sm font-mono leading-6 text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#14213D]/10 focus:border-[#14213D]"
                  />

                  {/* TEMPLATES */}

                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-wider font-bold text-[#94A3B8] mb-3">
                      Choose template
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(templates).map(
                        ([key, template]) => (
                          <button
                            key={key}
                            onClick={() =>
                              setSelectedTemplate(
                                key
                              )
                            }
                            className={`text-left rounded-xl border p-3 transition-all ${
                              selectedTemplate ===
                              key
                                ? "border-[#14213D] bg-[#F5F7FA]"
                                : "border-[#E3E8EF] hover:border-[#AEB8C5]"
                            }`}
                          >
                            <p className="text-sm font-semibold">
                              {template.label}
                            </p>

                            <p className="text-[11px] text-[#94A3B8] mt-1 leading-4">
                              {template.description}
                            </p>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#14213D] text-[#14213D] text-sm font-semibold hover:bg-[#14213D] hover:text-white disabled:opacity-50"
                    >
                      <Icon
                        name="check"
                        size={16}
                      />

                      {savingEdit
                        ? "Saving..."
                        : "Save changes"}
                    </button>

                    <button
                      onClick={() =>
                        handleDownload("pdf")
                      }
                      disabled={
                        downloading !== null
                      }
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#14213D] text-white text-sm font-semibold disabled:opacity-50"
                    >
                      <Icon
                        name="download"
                        size={16}
                      />

                      {downloading === "pdf"
                        ? "Downloading..."
                        : "Download PDF"}
                    </button>

                    <button
                      onClick={() =>
                        handleDownload("docx")
                      }
                      disabled={
                        downloading !== null
                      }
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#DCE2E9] text-[#14213D] text-sm font-semibold disabled:opacity-50"
                    >
                      <Icon
                        name="download"
                        size={16}
                      />

                      {downloading === "docx"
                        ? "Downloading..."
                        : "Download DOCX"}
                    </button>
                  </div>

                  <p className="text-xs text-[#94A3B8] mt-4">
                    Save your changes before downloading so the exported file contains the latest version.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* FOOTER */}

          <div className="pt-8 pb-4 text-center">
            <p className="text-[11px] text-[#A0AAB7]">
              Placement Prep · Resume AI
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}