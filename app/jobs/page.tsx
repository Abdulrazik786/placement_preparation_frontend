"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, listJobs, createJob, getSkillGap, JobPosting, SkillGap } from "@/lib/api";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [loading, setLoading] = useState(true);
  const [gapLoading, setGapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add-your-own-job form state
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
    listJobs()
      .then(setJobs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load jobs"))
      .finally(() => setLoading(false));
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
      setError(err instanceof Error ? err.message : "Failed to load skill gap");
    } finally {
      setGapLoading(false);
    }
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim() || !newDescription.trim()) return;

    setError(null);
    setAdding(true);
    try {
      // AI auto-extracts role, required skills, and experience summary from the description alone
      const created = await createJob(newTitle.trim(), newCompany.trim(), newDescription.trim());
      setJobs((prev) => [created, ...prev]);
      setNewTitle("");
      setNewCompany("");
      setNewDescription("");
      setShowAddForm(false);
      await handleSelectJob(created); // jump straight to its skill-gap analysis
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add job");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-[#6B7280] text-sm">Loading jobs...</p>
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
          Job Listings
        </p>
        <div className="w-20" />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#6B7280]">
            Paste any job description to check your skill gap against it — no need to wait for your TPO to add it.
          </p>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="text-sm font-medium text-white bg-[#14213D] px-4 py-2 rounded-lg hover:bg-[#1F2E52] transition-colors whitespace-nowrap"
          >
            {showAddForm ? "Cancel" : "+ Add a job"}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddJob} className="bg-white rounded-xl border border-[#E5E7EB] p-5 mb-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Job title (e.g. Machine Learning Engineer)"
                className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
              />
              <input
                type="text"
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder="Company name"
                className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
              />
            </div>
            <textarea
              required
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={6}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
            />
            <button
              type="submit"
              disabled={adding}
              className="text-sm font-medium text-white bg-[#FFB703] px-4 py-2 rounded-lg hover:bg-[#FFC933] transition-colors disabled:opacity-60"
            >
              {adding ? "Adding & analyzing..." : "Add job and check skill gap"}
            </button>
          </form>
        )}

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-[#D1D5DB] p-8 text-center">
            <p className="text-sm text-[#6B7280]">
              No job postings yet. Click &quot;+ Add a job&quot; above to paste one in.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Job list */}
            <div className="md:col-span-2 space-y-3">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`w-full text-left bg-white rounded-xl border p-4 transition-colors ${
                    selectedJob?.id === job.id
                      ? "border-[#14213D] ring-1 ring-[#14213D]"
                      : "border-[#E5E7EB] hover:border-[#14213D]"
                  }`}
                >
                  <p className="text-sm font-semibold text-[#14213D]">{job.title}</p>
                  <p className="text-xs text-[#6B7280] mb-2">{job.company_name}</p>
                  {job.role && (
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#F1F3F5] text-[#495057]">
                      {job.role}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Detail + skill gap */}
            <div className="md:col-span-3">
              {!selectedJob && (
                <div className="bg-white rounded-xl border border-dashed border-[#D1D5DB] p-8 text-center h-full flex items-center justify-center">
                  <p className="text-sm text-[#6B7280]">Select a job to see your skill-gap analysis</p>
                </div>
              )}

              {selectedJob && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                    <h2 className="text-base font-semibold text-[#14213D]">{selectedJob.title}</h2>
                    <p className="text-sm text-[#6B7280] mb-3">{selectedJob.company_name}</p>
                    {selectedJob.experience_summary && (
                      <p className="text-xs text-[#6B7280] mb-3">{selectedJob.experience_summary}</p>
                    )}
                    <p className="text-sm text-[#14213D] leading-relaxed">{selectedJob.description}</p>
                  </div>

                  {error && (
                    <p className="text-sm text-[#E63946] bg-[#FEE2E2] px-3 py-2 rounded-lg" role="alert">
                      {error}
                    </p>
                  )}

                  {gapLoading && (
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 text-center">
                      <p className="text-sm text-[#6B7280]">Analyzing your skill gap...</p>
                    </div>
                  )}

                  {skillGap && !gapLoading && (
                    <>
                      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                        <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                          Skills you already have
                        </h3>
                        {skillGap.matching_skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {skillGap.matching_skills.map((s, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#E7F5F3] text-[#2A9D8F]">
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[#6B7280]">None matched yet — update your profile skills.</p>
                        )}
                      </div>

                      {skillGap.missing_skills.length > 0 && (
                        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                          <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
                            Skills to prepare
                          </h3>
                          <div className="space-y-4">
                            {skillGap.prep_topics.map((topic, i) => (
                              <div key={i} className="border-l-2 border-[#FFB703] pl-4">
                                <p className="text-sm font-semibold text-[#14213D]">{topic.skill}</p>
                                <p className="text-xs text-[#6B7280] mb-2">{topic.why_needed}</p>
                                <ul className="space-y-1">
                                  {topic.key_concepts.map((c, j) => (
                                    <li key={j} className="text-xs text-[#495057] flex items-start gap-1.5">
                                      <span className="text-[#FFB703] mt-0.5">•</span>
                                      {c}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}