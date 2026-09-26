export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  avatarEmoji: string;
  themePreference: 'dark' | 'light' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseSet {
  weight: number;
  reps: number;
  done: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface Workout {
  id: string;
  userId: string;
  type: string;
  date: string; // YYYY-MM-DD
  duration: number; // minutes
  calories: number;
  exercises: Exercise[];
  notes: string;
  distance?: number; // km
  createdAt: string;
  updatedAt: string;
}

export interface DailyStats {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  steps: number;
  calories: number;
  activeMinutes: number;
  distance: number; // km
  waterIntake?: number; // ml
  createdAt: string;
  updatedAt: string;
}

export interface NutritionEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  createdAt: string;
}

export interface SleepEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  bedtime: string; // e.g. "23:00"
  wakeTime: string; // e.g. "06:30"
  duration: number; // hours
  quality: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  type: 'distance' | 'workouts' | 'calories' | 'steps' | 'custom';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  workouts: Workout[];
  dailyStats: DailyStats[];
  nutrition: NutritionEntry[];
  sleep: SleepEntry[];
  goals: Goal[];
}
