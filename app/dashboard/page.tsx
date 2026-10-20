"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getDashboard,
  getMe,
  getToken,
  clearToken,
  DashboardData,
  UserProfile,
} from "@/lib/api";

/* =========================
   ICONS
========================= */

function Icon({
  name,
  size = 20,
}: {
  name:
    | "dashboard"
    | "resume"
    | "interview"
    | "jobs"
    | "aptitude"
    | "profile"
    | "menu"
    | "close"
    | "arrow"
    | "check"
    | "sparkles"
    | "target"
    | "briefcase"
    | "logout"
    | "chevron";
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
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "resume":
      return (
        <svg {...common}>
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h5M9 9h2" />
        </svg>
      );

    case "interview":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M8 19v2M16 19v2M8 10h.01M12 10h.01M16 10h.01" />
          <path d="M8 14c1.2 1 2.4 1.5 4 1.5s2.8-.5 4-1.5" />
        </svg>
      );

    case "jobs":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18M10 12v2h4v-2" />
        </svg>
      );

    case "aptitude":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9a3 3 0 1 1 5 2.2c-1 .7-2 1.2-2 2.8" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c.8-4 3.3-6 8-6s7.2 2 8 6" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3-1.2 4.8L6 9l4.8 1.2L12 15l1.2-4.8L18 9l-4.8-1.2z" />
          <path d="m19 15-.7 2.3L16 18l2.3.7L19 21l.7-2.3L22 18l-2.3-.7z" />
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

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M21 3v18" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================
   SIDEBAR
========================= */

const navigation = [
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
    label: "Mock Interview",
    href: "/interview",
    icon: "interview" as const,
  },
  {
    label: "Job Matching",
    href: "/jobs",
    icon: "jobs" as const,
  },
  {
    label: "Aptitude",
    href: "/aptitude",
    icon: "aptitude" as const,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "profile" as const,
  },
];

/* =========================
   TREND CHART
========================= */

