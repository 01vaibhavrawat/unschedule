import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Task {
  _id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  type: string;
  recurrence?: string;
}

export interface MiniHabit {
  _id: string;
  title: string;
  frequency: string[];
  created_at: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  has_completed_onboarding: boolean;
}

interface AppState {
  user: AuthUser | null;
  tasks: any[];
  habits: any[];
  goals: any[];
  habitLogs: Record<string, any>;
  streaks: Record<string, number>;

  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;

  fetchInitialData: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addTask: (task: any) => Promise<void>;
  updateTask: (id: string, task: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addHabit: (habit: any) => Promise<void>;
  toggleHabitLog: (habitId: string, date: string) => Promise<void>;

  addGoal: (goal: any) => Promise<void>;
  updateGoal: (id: string, goal: any) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  tasks: [],
  habits: [],
  goals: [],
  habitLogs: {},
  streaks: {},

  setUser: (user) => set({ user }),

  logout: async () => {
    await api.logout();
    set({ user: null, tasks: [], habits: [], goals: [], habitLogs: {}, streaks: {} });
    window.location.href = '/login';
  },

  fetchInitialData: async () => {
    try {
      const [tasks, habits, goals] = await Promise.all([
        api.getTasks(),
        api.getHabits(),
        api.getGoals()
      ]);
      set({ tasks, habits, goals });

      const itemsToFetchLogs = [
        ...habits,
        ...tasks.filter((t: any) => t.type === 'atomic_habit')
      ];

      itemsToFetchLogs.forEach(async (item: any) => {
        const result = await api.getHabitLogs(item._id);
        set((state) => ({
          habitLogs: { ...state.habitLogs, [item._id]: result.logs },
          streaks: { ...state.streaks, [item._id]: result.streak }
        }));
      });
    } catch (e) {
      console.error("Failed to load initial data", e);
    }
  },

  completeOnboarding: async () => {
    await api.completeOnboarding();
    set((state) => ({
      user: state.user ? { ...state.user, has_completed_onboarding: true } : null
    }));
  },

  addTask: async (task) => {
    const newTask = await api.createTask(task);
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: async (id, updatedTask) => {
    const newTask = await api.updateTask(id, updatedTask);
    set((state) => ({ tasks: state.tasks.map(t => t._id === id ? newTask : t) }));
  },

  deleteTask: async (id) => {
    await api.deleteTask(id);
    set((state) => ({ tasks: state.tasks.filter(t => t._id !== id) }));
  },

  addHabit: async (habit) => {
    const newHabit = await api.createHabit(habit);
    set((state) => ({ habits: [...state.habits, newHabit] }));
  },

  toggleHabitLog: async (habitId, date) => {
    await api.toggleHabitLog({ habit_id: habitId, date, completed: true });
    const result = await api.getHabitLogs(habitId);
    set((state) => ({
      habitLogs: { ...state.habitLogs, [habitId]: result.logs },
      streaks: { ...state.streaks, [habitId]: result.streak }
    }));
  },

  addGoal: async (goal) => {
    const newGoal = await api.createGoal(goal);
    set((state) => ({ goals: [...state.goals, newGoal] }));
  },

  updateGoal: async (id, updatedGoal) => {
    const newGoal = await api.updateGoal(id, updatedGoal);
    set((state) => ({ goals: state.goals.map(g => g._id === id ? newGoal : g) }));
  },

  deleteGoal: async (id) => {
    await api.deleteGoal(id);
    set((state) => ({ goals: state.goals.filter(g => g._id !== id) }));
  }
}));
