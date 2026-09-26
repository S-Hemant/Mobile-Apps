import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fitnessApi } from '../services/api';

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
  waterIntake?: number;
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
  syncWithServer: () => Promise<void>;
  isLoading: boolean;
  isBackendConnected: boolean;
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
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [todayStats, setTodayStats] = useState<DailyStats>({
    date: today(),
    steps: 8432,
    calories: 1240,
    activeMinutes: 45,
    distance: 3.3,
  });

  const streak = 14;

  // Initialize data from local storage first, then sync with backend
  useEffect(() => {
    const initData = async () => {
      try {
        const storedWorkouts = await AsyncStorage.getItem('workouts');
        if (storedWorkouts) setWorkouts(JSON.parse(storedWorkouts));

        const storedGoals = await AsyncStorage.getItem('goals');
        if (storedGoals) setGoals(JSON.parse(storedGoals));

        const storedNutrition = await AsyncStorage.getItem('nutrition');
        if (storedNutrition) setNutritionLog(JSON.parse(storedNutrition));

        const storedSleep = await AsyncStorage.getItem('sleep');
        if (storedSleep) setSleepLog(JSON.parse(storedSleep));
      } catch (e) {
        console.warn('Error loading cached fitness data:', e);
      }

      // Try initial sync with backend
      syncWithServer();
    };

    initData();
  }, []);

  const syncWithServer = useCallback(async () => {
    setIsLoading(true);
    try {
      const serverWorkouts = await fitnessApi.getWorkouts();
      if (serverWorkouts && serverWorkouts.length > 0) {
        setWorkouts(serverWorkouts);
        await AsyncStorage.setItem('workouts', JSON.stringify(serverWorkouts));
        setIsBackendConnected(true);
      }

      const serverTodayStats = await fitnessApi.getTodayStats();
      if (serverTodayStats) {
        setTodayStats(serverTodayStats);
        setIsBackendConnected(true);
      }

      const serverGoals = await fitnessApi.getGoals();
      if (serverGoals && serverGoals.length > 0) {
        setGoals(serverGoals);
        await AsyncStorage.setItem('goals', JSON.stringify(serverGoals));
      }

      const serverNutrition = await fitnessApi.getNutrition();
      if (serverNutrition && serverNutrition.length > 0) {
        setNutritionLog(serverNutrition);
        await AsyncStorage.setItem('nutrition', JSON.stringify(serverNutrition));
      }

      const serverSleep = await fitnessApi.getSleep();
      if (serverSleep && serverSleep.length > 0) {
        setSleepLog(serverSleep);
        await AsyncStorage.setItem('sleep', JSON.stringify(serverSleep));
      }
    } catch (err) {
      console.log('Backend sync skipped or offline:', err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addWorkout = async (workout: Workout) => {
    const updated = [workout, ...workouts];
    setWorkouts(updated);
    await AsyncStorage.setItem('workouts', JSON.stringify(updated));
    // Asynchronously push to backend
    fitnessApi.createWorkout(workout).catch(err => console.warn('Sync workout error:', err));
  };

  const updateWorkout = async (workout: Workout) => {
    const updated = workouts.map(w => w.id === workout.id ? workout : w);
    setWorkouts(updated);
    await AsyncStorage.setItem('workouts', JSON.stringify(updated));
    fitnessApi.updateWorkout(workout).catch(err => console.warn('Sync workout error:', err));
  };

  const deleteWorkout = async (id: string) => {
    const updated = workouts.filter(w => w.id !== id);
    setWorkouts(updated);
    await AsyncStorage.setItem('workouts', JSON.stringify(updated));
    fitnessApi.deleteWorkout(id).catch(err => console.warn('Delete workout error:', err));
  };

  const addNutrition = async (entry: NutritionEntry) => {
    const updated = [entry, ...nutritionLog];
    setNutritionLog(updated);
    await AsyncStorage.setItem('nutrition', JSON.stringify(updated));
    fitnessApi.addNutrition(entry).catch(err => console.warn('Add nutrition error:', err));
  };

  const deleteNutrition = async (id: string) => {
    const updated = nutritionLog.filter(e => e.id !== id);
    setNutritionLog(updated);
    await AsyncStorage.setItem('nutrition', JSON.stringify(updated));
    fitnessApi.deleteNutrition(id).catch(err => console.warn('Delete nutrition error:', err));
  };

  const addSleep = async (entry: SleepEntry) => {
    const updated = [entry, ...sleepLog];
    setSleepLog(updated);
    await AsyncStorage.setItem('sleep', JSON.stringify(updated));
    fitnessApi.addSleep(entry).catch(err => console.warn('Add sleep error:', err));
  };

  const addGoal = async (goal: Goal) => {
    const updated = [...goals, goal];
    setGoals(updated);
    await AsyncStorage.setItem('goals', JSON.stringify(updated));
    fitnessApi.addGoal(goal).catch(err => console.warn('Add goal error:', err));
  };

  const updateGoal = async (goal: Goal) => {
    const updated = goals.map(g => g.id === goal.id ? goal : g);
    setGoals(updated);
    await AsyncStorage.setItem('goals', JSON.stringify(updated));
    fitnessApi.updateGoal(goal).catch(err => console.warn('Update goal error:', err));
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    await AsyncStorage.setItem('goals', JSON.stringify(updated));
    fitnessApi.deleteGoal(id).catch(err => console.warn('Delete goal error:', err));
  };

  const updateTodayStats = async (stats: Partial<DailyStats>) => {
    setTodayStats(prev => ({ ...prev, ...stats }));
    fitnessApi.updateTodayStats(stats).catch(err => console.warn('Update stats error:', err));
  };

  return (
    <FitnessContext.Provider value={{
      workouts, dailyStats, nutritionLog, sleepLog, goals, streak,
      todayStats, addWorkout, updateWorkout, deleteWorkout,
      addNutrition, deleteNutrition, addSleep,
      addGoal, updateGoal, deleteGoal,
      updateTodayStats, syncWithServer, isLoading, isBackendConnected,
    }}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => useContext(FitnessContext);
