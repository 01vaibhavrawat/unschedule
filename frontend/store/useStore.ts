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
  trigger: string;
  identity?: string;
  frequency: string[];
  created_at: string;
}

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  color?: string;
  created_at?: string;
  deadline?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  has_completed_onboarding: boolean;
}

export interface Board {
  _id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface AppState {
  user: AuthUser | null;
  tasks: any[];
  habits: any[];
  goals: Goal[];
  habitLogs: Record<string, any>;
  streaks: Record<string, number>;
  notes: any[];
  journals: any[];
  board: Board | null;
  assistantOpen: boolean;

  setAssistantOpen: (open: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;

  fetchInitialData: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addTask: (task: any) => Promise<any>;
  updateTask: (id: string, task: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addHabit: (habit: any) => Promise<any>;
  updateHabit: (id: string, habit: any) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitLog: (habitId: string, date: string) => Promise<void>;
  setHabitStatus: (habitId: string, date: string, status: 'completed' | 'skipped' | 'none') => Promise<void>;

  addGoal: (goal: any) => Promise<any>;
  updateGoal: (id: string, goal: any) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  addNote: (note: any) => Promise<any>;
  updateNote: (id: string, note: any) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  addJournal: (journal: any) => Promise<any>;
  updateJournal: (id: string, journal: any) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;

  updateBoard: (content: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  tasks: [],
  habits: [],
  goals: [],
  habitLogs: {},
  streaks: {},
  notes: [],
  journals: [],
  board: null,
  assistantOpen: false,

  setAssistantOpen: (open) => set({ assistantOpen: open }),
  setUser: (user) => set({ user }),

  logout: async () => {
    await api.logout();
    set({ user: null, tasks: [], habits: [], goals: [], habitLogs: {}, streaks: {}, notes: [], journals: [], board: null });
    window.location.href = '/login';
  },

  fetchInitialData: async () => {
    try {
      const [tasks, habits, goals, notes, journals, board] = await Promise.all([
        api.getTasks(),
        api.getHabits(),
        api.getGoals(),
        api.getNotes(),
        api.getJournals(),
        api.getBoard()
      ]);
      set({ tasks, habits, goals, notes, journals, board });

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
    return newTask;
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
    return newHabit;
  },

  updateHabit: async (id, updatedHabit) => {
    const newHabit = await api.updateHabit(id, updatedHabit);
    set((state) => ({ habits: state.habits.map(h => h._id === id ? newHabit : h) }));
  },

  deleteHabit: async (id) => {
    await api.deleteHabit(id);
    set((state) => ({ habits: state.habits.filter(h => h._id !== id) }));
  },

  toggleHabitLog: async (habitId, date) => {
    await api.toggleHabitLog({ habit_id: habitId, date, completed: true });
    const result = await api.getHabitLogs(habitId);
    set((state) => ({
      habitLogs: { ...state.habitLogs, [habitId]: result.logs },
      streaks: { ...state.streaks, [habitId]: result.streak }
    }));
  },

  setHabitStatus: async (habitId, date, status) => {
    await api.setHabitLogStatus({ habit_id: habitId, date, status });
    const result = await api.getHabitLogs(habitId);
    set((state) => ({
      habitLogs: { ...state.habitLogs, [habitId]: result.logs },
      streaks: { ...state.streaks, [habitId]: result.streak }
    }));
  },

  addGoal: async (goal) => {
    const newGoal = await api.createGoal(goal);
    set((state) => ({ goals: [...state.goals, newGoal] }));
    return newGoal;
  },

  updateGoal: async (id, updatedGoal) => {
    const newGoal = await api.updateGoal(id, updatedGoal);
    set((state) => ({ goals: state.goals.map(g => g._id === id ? newGoal : g) }));
  },

  deleteGoal: async (id) => {
    await api.deleteGoal(id);
    set((state) => ({ goals: state.goals.filter(g => g._id !== id) }));
  },

  addNote: async (note) => {
    const newNote = await api.createNote(note);
    set((state) => ({ notes: [...state.notes, newNote] }));
    return newNote;
  },

  updateNote: async (id, updatedNote) => {
    const newNote = await api.updateNote(id, updatedNote);
    set((state) => ({ notes: state.notes.map(n => n._id === id ? newNote : n) }));
  },

  deleteNote: async (id) => {
    await api.deleteNote(id);
    set((state) => ({ notes: state.notes.filter(n => n._id !== id) }));
  },

  addJournal: async (journal) => {
    const newJournal = await api.createJournal(journal);
    set((state) => ({ journals: [...state.journals, newJournal] }));
    return newJournal;
  },

  updateJournal: async (id, updatedJournal) => {
    const newJournal = await api.updateJournal(id, updatedJournal);
    set((state) => ({ journals: state.journals.map(j => j._id === id ? newJournal : j) }));
  },

  deleteJournal: async (id) => {
    await api.deleteJournal(id);
    set((state) => ({ journals: state.journals.filter(j => j._id !== id) }));
  },

  updateBoard: async (content) => {
    const updatedBoard = await api.updateBoard({ content });
    set({ board: updatedBoard });
  }
}));
