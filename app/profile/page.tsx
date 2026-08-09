"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getMe, updateProfile, UserProfile } from "@/lib/api";

interface Project {
  title: string;
  description: string;
  tech_stack: string[];
}

interface Certification {
  name: string;
  issuer: string;
  year: string; // kept as string in the form, converted to number on save
}

interface Internship {
  role: string;
  company: string;
  duration: string;
  description: string;
}

function SkillTagInput({ skills, onChange }: { skills: string[]; onChange: (skills: string[]) => void }) {
  const [input, setInput] = useState("");

  function addSkill() {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((s) => s !== skill));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#F1F3F5] text-[#14213D]"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="text-[#6B7280] hover:text-[#E63946] font-bold"
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
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
          className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
        />
        <button
          type="button"
          onClick={addSkill}
          className="px-3 py-2 text-sm font-medium text-[#14213D] border border-[#14213D] rounded-lg hover:bg-[#14213D] hover:text-white transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [skills, setSkills] = useState<string[]>([]);
  const [careerInterest, setCareerInterest] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    getMe()
      .then((data: UserProfile) => {
        setSkills(data.skills || []);
        setCareerInterest(data.career_interest || "");
        setProjects(
          (data.projects || []).map((p) => ({
            title: p.title,
            description: p.description,
            tech_stack: p.tech_stack || [],
          }))
        );
        setCertifications(
          (data.certifications || []).map((c) => ({
            name: c.name,
            issuer: c.issuer || "",
            year: c.year ? String(c.year) : "",
          }))
        );
        setInternships(
          (data.internships || []).map((i) => ({
            role: i.role,
            company: i.company,
            duration: i.duration || "",
            description: i.description || "",
          }))
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [router]);

  function addProject() {
    setProjects([...projects, { title: "", description: "", tech_stack: [] }]);
  }
  function updateProject(index: number, field: keyof Project, value: string | string[]) {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  }
  function removeProject(index: number) {
    setProjects(projects.filter((_, i) => i !== index));
  }

  function addCertification() {
    setCertifications([...certifications, { name: "", issuer: "", year: "" }]);
  }
  function updateCertification(index: number, field: keyof Certification, value: string) {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  }
  function removeCertification(index: number) {
    setCertifications(certifications.filter((_, i) => i !== index));
  }

  function addInternship() {
    setInternships([...internships, { role: "", company: "", duration: "", description: "" }]);
  }
  function updateInternship(index: number, field: keyof Internship, value: string) {
    const updated = [...internships];
    updated[index] = { ...updated[index], [field]: value };
    setInternships(updated);
  }
  function removeInternship(index: number) {
    setInternships(internships.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await updateProfile({
        skills,
        career_interest: careerInterest,
        projects: projects
          .filter((p) => p.title.trim())
          .map((p) => ({ title: p.title, description: p.description, tech_stack: p.tech_stack })),
        certifications: certifications
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name,
            issuer: c.issuer || null,
            year: c.year ? parseInt(c.year, 10) : null,
          })),
        internships: internships
          .filter((i) => i.role.trim())
          .map((i) => ({
            role: i.role,
            company: i.company,
            duration: i.duration || null,
            description: i.description || null,
          })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-[#6B7280] text-sm">Loading your profile...</p>
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
          Edit Profile
        </p>
        <div className="w-20" />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <p className="text-sm text-[#E63946] bg-[#FEE2E2] px-3 py-2 rounded-lg" role="alert">
            {error}
          </p>
        )}

        {/* Career interest */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h2 className="text-sm font-semibold text-[#14213D] mb-3">Career interest</h2>
          <input
            type="text"
            value={careerInterest}
            onChange={(e) => setCareerInterest(e.target.value)}
            placeholder="e.g. Machine Learning Engineer"
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
          />
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h2 className="text-sm font-semibold text-[#14213D] mb-3">Skills</h2>
          <SkillTagInput skills={skills} onChange={setSkills} />
        </div>

        {/* Projects */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#14213D]">Projects</h2>
            <button
              type="button"
              onClick={addProject}
              className="text-xs font-medium text-[#14213D] border border-[#14213D] px-3 py-1.5 rounded-lg hover:bg-[#14213D] hover:text-white transition-colors"
            >
              + Add project
            </button>
          </div>
          <div className="space-y-4">
            {projects.map((project, i) => (
              <div key={i} className="border border-[#E5E7EB] rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProject(i, "title", e.target.value)}
                    placeholder="Project title"
                    className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                  />
                  <button
                    type="button"
                    onClick={() => removeProject(i)}
                    className="text-xs text-[#E63946] px-2 py-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={project.description}
                  onChange={(e) => updateProject(i, "description", e.target.value)}
                  placeholder="What did you build and what was the impact?"
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                />
                <input
                  type="text"
                  value={project.tech_stack.join(", ")}
                  onChange={(e) =>
                    updateProject(
                      i,
                      "tech_stack",
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder="Tech stack, comma-separated (e.g. Python, Flask, SQLite)"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                />
              </div>
            ))}
            {projects.length === 0 && <p className="text-sm text-[#6B7280]">No projects added yet.</p>}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#14213D]">Certifications</h2>
            <button
              type="button"
              onClick={addCertification}
              className="text-xs font-medium text-[#14213D] border border-[#14213D] px-3 py-1.5 rounded-lg hover:bg-[#14213D] hover:text-white transition-colors"
            >
              + Add certification
            </button>
          </div>
          <div className="space-y-3">
            {certifications.map((cert, i) => (
              <div key={i} className="border border-[#E5E7EB] rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(i, "name", e.target.value)}
                  placeholder="Certification name"
                  className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                />
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(i, "issuer", e.target.value)}
                  placeholder="Issuer"
                  className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cert.year}
                    onChange={(e) => updateCertification(i, "year", e.target.value)}
                    placeholder="Year"
                    className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                  />
                  <button
                    type="button"
                    onClick={() => removeCertification(i)}
                    className="text-xs text-[#E63946] px-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {certifications.length === 0 && <p className="text-sm text-[#6B7280]">No certifications added yet.</p>}
          </div>
        </div>

        {/* Internships */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#14213D]">Internships</h2>
            <button
              type="button"
              onClick={addInternship}
              className="text-xs font-medium text-[#14213D] border border-[#14213D] px-3 py-1.5 rounded-lg hover:bg-[#14213D] hover:text-white transition-colors"
            >
              + Add internship
            </button>
          </div>
          <div className="space-y-4">
            {internships.map((intern, i) => (
              <div key={i} className="border border-[#E5E7EB] rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={intern.role}
                    onChange={(e) => updateInternship(i, "role", e.target.value)}
                    placeholder="Role"
                    className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                  />
                  <input
                    type="text"
                    value={intern.company}
                    onChange={(e) => updateInternship(i, "company", e.target.value)}
                    placeholder="Company"
                    className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                  />
                </div>
                <input
                  type="text"
                  value={intern.duration}
                  onChange={(e) => updateInternship(i, "duration", e.target.value)}
                  placeholder="Duration (e.g. 2 months, Summer 2025)"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                />
                <textarea
                  value={intern.description}
                  onChange={(e) => updateInternship(i, "description", e.target.value)}
                  placeholder="What did you work on?"
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#14213D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14213D]"
                />
                <button
                  type="button"
                  onClick={() => removeInternship(i)}
                  className="text-xs text-[#E63946] hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            {internships.length === 0 && <p className="text-sm text-[#6B7280]">No internships added yet.</p>}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#14213D] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#1F2E52] transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
          {saved && <span className="text-sm text-[#2A9D8F] font-medium">Saved ✓</span>}
        </div>
      </main>
    </div>
  );
}