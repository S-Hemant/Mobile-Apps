import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Exercise {
  id: string;
  name: string;
  sets: { weight: number; reps: number; done: boolean }[];
}

export interface Workout {
  id: string;
  type: string;
  date: string;
  duration: number; // minutes
  calories: number;
  exercises: Exercise[];
  notes: string;
  distance?: number; // km, for running/cycling
}

export interface DailyStats {
  date: string;
  steps: number;
  calories: number;
  activeMinutes: number;
  distance: number;
}

export interface NutritionEntry {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number; // hours
  quality: 1 | 2 | 3 | 4 | 5;
}

export interface Goal {
  id: string;
  title: string;
  type: 'distance' | 'workouts' | 'calories' | 'steps' | 'custom';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  color: string;
}

interface FitnessContextType {
  workouts: Workout[];
  dailyStats: DailyStats[];
  nutritionLog: NutritionEntry[];
  sleepLog: SleepEntry[];
  goals: Goal[];
  streak: number;
  todayStats: DailyStats;
  addWorkout: (workout: Workout) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  addNutrition: (entry: NutritionEntry) => Promise<void>;
  deleteNutrition: (id: string) => Promise<void>;
  addSleep: (entry: SleepEntry) => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateTodayStats: (stats: Partial<DailyStats>) => Promise<void>;
  isLoading: boolean;
}

const FitnessContext = createContext<FitnessContextType>({} as FitnessContextType);

const today = () => new Date().toISOString().split('T')[0];

const SAMPLE_WORKOUTS: Workout[] = [
  {
    id: '1',
    type: 'Running',
    date: today(),
    duration: 35,
    calories: 320,
    exercises: [],
    notes: 'Great morning run!',
    distance: 5.2,
  },
  {
    id: '2',
    type: 'Gym',
    date: today(),
    duration: 45,
    calories: 280,
    exercises: [
      { id: 'e1', name: 'Bench Press', sets: [{ weight: 80, reps: 10, done: true }, { weight: 85, reps: 8, done: true }, { weight: 90, reps: 6, done: true }] },
      { id: 'e2', name: 'Squat', sets: [{ weight: 100, reps: 8, done: true }, { weight: 105, reps: 6, done: true }] },
    ],
    notes: '',
  },
];

const SAMPLE_GOALS: Goal[] = [
  { id: 'g1', title: 'Run 50km this month', type: 'distance', target: 50, current: 34, unit: 'km', deadline: '2026-09-30', color: '#7C3AED' },
  { id: 'g2', title: 'Workout 20 days', type: 'workouts', target: 20, current: 14, unit: 'days', deadline: '2026-09-30', color: '#EC4899' },
  { id: 'g3', title: 'Burn 30,000 cal', type: 'calories', target: 30000, current: 16500, unit: 'kcal', deadline: '2026-09-30', color: '#06B6D4' },
];

const SAMPLE_SLEEP: SleepEntry[] = [
  { id: 's1', date: today(), bedtime: '23:00', wakeTime: '06:30', duration: 7.5, quality: 4 },
];

const SAMPLE_NUTRITION: NutritionEntry[] = [
  { id: 'n1', date: today(), name: 'Oatmeal with banana', calories: 350, protein: 12, carbs: 65, fat: 5, mealType: 'breakfast' },
  { id: 'n2', date: today(), name: 'Grilled chicken salad', calories: 420, protein: 38, carbs: 18, fat: 14, mealType: 'lunch' },
  { id: 'n3', date: today(), name: 'Protein shake', calories: 180, protein: 25, carbs: 10, fat: 3, mealType: 'snack' },
];

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workouts, setWorkouts] = useState<Workout[]>(SAMPLE_WORKOUTS);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [nutritionLog, setNutritionLog] = useState<NutritionEntry[]>(SAMPLE_NUTRITION);
  const [sleepLog, setSleepLog] = useState<SleepEntry[]>(SAMPLE_SLEEP);
  const [goals, setGoals] = useState<Goal[]>(SAMPLE_GOALS);
  const [isLoading, setIsLoading] = useState(false);
  const [todayStats, setTodayStats] = useState<DailyStats>({
    date: today(),
    steps: 8432,
    calories: 1240,
    activeMinutes: 45,
    distance: 3.3,
  });

  const streak = 14;

  const addWorkout = async (workout: Workout) => {
    const updated = [workout, ...workouts];
    setWorkouts(updated);
    await AsyncStorage.setItem('workouts', JSON.stringify(updated));
  };

  const updateWorkout = async (workout: Workout) => {
    const updated = workouts.map(w => w.id === workout.id ? workout : w);
    setWorkouts(updated);
    await AsyncStorage.setItem('workouts', JSON.stringify(updated));
  };

  const deleteWorkout = async (id: string) => {
    const updated = workouts.filter(w => w.id !== id);
    setWorkouts(updated);
    await AsyncStorage.setItem('workouts', JSON.stringify(updated));
  };

  const addNutrition = async (entry: NutritionEntry) => {
    const updated = [entry, ...nutritionLog];
    setNutritionLog(updated);
  };

  const deleteNutrition = async (id: string) => {
    setNutritionLog(prev => prev.filter(e => e.id !== id));
  };

  const addSleep = async (entry: SleepEntry) => {
    setSleepLog(prev => [entry, ...prev]);
  };

  const addGoal = async (goal: Goal) => {
    const updated = [...goals, goal];
    setGoals(updated);
  };

  const updateGoal = async (goal: Goal) => {
    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateTodayStats = async (stats: Partial<DailyStats>) => {
    setTodayStats(prev => ({ ...prev, ...stats }));
  };

  return (
    <FitnessContext.Provider value={{
      workouts, dailyStats, nutritionLog, sleepLog, goals, streak,
      todayStats, addWorkout, updateWorkout, deleteWorkout,
      addNutrition, deleteNutrition, addSleep,
      addGoal, updateGoal, deleteGoal,
      updateTodayStats, isLoading,
    }}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => useContext(FitnessContext);
