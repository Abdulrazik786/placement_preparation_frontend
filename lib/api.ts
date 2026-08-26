// Central place for talking to the FastAPI backend.
// Change this if your backend runs on a different port.
const API_URL = "http://127.0.0.1:8000";

export interface DashboardData {
  skills_count: number;
  projects_count: number;
  certifications_count: number;
  internships_count: number;
  profile_complete: boolean;
  resumes_uploaded: number;
  latest_ats_score: number | null;
  ats_score_trend: { date: string; score: number }[];
  generated_resumes_count: number;
  tailored_resumes_count: number;
  interviews_completed: number;
  interviews_in_progress: number;
  latest_interview_score: number | null;
  interview_score_trend: { date: string; score: number }[];
  companies_checked: number;
  companies_eligible: number;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  branch: string | null;
  graduation_year: number | null;
  cgpa: number | null;
  skills: string[];
  projects: { title: string; description: string; tech_stack: string[] }[];
  certifications: { name: string; issuer: string | null; year: number | null }[];
  internships: { role: string; company: string; duration: string | null; description: string | null }[];
  career_interest: string | null;
  phone: string | null;
  linkedin_url: string | null;
  github_url: string | null;
}

export interface Resume {
  id: number;
  filename: string;
  uploaded_at: string;
  extracted_text: string | null;
}

export interface ResumeAnalysis {
  ats_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_sections: string[];
  keyword_suggestions: string[];
  formatting_issues: string[];
  summary: string;
}

// Stores the JWT in localStorage. Simple approach for now - fine for a college project,
// though a production app would typically use httpOnly cookies instead.
export function saveToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null; // guards against server-side rendering
  return localStorage.getItem("access_token");
}

export function clearToken() {
  localStorage.removeItem("access_token");
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "Something went wrong. Please try again.";
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // response wasn't JSON, keep the default message
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  // FastAPI's OAuth2PasswordRequestForm expects form-encoded data, not JSON
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  return handleResponse(res);
}

export async function signup(email: string, password: string, name: string): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse(res);
}

export async function getMe(): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export interface ProfileUpdate {
  name?: string;
  skills?: string[];
  projects?: { title: string; description: string; tech_stack: string[] }[];
  certifications?: { name: string; issuer: string | null; year: number | null }[];
  internships?: { role: string; company: string; duration: string | null; description: string | null }[];
  career_interest?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  branch?: string;
  graduation_year?: number;
  cgpa?: number;
}

export async function updateProfile(profile: ProfileUpdate): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/me/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(profile),
  });
  return handleResponse(res);
}

export async function getDashboard(): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export interface JobPosting {
  id: number;
  title: string;
  company_name: string;
  description: string;
  role: string | null;
  required_skills: string[];
  experience_summary: string | null;
  created_at: string;
}

export interface SkillPrepTopic {
  skill: string;
  why_needed: string;
  key_concepts: string[];
}

export interface SkillGap {
  job_title: string;
  role: string | null;
  matching_skills: string[];
  missing_skills: string[];
  prep_topics: SkillPrepTopic[];
}

export interface GeneratedResume {
  id: number;
  resume_text: string;
  created_at: string;
}

export interface TailoredResume {
  id: number;
  tailored_text: string;
  changes_summary: string[];
  created_at: string;
}

export interface AptitudeQuestion {
  id: number;
  topic: string;
  difficulty: string;
  question_text: string;
  options: string[];
}

export interface AptitudeAnswerResult {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
}

export async function getAptitudeTopics(): Promise<Record<string, string[]>> {
  const res = await fetch(`${API_URL}/aptitude/topics`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function generateAptitudeQuestion(topic: string, difficulty: string): Promise<AptitudeQuestion> {
  const res = await fetch(`${API_URL}/aptitude/questions/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ topic, difficulty }),
  });
  return handleResponse(res);
}

export async function answerAptitudeQuestion(
  questionId: number,
  selectedAnswer: string
): Promise<AptitudeAnswerResult> {
  const res = await fetch(`${API_URL}/aptitude/questions/${questionId}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ selected_answer: selectedAnswer }),
  });
  return handleResponse(res);
}

