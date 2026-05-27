// const API_URL = "http://localhost:8000";
// const API_URL = "http://13.53.168.160:8000";
const API_URL = "https://unschedule-backend-latest.onrender.com"

const getAuthToken = () => {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
    if (match) return match[2];
  }
  if (typeof window !== "undefined" && window.localStorage) {
    const token = window.localStorage.getItem("auth_token");
    if (token) return token;
  }
  return null;
};

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "omit",   // no longer rely on cross-site cookies
    headers,
  });
  if (!res.ok) {
    if (res.status === 401 && endpoint !== "/auth/login" && endpoint !== "/auth/signup") {
      if (typeof window !== "undefined") {
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.localStorage.removeItem("auth_token");
        window.location.href = "/login";
      }
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || `API error: ${res.statusText}`);
  }
  return res.json();
};

export const api = {
  // ── Tasks ────────────────────────────────────────────────────
  getTasks: () => fetchAPI("/tasks/"),
  createTask: (data: any) => fetchAPI("/tasks/", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) => fetchAPI(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTask: (id: string) => fetchAPI(`/tasks/${id}`, { method: "DELETE" }),

  // ── Habits ───────────────────────────────────────────────────
  getHabits: () => fetchAPI("/habits/"),
  createHabit: (data: any) => fetchAPI("/habits/", { method: "POST", body: JSON.stringify(data) }),
  deleteHabit: (id: string) => fetchAPI(`/habits/${id}`, { method: "DELETE" }),

  // ── Habit Logs ───────────────────────────────────────────────
  getHabitLogs: (habitId: string) => fetchAPI(`/habit-log/${habitId}`),
  toggleHabitLog: (data: any) => fetchAPI("/habit-log/", { method: "POST", body: JSON.stringify(data) }),

  // ── Goals ────────────────────────────────────────────────────
  getGoals: () => fetchAPI("/goals/"),
  createGoal: (data: any) => fetchAPI("/goals/", { method: "POST", body: JSON.stringify(data) }),
  updateGoal: (id: string, data: any) => fetchAPI(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteGoal: (id: string) => fetchAPI(`/goals/${id}`, { method: "DELETE" }),

  // ── Auth ─────────────────────────────────────────────────────
  signup: async (data: { name: string; email: string; password: string }) => {
    const res = await fetchAPI("/auth/signup", { method: "POST", body: JSON.stringify(data) });
    if (res.access_token) {
      document.cookie = `auth_token=${res.access_token}; path=/; max-age=604800; samesite=lax`;
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("auth_token", res.access_token);
      }
    }
    return res;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await fetchAPI("/auth/login", { method: "POST", body: JSON.stringify(data) });
    if (res.access_token) {
      document.cookie = `auth_token=${res.access_token}; path=/; max-age=604800; samesite=lax`;
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("auth_token", res.access_token);
      }
    }
    return res;
  },
  logout: async () => {
    try {
      await fetchAPI("/auth/logout", { method: "POST" });
    } catch (e) { }
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem("auth_token");
    }
  },
  me: () => fetchAPI("/auth/me"),
  completeOnboarding: () => fetchAPI("/auth/me/onboarding", { method: "PATCH" }),
};
