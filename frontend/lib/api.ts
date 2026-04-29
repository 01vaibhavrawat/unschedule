const API_URL = "http://localhost:8000";

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
};

export const api = {
  getTasks: () => fetchAPI("/tasks/"),
  createTask: (data: any) => fetchAPI("/tasks/", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) => fetchAPI(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTask: (id: string) => fetchAPI(`/tasks/${id}`, { method: "DELETE" }),
  
  getHabits: () => fetchAPI("/habits/"),
  createHabit: (data: any) => fetchAPI("/habits/", { method: "POST", body: JSON.stringify(data) }),
  deleteHabit: (id: string) => fetchAPI(`/habits/${id}`, { method: "DELETE" }),
  
  getHabitLogs: (habitId: string) => fetchAPI(`/habit-log/${habitId}`),
  toggleHabitLog: (data: any) => fetchAPI("/habit-log/", { method: "POST", body: JSON.stringify(data) }),
  
  getGoals: () => fetchAPI("/goals/"),
  createGoal: (data: any) => fetchAPI("/goals/", { method: "POST", body: JSON.stringify(data) }),
  updateGoal: (id: string, data: any) => fetchAPI(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteGoal: (id: string) => fetchAPI(`/goals/${id}`, { method: "DELETE" }),
};
