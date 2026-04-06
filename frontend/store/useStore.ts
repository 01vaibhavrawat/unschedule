import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Task {
  _id: string;
  title: str;
  start_time: str;
  end_time: str;
  status: str;
  type: str;
}

export interface MiniHabit {
  _id: string;
  title: string;
  frequency: string[];
  created_at: string;
}

interface AppState {
  tasks: any[];
  habits: any[];
  goals: any[];
  habitLogs: Record<string, any>; // habitId -> logs array
  streaks: Record<string, number>; // habitId -> current streak
  
  fetchInitialData: () => Promise<void>;
  addTask: (task: any) => Promise<void>;
  updateTask: (id: string, task: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  addHabit: (habit: any) => Promise<void>;
  toggleHabitLog: (habitId: string, date: string) => Promise<void>;
  
  addGoal: (goal: any) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  habits: [],
  goals: [],
  habitLogs: {},
  streaks: {},

  fetchInitialData: async () => {
    try {
      const [tasks, habits, goals] = await Promise.all([
        api.getTasks(),
        api.getHabits(),
        api.getGoals()
      ]);
      set({ tasks, habits, goals });
      
      // Fetch logs for all habits
      habits.forEach(async (h: any) => {
        const result = await api.getHabitLogs(h._id);
        const currentLogs = get().habitLogs;
        const currentStreaks = get().streaks;
        set({
          habitLogs: { ...currentLogs, [h._id]: result.logs },
          streaks: { ...currentStreaks, [h._id]: result.streak }
        });
      });
    } catch (e) {
      console.error("Failed to load initial data", e);
    }
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
    // optimistic UI update...
    await api.toggleHabitLog({ habit_id: habitId, date, completed: true });
    // Refetch the streak and log for this habit
    const result = await api.getHabitLogs(habitId);
    set((state) => ({
      habitLogs: { ...state.habitLogs, [habitId]: result.logs },
      streaks: { ...state.streaks, [habitId]: result.streak }
    }));
  },

  addGoal: async (goal) => {
    const newGoal = await api.createGoal(goal);
    set((state) => ({ goals: [...state.goals, newGoal] }));
  }
}));
