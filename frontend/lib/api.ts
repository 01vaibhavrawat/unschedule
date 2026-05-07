const API_URL = "http://localhost:8000";

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",   // always send cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
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
  signup: (data: { name: string; email: string; password: string }) =>
    fetchAPI("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    fetchAPI("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => fetchAPI("/auth/logout", { method: "POST" }),
  me: () => fetchAPI("/auth/me"),
  completeOnboarding: () => fetchAPI("/auth/me/onboarding", { method: "PATCH" }),
};
