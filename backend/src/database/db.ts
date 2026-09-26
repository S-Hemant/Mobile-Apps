import fs from 'fs';
import path from 'path';
import { DatabaseSchema, User, Workout, DailyStats, NutritionEntry, SleepEntry, Goal } from '../types';
import { config } from '../config';

const today = () => new Date().toISOString().split('T')[0];

const DEFAULT_DEMO_USER: User = {
  id: 'user_default',
  email: 'hemant@example.com',
  name: 'Hemant',
  level: 18,
  xp: 7450,
  streak: 14,
  avatarEmoji: '🧑‍💪',
  themePreference: 'dark',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const INITIAL_DATABASE: DatabaseSchema = {
  users: [DEFAULT_DEMO_USER],
  workouts: [
    {
      id: 'w1',
      userId: 'user_default',
      type: 'Running',
      date: today(),
      duration: 35,
      calories: 320,
      exercises: [],
      notes: 'Great morning run around the park!',
      distance: 5.2,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'w2',
      userId: 'user_default',
      type: 'Gym',
      date: today(),
      duration: 45,
      calories: 280,
      exercises: [
        {
          id: 'e1',
          name: 'Bench Press',
          sets: [
            { weight: 80, reps: 10, done: true },
            { weight: 85, reps: 8, done: true },
            { weight: 90, reps: 6, done: true },
          ],
        },
        {
          id: 'e2',
          name: 'Squat',
          sets: [
            { weight: 100, reps: 8, done: true },
            { weight: 105, reps: 6, done: true },
          ],
        },
      ],
      notes: 'Upper chest focus + heavy leg day warmup',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'w3',
      userId: 'user_default',
      type: 'Cycling',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      duration: 50,
      calories: 420,
      exercises: [],
      notes: 'Scenic lake route ride',
      distance: 14.8,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  dailyStats: [
    {
      id: 'ds_today',
      userId: 'user_default',
      date: today(),
      steps: 8432,
      calories: 1240,
      activeMinutes: 45,
      distance: 3.3,
      waterIntake: 2200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ds_yesterday',
      userId: 'user_default',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      steps: 10240,
      calories: 1890,
      activeMinutes: 65,
      distance: 6.8,
      waterIntake: 2500,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  nutrition: [
    {
      id: 'n1',
      userId: 'user_default',
      date: today(),
      name: 'Oatmeal with banana & almond butter',
      calories: 350,
      protein: 12,
      carbs: 65,
      fat: 5,
      mealType: 'breakfast',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'n2',
      userId: 'user_default',
      date: today(),
      name: 'Grilled chicken breast with quinoa and salad',
      calories: 420,
      protein: 38,
      carbs: 18,
      fat: 14,
      mealType: 'lunch',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'n3',
      userId: 'user_default',
      date: today(),
      name: 'Whey Protein shake & berries',
      calories: 180,
      protein: 25,
      carbs: 10,
      fat: 3,
      mealType: 'snack',
      createdAt: new Date().toISOString(),
    },
  ],
  sleep: [
    {
      id: 's1',
      userId: 'user_default',
      date: today(),
      bedtime: '23:00',
      wakeTime: '06:30',
      duration: 7.5,
      quality: 4,
      createdAt: new Date().toISOString(),
    },
    {
      id: 's2',
      userId: 'user_default',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      bedtime: '23:30',
      wakeTime: '07:00',
      duration: 7.5,
      quality: 5,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  goals: [
    {
      id: 'g1',
      userId: 'user_default',
      title: 'Run 50km this month',
      type: 'distance',
      target: 50,
      current: 34,
      unit: 'km',
      deadline: '2026-09-30',
      color: '#7C3AED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'g2',
      userId: 'user_default',
      title: 'Workout 20 days',
      type: 'workouts',
      target: 20,
      current: 14,
      unit: 'days',
      deadline: '2026-09-30',
      color: '#EC4899',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'g3',
      userId: 'user_default',
      title: 'Burn 30,000 cal',
      type: 'calories',
      target: 30000,
      current: 16500,
      unit: 'kcal',
      deadline: '2026-09-30',
      color: '#06B6D4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

class Database {
  private data: DatabaseSchema;
  private filePath: string;

  constructor() {
    this.filePath = config.dataPath;
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Failed reading database file, initializing defaults:', err);
        this.data = INITIAL_DATABASE;
        this.save();
      }
    } else {
      this.data = INITIAL_DATABASE;
      this.save();
    }
  }

  private save(): void {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error('Failed saving database:', err);
    }
  }

  // Users
  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  saveUser(user: User): User {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.data.users[idx] = { ...user, updatedAt: new Date().toISOString() };
    } else {
      this.data.users.push(user);
    }
    this.save();
    return user;
  }

  // Workouts
  getWorkouts(userId: string): Workout[] {
    return this.data.workouts
      .filter(w => w.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  getWorkoutById(userId: string, id: string): Workout | undefined {
    return this.data.workouts.find(w => w.userId === userId && w.id === id);
  }

  saveWorkout(workout: Workout): Workout {
    const idx = this.data.workouts.findIndex(w => w.id === workout.id);
    if (idx >= 0) {
      this.data.workouts[idx] = { ...workout, updatedAt: new Date().toISOString() };
    } else {
      this.data.workouts.unshift(workout);
    }
    this.save();
    return workout;
  }

  deleteWorkout(userId: string, id: string): boolean {
    const initialLen = this.data.workouts.length;
    this.data.workouts = this.data.workouts.filter(w => !(w.userId === userId && w.id === id));
    if (this.data.workouts.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Daily Stats
  getDailyStats(userId: string, date: string): DailyStats | undefined {
    return this.data.dailyStats.find(ds => ds.userId === userId && ds.date === date);
  }

  getAllDailyStats(userId: string): DailyStats[] {
    return this.data.dailyStats
      .filter(ds => ds.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  saveDailyStats(stats: DailyStats): DailyStats {
    const idx = this.data.dailyStats.findIndex(
      ds => ds.userId === stats.userId && ds.date === stats.date
    );
    if (idx >= 0) {
      this.data.dailyStats[idx] = { ...this.data.dailyStats[idx], ...stats, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.dailyStats[idx];
    } else {
      this.data.dailyStats.push(stats);
      this.save();
      return stats;
    }
  }

  // Nutrition
  getNutrition(userId: string, date?: string): NutritionEntry[] {
    return this.data.nutrition
      .filter(n => n.userId === userId && (!date || n.date === date))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  saveNutrition(entry: NutritionEntry): NutritionEntry {
    const idx = this.data.nutrition.findIndex(n => n.id === entry.id);
    if (idx >= 0) {
      this.data.nutrition[idx] = entry;
    } else {
      this.data.nutrition.unshift(entry);
    }
    this.save();
    return entry;
  }

  deleteNutrition(userId: string, id: string): boolean {
    const initialLen = this.data.nutrition.length;
    this.data.nutrition = this.data.nutrition.filter(n => !(n.userId === userId && n.id === id));
    if (this.data.nutrition.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Sleep
  getSleep(userId: string, date?: string): SleepEntry[] {
    return this.data.sleep
      .filter(s => s.userId === userId && (!date || s.date === date))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  saveSleep(entry: SleepEntry): SleepEntry {
    const idx = this.data.sleep.findIndex(s => s.id === entry.id);
    if (idx >= 0) {
      this.data.sleep[idx] = entry;
    } else {
      this.data.sleep.unshift(entry);
    }
    this.save();
    return entry;
  }

  deleteSleep(userId: string, id: string): boolean {
    const initialLen = this.data.sleep.length;
    this.data.sleep = this.data.sleep.filter(s => !(s.userId === userId && s.id === id));
    if (this.data.sleep.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Goals
  getGoals(userId: string): Goal[] {
    return this.data.goals.filter(g => g.userId === userId);
  }

  saveGoal(goal: Goal): Goal {
    const idx = this.data.goals.findIndex(g => g.id === goal.id);
    if (idx >= 0) {
      this.data.goals[idx] = { ...goal, updatedAt: new Date().toISOString() };
    } else {
      this.data.goals.push(goal);
    }
    this.save();
    return goal;
  }

  deleteGoal(userId: string, id: string): boolean {
    const initialLen = this.data.goals.length;
    this.data.goals = this.data.goals.filter(g => !(g.userId === userId && g.id === id));
    if (this.data.goals.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Batch Sync for mobile app offline-first synchronization
  batchSync(userId: string, payload: {
    workouts?: Workout[];
    dailyStats?: DailyStats[];
    nutrition?: NutritionEntry[];
    sleep?: SleepEntry[];
    goals?: Goal[];
  }): DatabaseSchema {
    if (payload.workouts) {
      payload.workouts.forEach(w => this.saveWorkout({ ...w, userId }));
    }
    if (payload.dailyStats) {
      payload.dailyStats.forEach(ds => this.saveDailyStats({ ...ds, userId }));
    }
    if (payload.nutrition) {
      payload.nutrition.forEach(n => this.saveNutrition({ ...n, userId }));
    }
    if (payload.sleep) {
      payload.sleep.forEach(s => this.saveSleep({ ...s, userId }));
    }
    if (payload.goals) {
      payload.goals.forEach(g => this.saveGoal({ ...g, userId }));
    }

    return {
      users: [this.getUserById(userId) || DEFAULT_DEMO_USER],
      workouts: this.getWorkouts(userId),
      dailyStats: this.getAllDailyStats(userId),
      nutrition: this.getNutrition(userId),
      sleep: this.getSleep(userId),
      goals: this.getGoals(userId),
    };
  }
}

export const db = new Database();
export { DEFAULT_DEMO_USER };
