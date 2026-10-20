"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getToken,
  getMe,
  updateProfile,
  UserProfile,
} from "@/lib/api";

interface Project {
  title: string;
  description: string;
  tech_stack: string[];
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
}

interface Internship {
  role: string;
  company: string;
  duration: string;
  description: string;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "▦" },
  { label: "Resume AI", href: "/resume", icon: "▤" },
  { label: "Job Matching", href: "/jobs", icon: "⌕" },
  { label: "Mock Interview", href: "/interview", icon: "◉" },
  { label: "Aptitude", href: "/aptitude", icon: "✓" },
  { label: "Profile", href: "/profile", icon: "○" },
];

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#495057]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#14213D] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
      />
    </div>
  );
}

function SkillInput({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addSkill() {
    const value = input.trim();

    if (!value) return;

    if (!skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      onChange([...skills, value]);
    }

    setInput("");
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((item) => item !== skill));
  }

  return (
    <div>
      {skills.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-2 rounded-full bg-[#EEF2F7] px-3 py-1.5 text-xs font-medium text-[#14213D]"
            >
              {skill}

              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="font-bold text-[#9CA3AF] hover:text-[#E63946]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Type a skill and press Enter"
          className="min-w-0 flex-1 rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#14213D] outline-none placeholder:text-[#9CA3AF] focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
        />

        <button
          type="button"
          onClick={addSkill}
          className="rounded-xl border border-[#14213D] px-4 py-2.5 text-sm font-semibold text-[#14213D] transition hover:bg-[#14213D] hover:text-white"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">
          {eyebrow}
        </p>

        <h2
          className="mt-1 text-lg font-bold text-[#14213D]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#6B7280]">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [name, setName] = useState("");
  const [careerInterest, setCareerInterest] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [cgpa, setCgpa] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [achievementInput, setAchievementInput] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const data: UserProfile = await getMe();

        setName(data.name || "");
        setCareerInterest(data.career_interest || "");
        setPhone(data.phone || "");
        setLinkedinUrl(data.linkedin_url || "");
        setGithubUrl(data.github_url || "");

        setBranch(data.branch || "");
        setGraduationYear(
          data.graduation_year
            ? String(data.graduation_year)
            : ""
        );

        setCgpa(
          data.cgpa !== null && data.cgpa !== undefined
            ? String(data.cgpa)
            : ""
        );

        setSkills(data.skills || []);
        setAchievements(data.achievements || []);

        setProjects(
          (data.projects || []).map((project) => ({
            title: project.title,
            description: project.description,
            tech_stack: project.tech_stack || [],
          }))
        );

        setCertifications(
          (data.certifications || []).map((certification) => ({
            name: certification.name,
            issuer: certification.issuer || "",
            year: certification.year
              ? String(certification.year)
              : "",
          }))
        );

        setInternships(
          (data.internships || []).map((internship) => ({
            role: internship.role,
            company: internship.company,
            duration: internship.duration || "",
            description: internship.description || "",
          }))
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function addAchievement() {
    const value = achievementInput.trim();

    if (!value) return;

    setAchievements([...achievements, value]);
    setAchievementInput("");
  }

  function removeAchievement(index: number) {
    setAchievements(
      achievements.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function addProject() {
    setProjects([
      ...projects,
      {
        title: "",
        description: "",
        tech_stack: [],
      },
    ]);
  }

  function updateProject(
    index: number,
    field: keyof Project,
    value: string | string[]
  ) {
    const updated = [...projects];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setProjects(updated);
  }

  function removeProject(index: number) {
    setProjects(
      projects.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function addCertification() {
    setCertifications([
      ...certifications,
      {
        name: "",
        issuer: "",
        year: "",
      },
    ]);
  }

  function updateCertification(
    index: number,
    field: keyof Certification,
    value: string
  ) {
    const updated = [...certifications];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setCertifications(updated);
  }

  function removeCertification(index: number) {
    setCertifications(
      certifications.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function addInternship() {
    setInternships([
      ...internships,
      {
        role: "",
        company: "",
        duration: "",
        description: "",
      },
    ]);
  }

  function updateInternship(
    index: number,
    field: keyof Internship,
    value: string
  ) {
    const updated = [...internships];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setInternships(updated);
  }

  function removeInternship(index: number) {
    setInternships(
      internships.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSaved(false);

      await updateProfile({
        name,
        skills,
        achievements,
        career_interest: careerInterest,
        phone,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        branch,
        graduation_year: graduationYear
          ? parseInt(graduationYear, 10)
          : undefined,
        cgpa: cgpa ? parseFloat(cgpa) : undefined,

        projects: projects
          .filter((project) => project.title.trim())
          .map((project) => ({
            title: project.title,
            description: project.description,
            tech_stack: project.tech_stack,
          })),

        certifications: certifications
          .filter((certification) => certification.name.trim())
          .map((certification) => ({
            name: certification.name,
            issuer: certification.issuer || null,
            year: certification.year
              ? parseInt(certification.year, 10)
              : null,
          })),

        internships: internships
          .filter((internship) => internship.role.trim())
          .map((internship) => ({
            role: internship.role,
            company: internship.company,
            duration: internship.duration || null,
            description: internship.description || null,
          })),
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  }

  const completionItems = [
    Boolean(name.trim()),
    Boolean(phone.trim()),
    Boolean(branch.trim()),
    Boolean(graduationYear.trim()),
    Boolean(cgpa.trim()),
    Boolean(careerInterest.trim()),
    skills.length > 0,
    projects.length > 0,
    certifications.length > 0,
    internships.length > 0,
    achievements.length > 0,
  ];

  const completedItems = completionItems.filter(Boolean).length;

  const completionPercentage = Math.round(
    (completedItems / completionItems.length) * 100
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FB]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-xl bg-[#14213D]" />

          <p className="text-sm font-medium text-[#6B7280]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
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
              const active = item.href === "/profile";

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

                  <span className="font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-5">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs font-semibold text-white">
              Profile completion
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#FFB703] transition-all"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>

            <p className="mt-2 text-[11px] text-white/45">
              {completionPercentage}% completed
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
                const active = item.href === "/profile";

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

      {/* Main */}
      <main className="lg:ml-[250px]">
        <div className="mx-auto max-w-[1250px] px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-xs text-[#6B7280]">
              <Link
                href="/dashboard"
                className="hover:text-[#14213D]"
              >
                Dashboard
              </Link>

              <span>›</span>

              <span className="text-[#14213D]">Profile</span>
            </div>

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h1
                  className="text-3xl font-bold tracking-tight sm:text-4xl"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Your Profile
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                  Keep your profile updated so Resume AI, Job Matching,
                  and Interview Preparation can use your latest
                  information.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {saved && (
                  <span className="text-sm font-semibold text-[#2A9D8F]">
                    Saved ✓
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-[#14213D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3157] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </div>
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

          {/* Completion */}
          <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">
                  Profile strength
                </p>

                <h2
                  className="mt-1 text-lg font-bold"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {completionPercentage}% complete
                </h2>

                <p className="mt-1 text-xs text-[#6B7280]">
                  Complete more sections to give your placement tools
                  more information.
                </p>
              </div>

              <div className="w-full md:w-[320px]">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-[#6B7280]">
                    {completedItems} of {completionItems.length} sections
                  </span>

                  <span className="font-semibold text-[#14213D]">
                    {completionPercentage}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F7]">
                  <div
                    className="h-full rounded-full bg-[#14213D] transition-all"
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            {/* Personal */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="01 · Personal"
                title="Basic information"
                description="Your name and career target used throughout the placement platform."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Full name"
                  value={name}
                  onChange={setName}
                  placeholder="Your full name"
                />

                <InputField
                  label="Career interest"
                  value={careerInterest}
                  onChange={setCareerInterest}
                  placeholder="e.g. Machine Learning Engineer"
                />
              </div>
            </section>

            {/* Contact */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="02 · Contact"
                title="Contact information"
                description="These details can be included in your generated resume."
              />

              <div className="grid gap-4 md:grid-cols-3">
                <InputField
                  label="Phone number"
                  value={phone}
                  onChange={setPhone}
                  placeholder="Your phone number"
                />

                <InputField
                  label="LinkedIn URL"
                  value={linkedinUrl}
                  onChange={setLinkedinUrl}
                  placeholder="https://linkedin.com/in/..."
                />

                <InputField
                  label="GitHub URL"
                  value={githubUrl}
                  onChange={setGithubUrl}
                  placeholder="https://github.com/..."
                />
              </div>
            </section>

            {/* Education */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="03 · Education"
                title="Academic information"
                description="Education information used by Resume AI when generating your resume."
              />

              <div className="grid gap-4 md:grid-cols-3">
                <InputField
                  label="Branch"
                  value={branch}
                  onChange={setBranch}
                  placeholder="e.g. CSE, AIML"
                />

                <InputField
                  label="Graduation year"
                  value={graduationYear}
                  onChange={setGraduationYear}
                  placeholder="e.g. 2027"
                />

                <InputField
                  label="CGPA"
                  value={cgpa}
                  onChange={setCgpa}
                  placeholder="e.g. 8.25"
                />
              </div>
            </section>

            {/* Skills */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="04 · Skills"
                title="Technical skills"
                description="Add the technologies, programming languages, frameworks, and tools you know."
              />

              <SkillInput
                skills={skills}
                onChange={setSkills}
              />
            </section>

            {/* Achievements */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="05 · Achievements"
                title="Achievements & recognition"
                description="Add hackathons, competition results, scholarships, awards, or other notable achievements."
              />

              {achievements.length > 0 && (
                <div className="mb-4 space-y-2">
                  {achievements.map((achievement, index) => (
                    <div
                      key={`${achievement}-${index}`}
                      className="flex items-start justify-between gap-3 rounded-xl bg-[#F6F8FB] px-4 py-3"
                    >
                      <div className="flex gap-3">
                        <span className="mt-0.5 text-[#FFB703]">
                          ◆
                        </span>

                        <p className="text-sm leading-6 text-[#14213D]">
                          {achievement}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        className="shrink-0 text-xs font-medium text-[#E63946] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={achievementInput}
                  onChange={(e) =>
                    setAchievementInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAchievement();
                    }
                  }}
                  placeholder="e.g. Won 1st place at XYZ Hackathon"
                  className="min-w-0 flex-1 rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#14213D] outline-none placeholder:text-[#9CA3AF] focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
                />

                <button
                  type="button"
                  onClick={addAchievement}
                  className="rounded-xl border border-[#14213D] px-4 py-2.5 text-sm font-semibold text-[#14213D] hover:bg-[#14213D] hover:text-white"
                >
                  Add
                </button>
              </div>
            </section>

            {/* Projects */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="06 · Projects"
                title="Projects"
                description="Showcase projects that demonstrate your technical and problem-solving skills."
                action={
                  <button
                    type="button"
                    onClick={addProject}
                    className="rounded-xl border border-[#14213D] px-3.5 py-2 text-xs font-semibold text-[#14213D] transition hover:bg-[#14213D] hover:text-white"
                  >
                    + Add project
                  </button>
                }
              />

              {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D1D5DB] px-5 py-8 text-center">
                  <p className="text-sm font-medium text-[#495057]">
                    No projects added yet
                  </p>

                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    Add your academic, personal, or internship projects.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] p-4"
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) =>
                            updateProject(
                              index,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Project title"
                          className="min-w-0 flex-1 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm font-medium text-[#14213D] outline-none placeholder:text-[#9CA3AF] focus:border-[#14213D]"
                        />

                        <button
                          type="button"
                          onClick={() => removeProject(index)}
                          className="rounded-lg px-2 py-2 text-xs font-medium text-[#E63946] hover:bg-[#FDECEE]"
                        >
                          Remove
                        </button>
                      </div>

                      <textarea
                        value={project.description}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="What did you build and what was the impact?"
                        rows={3}
                        className="mb-3 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#14213D] outline-none placeholder:text-[#9CA3AF] focus:border-[#14213D]"
                      />

                      <InputField
                        label="Technology stack"
                        value={project.tech_stack.join(", ")}
                        onChange={(value) =>
                          updateProject(
                            index,
                            "tech_stack",
                            value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean)
                          )
                        }
                        placeholder="Python, FastAPI, Next.js, SQLite"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Certifications */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="07 · Certifications"
                title="Certifications"
                description="Add relevant certifications and courses."
                action={
                  <button
                    type="button"
                    onClick={addCertification}
                    className="rounded-xl border border-[#14213D] px-3.5 py-2 text-xs font-semibold text-[#14213D] transition hover:bg-[#14213D] hover:text-white"
                  >
                    + Add certification
                  </button>
                }
              />

              {certifications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D1D5DB] px-5 py-8 text-center">
                  <p className="text-sm font-medium text-[#495057]">
                    No certifications added yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certifications.map((certification, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] p-4"
                    >
                      <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_120px_auto]">
                        <InputField
                          label="Certification"
                          value={certification.name}
                          onChange={(value) =>
                            updateCertification(
                              index,
                              "name",
                              value
                            )
                          }
                          placeholder="Certification name"
                        />

                        <InputField
                          label="Issuer"
                          value={certification.issuer}
                          onChange={(value) =>
                            updateCertification(
                              index,
                              "issuer",
                              value
                            )
                          }
                          placeholder="Issuer"
                        />

                        <InputField
                          label="Year"
                          value={certification.year}
                          onChange={(value) =>
                            updateCertification(
                              index,
                              "year",
                              value
                            )
                          }
                          placeholder="2026"
                        />

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() =>
                              removeCertification(index)
                            }
                            className="mb-0.5 rounded-lg px-2 py-2 text-xs font-medium text-[#E63946] hover:bg-[#FDECEE]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Internships */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="08 · Experience"
                title="Internships"
                description="Add internships and practical experience relevant to your career."
                action={
                  <button
                    type="button"
                    onClick={addInternship}
                    className="rounded-xl border border-[#14213D] px-3.5 py-2 text-xs font-semibold text-[#14213D] transition hover:bg-[#14213D] hover:text-white"
                  >
                    + Add internship
                  </button>
                }
              />

              {internships.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D1D5DB] px-5 py-8 text-center">
                  <p className="text-sm font-medium text-[#495057]">
                    No internships added yet
                  </p>

                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    Add your internship experience when available.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {internships.map((internship, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] p-4"
                    >
                      <div className="mb-3 grid gap-3 md:grid-cols-2">
                        <InputField
                          label="Role"
                          value={internship.role}
                          onChange={(value) =>
                            updateInternship(
                              index,
                              "role",
                              value
                            )
                          }
                          placeholder="Machine Learning Intern"
                        />

                        <InputField
                          label="Company"
                          value={internship.company}
                          onChange={(value) =>
                            updateInternship(
                              index,
                              "company",
                              value
                            )
                          }
                          placeholder="Company name"
                        />
                      </div>

                      <div className="mb-3">
                        <InputField
                          label="Duration"
                          value={internship.duration}
                          onChange={(value) =>
                            updateInternship(
                              index,
                              "duration",
                              value
                            )
                          }
                          placeholder="e.g. 2 months"
                        />
                      </div>

                      <label className="mb-1.5 block text-xs font-semibold text-[#495057]">
                        Description
                      </label>

                      <textarea
                        value={internship.description}
                        onChange={(e) =>
                          updateInternship(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="What did you work on?"
                        rows={3}
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#14213D] outline-none placeholder:text-[#9CA3AF] focus:border-[#14213D]"
                      />

                      <button
                        type="button"
                        onClick={() => removeInternship(index)}
                        className="mt-3 rounded-lg px-2 py-1.5 text-xs font-medium text-[#E63946] hover:bg-[#FDECEE]"
                      >
                        Remove internship
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Bottom Save */}
            <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-white/95 p-4 shadow-lg backdrop-blur">
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#14213D]">
                  Keep your profile updated
                </p>

                <p className="text-xs text-[#6B7280]">
                  Your information is used by the placement tools.
                </p>
              </div>

              <div className="ml-auto flex items-center gap-3">
                {saved && (
                  <span className="text-sm font-semibold text-[#2A9D8F]">
                    Profile saved ✓
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-[#14213D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1E3157] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}