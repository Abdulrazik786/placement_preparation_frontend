"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getToken,
  listJobs,
  createJob,
  getSkillGap,
  JobPosting,
  SkillGap,
} from "@/lib/api";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "⌂" },
  { label: "Resume AI", href: "/resume", icon: "▣" },
  { label: "Job Matching", href: "/jobs", icon: "⌁" },
  { label: "Mock Interview", href: "/interview", icon: "◉" },
  { label: "Aptitude", href: "/aptitude", icon: "✓" },
  { label: "Profile", href: "/profile", icon: "○" },
];

function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("access_token");
    router.push("/login");
  }

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-[#14213D] text-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFB703] text-lg font-black text-[#14213D]">
              P
            </div>

            <div>
              <p className="text-base font-bold tracking-tight">Placement</p>
              <p className="text-xs text-white/50">Prep AI</p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          {navItems.map((item) => {
            const active = item.href === "/jobs";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-white text-[#14213D] shadow-sm"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${
                    active
                      ? "bg-[#14213D] text-white"
                      : "bg-white/5 text-white/70 group-hover:bg-white/10"
                  }`}
                >
                  {item.icon}
                </span>

                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              ↪
            </span>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <div className="mb-4 h-10 animate-pulse rounded-xl bg-[#F1F3F5]" />

        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl bg-[#F1F3F5]"
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
        <div className="mb-4 h-8 w-1/2 animate-pulse rounded bg-[#F1F3F5]" />
        <div className="mb-8 h-4 w-1/3 animate-pulse rounded bg-[#F1F3F5]" />

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-4 animate-pulse rounded bg-[#F1F3F5]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchOverview({ skillGap }: { skillGap: SkillGap }) {
  const matching = skillGap.matching_skills.length;
  const missing = skillGap.missing_skills.length;
  const total = matching + missing;

  const percentage = total > 0 ? Math.round((matching / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
            Skill match
          </p>
          <h3 className="mt-1 text-lg font-bold text-[#14213D]">
            Your profile vs this job
          </h3>
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-full border-[7px] border-[#E8EDF3]">
          <div className="text-center">
            <p className="text-xl font-bold text-[#14213D]">{percentage}%</p>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-[#6B7280]">
            Matching skills
          </span>
          <span className="font-semibold text-[#2A9D8F]">{matching}</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F4]">
          <div
            className="h-full rounded-full bg-[#2A9D8F] transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#EAF7F4] p-4">
          <p className="text-2xl font-bold text-[#2A9D8F]">{matching}</p>
          <p className="mt-1 text-xs text-[#52706B]">Skills you have</p>
        </div>

        <div className="rounded-xl bg-[#FFF7E3] p-4">
          <p className="text-2xl font-bold text-[#D99400]">{missing}</p>
          <p className="mt-1 text-xs text-[#806B3A]">Skills to prepare</p>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);

  const [loading, setLoading] = useState(true);
  const [gapLoading, setGapLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    async function loadJobs() {
      try {
        setLoading(true);
        const data = await listJobs();
        setJobs(data);

        if (data.length > 0) {
          await handleSelectJob(data[0]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load jobs"
        );
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, [router]);

  async function handleSelectJob(job: JobPosting) {
    setSelectedJob(job);
    setSkillGap(null);
    setError(null);
    setGapLoading(true);

    try {
      const gap = await getSkillGap(job.id);
      setSkillGap(gap);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load skill gap"
      );
    } finally {
      setGapLoading(false);
    }
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();

    if (
      !newTitle.trim() ||
      !newCompany.trim() ||
      !newDescription.trim()
    ) {
      return;
    }

    setError(null);
    setAdding(true);

    try {
      const created = await createJob(
        newTitle.trim(),
        newCompany.trim(),
        newDescription.trim()
      );

      setJobs((prev) => [created, ...prev]);

      setNewTitle("");
      setNewCompany("");
      setNewDescription("");

      setShowAddForm(false);

      await handleSelectJob(created);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add job"
      );
    } finally {
      setAdding(false);
    }
  }

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return jobs;

    return jobs.filter((job) => {
      return (
        job.title.toLowerCase().includes(query) ||
        job.company_name.toLowerCase().includes(query) ||
        job.role?.toLowerCase().includes(query) ||
        job.required_skills.some((skill) =>
          skill.toLowerCase().includes(query)
        )
      );
    });
  }, [jobs, search]);

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#14213D]">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/90 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-[#14213D] lg:hidden"
              >
                ☰
              </button>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
                  Career tools
                </p>

                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Job Matching
                </h1>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="hidden items-center gap-2 rounded-xl bg-[#14213D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1F2E52] sm:flex"
            >
              <span className="text-lg">+</span>
              Add job
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1450px] px-5 py-6 sm:px-8 sm:py-8">
          <section className="mb-7 overflow-hidden rounded-2xl bg-[#14213D] shadow-sm">
            <div className="relative px-6 py-7 sm:px-8 sm:py-8">
              <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#FFB703]/10 blur-2xl" />

              <div className="relative max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                  <span className="h-2 w-2 rounded-full bg-[#FFB703]" />
                  AI-powered job analysis
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Find the skills you need for your next role.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
                  Select a job to compare its requirements with your
                  profile and get a preparation plan for the skills
                  you're missing.
                </p>
              </div>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]"
            >
              <span>{error}</span>

              <button
                onClick={() => setError(null)}
                className="font-semibold"
              >
                ×
              </button>
            </div>
          )}

          {showAddForm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
                  <div>
                    <p className="text-lg font-bold text-[#14213D]">
                      Add a job
                    </p>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      Paste a job description and let AI extract the
                      requirements.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddForm(false)}
                    className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F3F4F6]"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddJob} className="space-y-5 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-[#374151]">
                        Job title
                      </label>

                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Machine Learning Engineer"
                        className="w-full rounded-xl border border-[#DDE2E8] bg-white px-4 py-3 text-sm text-[#14213D] outline-none transition placeholder:text-[#A0A7B2] focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-[#374151]">
                        Company
                      </label>

                      <input
                        type="text"
                        required
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        placeholder="Company name"
                        className="w-full rounded-xl border border-[#DDE2E8] bg-white px-4 py-3 text-sm text-[#14213D] outline-none transition placeholder:text-[#A0A7B2] focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#374151]">
                      Job description
                    </label>

                    <textarea
                      required
                      rows={9}
                      value={newDescription}
                      onChange={(e) =>
                        setNewDescription(e.target.value)
                      }
                      placeholder="Paste the full job description here..."
                      className="w-full resize-y rounded-xl border border-[#DDE2E8] bg-white px-4 py-3 text-sm leading-6 text-[#14213D] outline-none transition placeholder:text-[#A0A7B2] focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
                    />
                  </div>

                  <div className="rounded-xl bg-[#F7F8FA] p-4 text-xs leading-5 text-[#6B7280]">
                    <span className="font-semibold text-[#14213D]">
                      AI extraction:
                    </span>{" "}
                    your backend will automatically extract the role,
                    required skills and experience summary from the
                    description.
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="rounded-xl border border-[#DDE2E8] px-5 py-3 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F7F8FA]"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={adding}
                      className="rounded-xl bg-[#FFB703] px-5 py-3 text-sm font-bold text-[#14213D] transition hover:bg-[#FFC533] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {adding
                        ? "Adding & analyzing..."
                        : "Add job & analyze"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
              <section className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                <div className="mb-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">
                      ⌕
                    </span>

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search jobs, companies or skills..."
                      className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] py-3 pl-9 pr-3 text-sm text-[#14213D] outline-none transition focus:border-[#14213D] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between px-1">
                  <div>
                    <p className="text-sm font-bold text-[#14213D]">
                      Available jobs
                    </p>

                    <p className="text-xs text-[#9CA3AF]">
                      {filteredJobs.length}{" "}
                      {filteredJobs.length === 1 ? "position" : "positions"}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14213D] text-lg text-white transition hover:bg-[#1F2E52] sm:hidden"
                  >
                    +
                  </button>
                </div>

                {jobs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D1D5DB] p-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F3F5] text-xl">
                      ⌁
                    </div>

                    <p className="text-sm font-semibold text-[#14213D]">
                      No jobs yet
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                      Add a job description to start your skill-gap
                      analysis.
                    </p>

                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-4 rounded-lg bg-[#14213D] px-4 py-2 text-xs font-semibold text-white"
                    >
                      Add your first job
                    </button>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="rounded-xl bg-[#F7F8FA] p-6 text-center">
                    <p className="text-sm font-semibold text-[#14213D]">
                      No matching jobs
                    </p>

                    <p className="mt-1 text-xs text-[#6B7280]">
                      Try a different search term.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[650px] space-y-2 overflow-y-auto pr-1">
                    {filteredJobs.map((job) => {
                      const selected = selectedJob?.id === job.id;

                      return (
                        <button
                          key={job.id}
                          onClick={() => handleSelectJob(job)}
                          className={`group w-full rounded-xl border p-4 text-left transition-all ${
                            selected
                              ? "border-[#14213D] bg-[#14213D] shadow-md"
                              : "border-[#E5E7EB] bg-white hover:-translate-y-0.5 hover:border-[#B8C0CC] hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                selected
                                  ? "bg-white/10 text-white"
                                  : "bg-[#EEF1F5] text-[#14213D]"
                              }`}
                            >
                              {job.company_name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate text-sm font-bold ${
                                  selected
                                    ? "text-white"
                                    : "text-[#14213D]"
                                }`}
                              >
                                {job.title}
                              </p>

                              <p
                                className={`mt-1 truncate text-xs ${
                                  selected
                                    ? "text-white/60"
                                    : "text-[#6B7280]"
                                }`}
                              >
                                {job.company_name}
                              </p>

                              <div className="mt-3 flex items-center gap-2">
                                {job.role && (
                                  <span
                                    className={`max-w-[150px] truncate rounded-full px-2 py-1 text-[10px] font-medium ${
                                      selected
                                        ? "bg-white/10 text-white/70"
                                        : "bg-[#F1F3F5] text-[#667085]"
                                    }`}
                                  >
                                    {job.role}
                                  </span>
                                )}

                                {job.required_skills.length > 0 && (
                                  <span
                                    className={`text-[10px] ${
                                      selected
                                        ? "text-white/50"
                                        : "text-[#9CA3AF]"
                                    }`}
                                  >
                                    {job.required_skills.length} skills
                                  </span>
                                )}
                              </div>
                            </div>

                            <span
                              className={`text-sm ${
                                selected
                                  ? "text-white/70"
                                  : "text-[#B0B7C3] group-hover:text-[#14213D]"
                              }`}
                            >
                              →
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="min-w-0">
                {!selectedJob ? (
                  <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-dashed border-[#D1D5DB] bg-white p-8 text-center">
                    <div className="max-w-sm">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF1F5] text-2xl text-[#14213D]">
                        ⌁
                      </div>

                      <h2 className="text-lg font-bold text-[#14213D]">
                        Select a job
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                        Choose a position from the list to see the
                        requirements and your personalized skill-gap
                        analysis.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-7">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#14213D] text-lg font-bold text-white">
                            {selectedJob.company_name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9CA3AF]">
                              Selected position
                            </p>

                            <h2 className="mt-1 break-words text-xl font-bold text-[#14213D] sm:text-2xl">
                              {selectedJob.title}
                            </h2>

                            <p className="mt-1 text-sm font-medium text-[#6B7280]">
                              {selectedJob.company_name}
                            </p>

                            {selectedJob.role && (
                              <span className="mt-3 inline-flex rounded-full bg-[#EEF1F5] px-3 py-1 text-xs font-medium text-[#495057]">
                                {selectedJob.role}
                              </span>
                            )}
                          </div>
                        </div>

                        {selectedJob.experience_summary && (
                          <div className="rounded-xl bg-[#F7F8FA] px-4 py-3 sm:max-w-xs">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                              Experience
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#4B5563]">
                              {selectedJob.experience_summary}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-7 border-t border-[#EEF0F3] pt-6">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                          Job description
                        </p>

                        <p className="whitespace-pre-line text-sm leading-7 text-[#4B5563]">
                          {selectedJob.description}
                        </p>
                      </div>

                      {selectedJob.required_skills.length > 0 && (
                        <div className="mt-6 border-t border-[#EEF0F3] pt-6">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                            Required skills
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {selectedJob.required_skills.map(
                              (skill, index) => (
                                <span
                                  key={`${skill}-${index}`}
                                  className="rounded-full bg-[#F1F3F5] px-3 py-1.5 text-xs font-medium text-[#495057]"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {gapLoading ? (
                      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E8EDF3] border-t-[#14213D]" />

                        <p className="text-sm font-semibold text-[#14213D]">
                          Analyzing your skill gap
                        </p>

                        <p className="mt-1 text-xs text-[#6B7280]">
                          Comparing your profile with this role...
                        </p>
                      </div>
                    ) : skillGap ? (
                      <>
                        <MatchOverview skillGap={skillGap} />

                        <div className="grid gap-5 xl:grid-cols-2">
                          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                                  Profile match
                                </p>

                                <h3 className="mt-1 text-lg font-bold text-[#14213D]">
                                  Skills you already have
                                </h3>
                              </div>

                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF7F4] text-sm font-bold text-[#2A9D8F]">
                                ✓
                              </div>
                            </div>

                            {skillGap.matching_skills.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {skillGap.matching_skills.map(
                                  (skill, index) => (
                                    <span
                                      key={`${skill}-${index}`}
                                      className="rounded-full border border-[#BFE8DF] bg-[#EAF7F4] px-3 py-1.5 text-xs font-medium text-[#277F73]"
                                    >
                                      ✓ {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="rounded-xl bg-[#F7F8FA] p-5 text-center">
                                <p className="text-sm font-medium text-[#14213D]">
                                  No matching skills yet
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[#6B7280]">
                                  Add more skills to your profile to
                                  improve the comparison.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                                  Preparation
                                </p>

                                <h3 className="mt-1 text-lg font-bold text-[#14213D]">
                                  Skills to prepare
                                </h3>
                              </div>

                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF5D9] text-sm font-bold text-[#D99400]">
                                !
                              </div>
                            </div>

                            {skillGap.missing_skills.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {skillGap.missing_skills.map(
                                  (skill, index) => (
                                    <span
                                      key={`${skill}-${index}`}
                                      className="rounded-full border border-[#F5D98C] bg-[#FFF8E6] px-3 py-1.5 text-xs font-medium text-[#956C00]"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="rounded-xl bg-[#EAF7F4] p-5 text-center">
                                <p className="text-sm font-semibold text-[#277F73]">
                                  No missing skills detected
                                </p>

                                <p className="mt-1 text-xs text-[#52706B]">
                                  Your profile matches all detected
                                  requirements.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {skillGap.prep_topics.length > 0 && (
                          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-7">
                            <div className="mb-6">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                                AI preparation plan
                              </p>

                              <h3 className="mt-1 text-xl font-bold text-[#14213D]">
                                What you should learn next
                              </h3>

                              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                                These topics are generated from the
                                detected skill gaps for this specific
                                position.
                              </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              {skillGap.prep_topics.map(
                                (topic, index) => (
                                  <div
                                    key={`${topic.skill}-${index}`}
                                    className="rounded-xl border border-[#E8EBEF] bg-[#FAFBFC] p-5 transition hover:border-[#CDD4DE] hover:bg-white"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#14213D] text-xs font-bold text-white">
                                        {String(index + 1).padStart(
                                          2,
                                          "0"
                                        )}
                                      </div>

                                      <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-[#14213D]">
                                          {topic.skill}
                                        </h4>

                                        <p className="mt-2 text-xs leading-5 text-[#6B7280]">
                                          {topic.why_needed}
                                        </p>
                                      </div>
                                    </div>

                                    {topic.key_concepts.length > 0 && (
                                      <div className="mt-4 border-t border-[#E8EBEF] pt-4">
                                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">
                                          Key concepts
                                        </p>

                                        <ul className="space-y-2">
                                          {topic.key_concepts.map(
                                            (concept, conceptIndex) => (
                                              <li
                                                key={`${concept}-${conceptIndex}`}
                                                className="flex items-start gap-2 text-xs leading-5 text-[#4B5563]"
                                              >
                                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FFB703]" />
                                                <span>{concept}</span>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}