export async function generateResume(jobId?: number): Promise<GeneratedResume> {
  const res = await fetch(`${API_URL}/resumes/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ job_id: jobId ?? null }),
  });
  return handleResponse(res);
}

export async function listGeneratedResumes(): Promise<GeneratedResume[]> {
  const res = await fetch(`${API_URL}/resumes/generated`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function updateGeneratedResume(resumeId: number, resumeText: string): Promise<GeneratedResume> {
  const res = await fetch(`${API_URL}/resumes/generated/${resumeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ resume_text: resumeText }),
  });
  return handleResponse(res);
}

export async function updateTailoredResume(tailoredId: number, resumeText: string): Promise<TailoredResume> {
  const res = await fetch(`${API_URL}/tailored-resumes/${tailoredId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ resume_text: resumeText }),
  });
  return handleResponse(res);
}

export async function tailorResume(resumeId: number, jobId: number): Promise<TailoredResume> {
  const res = await fetch(`${API_URL}/resumes/${resumeId}/tailor/${jobId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function listTailoredResumes(): Promise<TailoredResume[]> {
  const res = await fetch(`${API_URL}/tailored-resumes`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

// Downloads a generated or tailored resume as PDF/DOCX. Uses fetch (not a plain <a href>) because
// the export endpoint requires the Authorization header, which a plain link can't send.
export async function downloadResumeExport(
  kind: "generated" | "tailored",
  id: number,
  format: "pdf" | "docx"
): Promise<void> {
  const path = kind === "generated" ? `/resumes/generated/${id}/export` : `/tailored-resumes/${id}/export`;
  const res = await fetch(`${API_URL}${path}?format=${format}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    throw new Error("Download failed. Please try again.");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume_${id}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function uploadResume(file: File): Promise<Resume> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/resumes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type here - the browser sets the correct multipart boundary automatically
    body: formData,
  });
  return handleResponse(res);
}

export async function listResumes(): Promise<Resume[]> {
  const res = await fetch(`${API_URL}/resumes`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function analyzeResume(resumeId: number): Promise<ResumeAnalysis> {
  const res = await fetch(`${API_URL}/resumes/${resumeId}/analyze`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export interface InterviewQuestion {
  session_id: number;
  question_text: string;
  question_type: string;
  status: string;
  interview_type: string;
}

export interface InterviewMessage {
  id: number;
  sender: string;
  content: string;
  question_type: string | null;
  created_at: string;
}

export interface InterviewSession {
  id: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  messages: InterviewMessage[];
}

export interface InterviewQuestionFeedback {
  question: string;
  answer: string;
  mistakes: string[];
  ideal_answer: string;
  feedback: string;
}

export interface InterviewEvaluation {
  overall_score: number;
  technical_score: number;
  resume_score: number;
  project_score: number;
  communication_score: number;
  strong_areas: string[];
  needs_preparation: string[];
  question_feedback: InterviewQuestionFeedback[];
  summary: string;
}

export async function getSuggestedAnswer(sessionId: number): Promise<string> {
  const res = await fetch(`${API_URL}/interviews/${sessionId}/suggested-answer`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await handleResponse<{ suggested_answer: string }>(res);
  return data.suggested_answer;
}

export async function startInterview(
  jobId?: number,
  resumeId?: number,
  interviewType: string = "mixed"
): Promise<InterviewQuestion> {
  const res = await fetch(`${API_URL}/interviews/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ job_id: jobId ?? null, resume_id: resumeId ?? null, interview_type: interviewType }),
  });
  return handleResponse(res);
}

export async function respondToInterview(
  sessionId: number,
  answer: string,
  endInterview = false
): Promise<InterviewQuestion> {
  const res = await fetch(`${API_URL}/interviews/${sessionId}/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ answer, end_interview: endInterview }),
  });
  return handleResponse(res);
}

export async function endInterview(sessionId: number): Promise<InterviewSession> {
  const res = await fetch(`${API_URL}/interviews/${sessionId}/end`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function evaluateInterview(sessionId: number): Promise<InterviewEvaluation> {
  const res = await fetch(`${API_URL}/interviews/${sessionId}/evaluate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function listJobs(): Promise<JobPosting[]> {
  const res = await fetch(`${API_URL}/jobs`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function createJob(title: string, companyName: string, description: string): Promise<JobPosting> {
  const res = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    // required_skills intentionally omitted - the backend auto-extracts role/skills/experience via AI
    body: JSON.stringify({ title, company_name: companyName, description }),
  });
  return handleResponse(res);
}

export async function getSkillGap(jobId: number): Promise<SkillGap> {
  const res = await fetch(`${API_URL}/jobs/${jobId}/skill-gap`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}