function TrendChart({
  data,
}: {
  data: { date: string; score: number }[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center rounded-2xl bg-[#F8FAFC] border border-dashed border-[#D9E0EA]">
        <div className="text-center px-5">
          <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#94A3B8]">
            <Icon name="target" size={19} />
          </div>
          <p className="text-sm font-medium text-[#475569]">
            No score history yet
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">
            Complete an activity to start tracking your progress.
          </p>
        </div>
      </div>
    );
  }

  const width = 760;
  const height = 220;
  const paddingX = 18;
  const paddingY = 25;

  const minScore = 0;
  const maxScore = 100;

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? width / 2
        : paddingX +
          (index / (data.length - 1)) * (width - paddingX * 2);

    const y =
      height -
      paddingY -
      ((item.score - minScore) / (maxScore - minScore)) *
        (height - paddingY * 2);

    return {
      x,
      y,
      score: item.score,
      date: item.date,
    };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[220px]"
        preserveAspectRatio="none"
      >
        {[0, 25, 50, 75, 100].map((value) => {
          const y =
            height -
            paddingY -
            (value / 100) * (height - paddingY * 2);

          return (
            <g key={value}>
              <line
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                stroke="#E8EDF3"
                strokeWidth="1"
              />
              <text
                x="0"
                y={y + 4}
                fontSize="10"
                fill="#94A3B8"
              >
                {value}
              </text>
            </g>
          );
        })}

        <polyline
          points={polyline}
          fill="none"
          stroke="#14213D"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <g key={`${point.date}-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="white"
              stroke="#14213D"
              strokeWidth="2.5"
            />

            <title>
              {point.date}: {point.score}/100
            </title>
          </g>
        ))}
      </svg>

      <div className="flex justify-between text-[10px] text-[#94A3B8] px-5">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

/* =========================
   FEATURE CARD
========================= */

function FeatureCard({
  href,
  icon,
  title,
  description,
  action,
  value,
}: {
  href: string;
  icon: "resume" | "interview" | "jobs" | "aptitude";
  title: string;
  description: string;
  action: string;
  value?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#C8D1DE] hover:shadow-[0_14px_35px_rgba(20,33,61,0.08)]"
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#F5F7FA] -translate-y-10 translate-x-10 transition-transform duration-300 group-hover:scale-150" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl bg-[#14213D] text-white flex items-center justify-center">
            <Icon name={icon} size={21} />
          </div>

          {value && (
            <span className="text-xs font-semibold text-[#14213D] bg-[#F3F5F8] px-2.5 py-1 rounded-full">
              {value}
            </span>
          )}
        </div>

        <h3 className="mt-5 text-base font-bold text-[#14213D]">
          {title}
        </h3>

        <p className="mt-1.5 text-sm leading-6 text-[#64748B]">
          {description}
        </p>

        <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#14213D]">
          {action}
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* =========================
   MAIN PAGE
========================= */

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeChart, setActiveChart] = useState<"ats" | "interview">(
    "ats"
  );

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
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  const nextStep = useMemo(() => {
    if (!data) return null;

    if (!data.profile_complete) {
      return {
        title: "Complete your profile",
        description:
          "Add your skills, projects and experience to unlock personalized preparation.",
        button: "Complete profile",
        href: "/profile",
      };
    }

    if (data.resumes_uploaded === 0) {
      return {
        title: "Analyze your resume",
        description:
          "Upload your resume and check how well it matches ATS requirements.",
        button: "Analyze resume",
        href: "/resume",
      };
    }

    if (data.interviews_completed === 0) {
      return {
        title: "Take your first mock interview",
        description:
          "Practice interview questions based on your profile and target role.",
        button: "Start interview",
        href: "/interview",
      };
    }

    if (data.companies_checked === 0) {
      return {
        title: "Check your company eligibility",
        description:
          "Explore companies and understand where your current profile fits.",
        button: "Explore jobs",
        href: "/jobs",
      };
    }

    return {
      title: "Keep improving your placement readiness",
      description:
        "Continue practicing interviews, aptitude and job matching.",
      button: "Continue preparation",
      href: "/aptitude",
    };
  }, [data]);

  const profileProgress = useMemo(() => {
    if (!data) return 0;

    const completed = [
      data.skills_count > 0,
      data.projects_count > 0,
      data.certifications_count > 0,
      data.internships_count > 0,
    ].filter(Boolean).length;

    return Math.round((completed / 4) * 100);
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#14213D] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-[#64748B]">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center px-5">
        <div className="bg-white rounded-2xl border border-[#E3E8EF] p-8 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            !
          </div>

          <h2 className="mt-4 text-lg font-bold text-[#14213D]">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-[#64748B]">
            {error}
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-6 px-5 py-2.5 rounded-xl bg-[#14213D] text-white text-sm font-semibold hover:bg-[#1D3157]"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentChart =
    activeChart === "ats"
      ? data.ats_score_trend
      : data.interview_score_trend;

  const currentScore =
    activeChart === "ats"
      ? data.latest_ats_score
      : data.latest_interview_score;

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#14213D]">
      {/* MOBILE HEADER */}

      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#E5EAF0] px-4 h-16 flex items-center justify-between">
        <div>
          <p className="font-bold text-lg tracking-tight">
            Placement Prep
          </p>
          <p className="text-[10px] text-[#94A3B8]">
            Career preparation platform
          </p>
        </div>

        <button
          onClick={() => setMobileMenu(true)}
          className="w-10 h-10 rounded-xl bg-[#F1F4F8] flex items-center justify-center"
        >
          <Icon name="menu" size={21} />
        </button>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}

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
                <p className="font-bold text-xl">Placement Prep</p>
                <p className="text-xs text-white/50 mt-1">
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
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenu(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm ${
                    item.href === "/dashboard"
                      ? "bg-white text-[#14213D] font-semibold"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} size={19} />
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="absolute bottom-6 left-5 right-5 flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Icon name="logout" size={19} />
              Log out
            </button>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[245px] bg-[#14213D] text-white flex-col p-5 z-40">
        <div className="px-2 mb-9">
          <p className="text-xl font-bold tracking-tight">
            Placement Prep
          </p>

          <p className="text-xs text-white/45 mt-1">
            Career preparation platform
          </p>
        </div>

        <nav className="space-y-1.5">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-colors ${
                item.href === "/dashboard"
                  ? "bg-white text-[#14213D] font-semibold"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={item.icon} size={19} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-white/55 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon name="logout" size={19} />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="lg:ml-[245px]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-7 lg:py-9">
          {/* TOP BAR */}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-[#94A3B8]">
                Dashboard
              </p>

              <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back,{" "}
                <span className="text-[#4B5D79]">
                  {user?.name || user?.email || "there"}
                </span>
              </h1>

              <p className="mt-2 text-sm text-[#64748B]">
                Here’s what you can work on today.
              </p>
            </div>

            <Link
              href="/profile"
              className="flex items-center gap-3 bg-white border border-[#E3E8EF] rounded-xl px-3 py-2.5 hover:shadow-sm transition-shadow"
            >
              <div className="w-9 h-9 rounded-full bg-[#14213D] text-white flex items-center justify-center text-sm font-bold">
                {(user?.name || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-[#14213D]">
                  My Profile
                </p>
                <p className="text-[10px] text-[#94A3B8]">
                  View & edit
                </p>
              </div>
            </Link>
          </div>

          {/* NEXT STEP HERO */}

          {nextStep && (
            <section className="relative overflow-hidden rounded-3xl bg-[#14213D] text-white p-6 sm:p-8 mb-8">
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/5" />
              <div className="absolute right-20 -bottom-32 w-72 h-72 rounded-full bg-white/[0.03]" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium text-white/75">
                  <Icon name="sparkles" size={14} />
                  Recommended next step
                </div>

                <h2 className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight">
                  {nextStep.title}
                </h2>

                <p className="mt-3 text-sm sm:text-base leading-7 text-white/65 max-w-2xl">
                  {nextStep.description}
                </p>

                <Link
                  href={nextStep.href}
                  className="inline-flex items-center gap-2 mt-6 bg-white text-[#14213D] px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#F4F6F8] transition-colors"
                >
                  {nextStep.button}
                  <Icon name="arrow" size={17} />
                </Link>
              </div>
            </section>
          )}

          {/* QUICK ACTIONS */}

          <section className="mb-9">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Quick actions
                </p>

                <h2 className="text-xl font-bold mt-1">
                  Prepare for your placement
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <FeatureCard
                href="/resume"
                icon="resume"
                title="Resume AI"
                description="Analyze your resume and improve its ATS compatibility."
                action="Work on resume"
                value={
                  data.latest_ats_score !== null
                    ? `${data.latest_ats_score}/100`
                    : undefined
                }
              />

              <FeatureCard
                href="/interview"
                icon="interview"
                title="Mock Interview"
                description="Practice realistic questions and improve interview performance."
                action="Start interview"
                value={
                  data.latest_interview_score !== null
                    ? `${data.latest_interview_score}/100`
                    : undefined
                }
              />

              <FeatureCard
                href="/jobs"
                icon="jobs"
                title="Job Matching"
                description="Compare your profile against companies and identify skill gaps."
                action="Find opportunities"
                value={
                  data.companies_checked > 0
                    ? `${data.companies_eligible} eligible`
                    : undefined
                }
              />

              <FeatureCard
                href="/aptitude"
                icon="aptitude"
                title="Aptitude"
                description="Practice aptitude questions and strengthen your test performance."
                action="Practice now"
              />
            </div>
          </section>

          {/* PERFORMANCE */}

          <section className="mb-9">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Performance
                </p>

                <h2 className="text-xl font-bold mt-1">
                  Track your progress
                </h2>
              </div>

              <div className="inline-flex bg-[#EDEFF3] rounded-xl p-1 self-start sm:self-auto">
                <button
                  onClick={() => setActiveChart("ats")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeChart === "ats"
                      ? "bg-white text-[#14213D] shadow-sm"
                      : "text-[#64748B]"
                  }`}
                >
                  ATS Score
                </button>

                <button
                  onClick={() => setActiveChart("interview")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeChart === "interview"
                      ? "bg-white text-[#14213D] shadow-sm"
                      : "text-[#64748B]"
                  }`}
                >
                  Interview
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-sm font-semibold text-[#475569]">
                    {activeChart === "ats"
                      ? "ATS score history"
                      : "Interview score history"}
                  </p>

                  <p className="text-xs text-[#94A3B8] mt-1">
                    Based on your completed activities
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-[#14213D]">
                    {currentScore !== null
                      ? `${currentScore}`
                      : "—"}
                  </p>

                  <p className="text-[10px] text-[#94A3B8]">
                    latest score / 100
                  </p>
                </div>
              </div>

              <TrendChart data={currentChart} />
            </div>
          </section>

          {/* COMPANY ELIGIBILITY */}

          <section className="mb-9">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Opportunities
                </p>

                <h2 className="text-xl font-bold mt-1">
                  Company eligibility
                </h2>
              </div>

              <Link
                href="/jobs"
                className="text-xs font-semibold text-[#14213D] hover:underline"
              >
                View jobs →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-[#F1F4F8] flex items-center justify-center text-[#14213D]">
                  <Icon name="briefcase" size={19} />
                </div>

                <p className="mt-5 text-xs text-[#94A3B8]">
                  Companies checked
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {data.companies_checked}
                </p>
              </div>

              <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-[#F1F4F8] flex items-center justify-center text-[#14213D]">
                  <Icon name="check" size={19} />
                </div>

                <p className="mt-5 text-xs text-[#94A3B8]">
                  Companies eligible
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {data.companies_eligible}
                </p>
              </div>

              <div className="bg-[#14213D] text-white rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon name="target" size={19} />
                </div>

                <p className="mt-5 text-xs text-white/50">
                  Eligibility ratio
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {data.companies_checked > 0
                    ? `${Math.round(
                        (data.companies_eligible /
                          data.companies_checked) *
                          100
                      )}%`
                    : "—"}
                </p>
              </div>
            </div>
          </section>

          {/* PREPARATION PROGRESS - LAST */}

          <section className="pb-8">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Preparation progress
              </p>

              <h2 className="text-xl font-bold mt-1">
                Build a stronger profile
              </h2>
            </div>

            <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 sm:p-7">
              <div className="flex flex-col lg:flex-row lg:items-center gap-7">
                {/* PROGRESS CIRCLE */}

                <div className="flex items-center gap-5">
                  <div
                    className="relative w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(#14213D ${profileProgress}%, #E8EDF3 ${profileProgress}% 100%)`,
                    }}
                  >
                    <div className="w-[76px] h-[76px] rounded-full bg-white flex items-center justify-center">
                      <span className="text-xl font-bold">
                        {profileProgress}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Profile progress
                    </p>

                    <p className="text-xs text-[#94A3B8] mt-1 max-w-[220px]">
                      Add more information to make your profile more complete.
                    </p>
                  </div>
                </div>

                {/* STATS */}

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-[#F7F9FB] p-4">
                    <p className="text-[11px] text-[#94A3B8]">
                      Skills
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {data.skills_count}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F7F9FB] p-4">
                    <p className="text-[11px] text-[#94A3B8]">
                      Projects
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {data.projects_count}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F7F9FB] p-4">
                    <p className="text-[11px] text-[#94A3B8]">
                      Certifications
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {data.certifications_count}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F7F9FB] p-4">
                    <p className="text-[11px] text-[#94A3B8]">
                      Internships
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {data.internships_count}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#14213D] text-white text-sm font-semibold hover:bg-[#1D3157] transition-colors"
                >
                  Update profile
                  <Icon name="arrow" size={16} />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}