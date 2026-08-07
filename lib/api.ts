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

export async function getDashboard(): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}
