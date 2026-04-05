export interface HabitData {
  id: string;
  name: string;
  description: string;
  /** year string → array of "YYYY-MM-DD" completed dates */
  completedDates: Record<string, string[]>;
  createdAt: string;
}

export interface AppState {
  habits: HabitData[];
  activeHabitId: string;
}
