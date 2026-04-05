import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { HabitData, AppState } from '$lib/types';

const STORAGE_KEY = 'habit-tracker-svelte-v1';

const EMPTY_STATE: AppState = {
  habits: [],
  activeHabitId: '',
};

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadState(): AppState {
  if (!browser) return EMPTY_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!Array.isArray(parsed.habits)) return EMPTY_STATE;
    return {
      habits: parsed.habits,
      activeHabitId: parsed.activeHabitId ?? parsed.habits[0]?.id ?? '',
    };
  } catch {
    return EMPTY_STATE;
  }
}

function persist(state: AppState): AppState {
  if (browser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return state;
}

function createHabitStore() {
  const { subscribe, set, update } = writable<AppState>(EMPTY_STATE);

  // Hydrate from localStorage on client side
  if (browser) {
    set(loadState());
  }

  return {
    subscribe,

    addHabit(name: string, description: string) {
      update((state) => {
        const newHabit: HabitData = {
          id: generateId(),
          name: name.trim() || 'New Habit',
          description: description.trim(),
          completedDates: {},
          createdAt: new Date().toISOString(),
        };
        return persist({
          habits: [...state.habits, newHabit],
          activeHabitId: newHabit.id,
        });
      });
    },

    removeHabit(id: string) {
      update((state) => {
        const next = state.habits.filter((h) => h.id !== id);
        return persist({
          habits: next,
          activeHabitId:
            next.length === 0
              ? ''
              : state.activeHabitId === id
                ? next[0].id
                : state.activeHabitId,
        });
      });
    },

    setActiveHabit(id: string) {
      update((state) => persist({ ...state, activeHabitId: id }));
    },

    toggleDate(habitId: string, year: number, dateStr: string) {
      update((state) => {
        const yearKey = String(year);
        return persist({
          ...state,
          habits: state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const existing = h.completedDates[yearKey] ?? [];
            const isDone = existing.includes(dateStr);
            return {
              ...h,
              completedDates: {
                ...h.completedDates,
                [yearKey]: isDone
                  ? existing.filter((d) => d !== dateStr)
                  : [...existing, dateStr],
              },
            };
          }),
        });
      });
    },

    resetAll() {
      if (browser) {
        localStorage.removeItem(STORAGE_KEY);
      }
      set(EMPTY_STATE);
    },
  };
}

export const habitStore = createHabitStore();
