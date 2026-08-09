"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDashboard, getMe, getToken, clearToken, DashboardData, UserProfile } from "@/lib/api";

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">{label}</p>
      <p
        className={`text-3xl font-bold ${accent ? "text-[#FFB703]" : "text-[#14213D]"}`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    Promise.all([getDashboard(), getMe()])
      .then(([dashboardData, userData]) => {
        setData(dashboardData);
        setUser(userData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-[#6B7280] text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#E63946] mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-[#14213D] font-medium hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <div>
          <p
            className="text-lg font-bold text-[#14213D]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Placement Prep
          </p>
          {user && <p className="text-xs text-[#6B7280]">Welcome back, {user.name || user.email}</p>}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[#6B7280] hover:text-[#14213D] font-medium"
        >
          Log out
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1
          className="text-2xl font-bold text-[#14213D] mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Your progress
        </h1>
        <p className="text-sm text-[#6B7280] mb-6">
          {data.profile_complete
            ? "Your profile is set up. Here's where things stand."
            : "Complete your profile to unlock personalized prep."}
        </p>

        <div className="flex gap-3 mb-6">
          <Link
            href="/resume"
            className="inline-block bg-[#14213D] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1F2E52] transition-colors"
          >
            Upload &amp; analyze resume →
          </Link>
          <Link
            href="/jobs"
            className="inline-block bg-white text-[#14213D] text-sm font-medium px-4 py-2 rounded-lg border border-[#E5E7EB] hover:border-[#14213D] transition-colors"
          >
            Browse jobs &amp; skill gaps →
          </Link>
          <Link
            href="/profile"
            className="inline-block bg-white text-[#14213D] text-sm font-medium px-4 py-2 rounded-lg border border-[#E5E7EB] hover:border-[#14213D] transition-colors"
          >
            Edit profile →
          </Link>
          <Link
            href="/interview"
            className="inline-block bg-white text-[#14213D] text-sm font-medium px-4 py-2 rounded-lg border border-[#E5E7EB] hover:border-[#14213D] transition-colors"
          >
            Mock interview →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Latest ATS score"
            value={data.latest_ats_score !== null ? `${data.latest_ats_score}/100` : "—"}
            accent
          />
          <StatCard
            label="Latest interview score"
            value={data.latest_interview_score !== null ? `${data.latest_interview_score}/100` : "—"}
            accent
          />
          <StatCard label="Companies eligible" value={`${data.companies_eligible}/${data.companies_checked}`} />
          <StatCard label="Interviews completed" value={data.interviews_completed} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h2 className="text-sm font-semibold text-[#14213D] mb-3">Profile</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Skills listed</dt>
                <dd className="text-[#14213D] font-medium">{data.skills_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Projects listed</dt>
                <dd className="text-[#14213D] font-medium">{data.projects_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Certifications</dt>
                <dd className="text-[#14213D] font-medium">{data.certifications_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Internships</dt>
                <dd className="text-[#14213D] font-medium">{data.internships_count}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h2 className="text-sm font-semibold text-[#14213D] mb-3">Resume activity</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Resumes uploaded</dt>
                <dd className="text-[#14213D] font-medium">{data.resumes_uploaded}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">AI-generated resumes</dt>
                <dd className="text-[#14213D] font-medium">{data.generated_resumes_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Tailored resumes</dt>
                <dd className="text-[#14213D] font-medium">{data.tailored_resumes_count}</dd>
              </div>
            </dl>
          </div>
        </div>

        {data.ats_score_trend.length === 0 && data.interview_score_trend.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center">
            <p className="text-sm text-[#6B7280]">
              No score history yet. Upload a resume for ATS analysis or complete a mock interview to start
              tracking your progress here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}