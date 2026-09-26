import { API_CONFIG } from '../config/api';
import { Workout, DailyStats, NutritionEntry, SleepEntry, Goal } from '../context/FitnessContext';

class FitnessApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err) {
      // In development or when offline, log warning and let caller handle fallback
      console.warn(`[FitnessApiClient] Request to ${endpoint} failed:`, (err as any).message);
      return null;
    }
  }

  // Workouts
  async getWorkouts(): Promise<Workout[] | null> {
    const res = await this.request<{ success: boolean; data: Workout[] }>('/workouts');
    return res ? res.data : null;
  }

  async createWorkout(workout: Workout): Promise<Workout | null> {
    const res = await this.request<{ success: boolean; data: Workout }>('/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
    });
    return res ? res.data : null;
  }

  async updateWorkout(workout: Workout): Promise<Workout | null> {
    const res = await this.request<{ success: boolean; data: Workout }>(`/workouts/${workout.id}`, {
      method: 'PUT',
      body: JSON.stringify(workout),
    });
    return res ? res.data : null;
  }

  async deleteWorkout(id: string): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/workouts/${id}`, {
      method: 'DELETE',
    });
    return res ? res.success : false;
  }

  // Daily Stats
  async getTodayStats(): Promise<DailyStats | null> {
    const res = await this.request<{ success: boolean; data: DailyStats }>('/stats/today');
    return res ? res.data : null;
  }

  async updateTodayStats(stats: Partial<DailyStats>): Promise<DailyStats | null> {
    const res = await this.request<{ success: boolean; data: DailyStats }>('/stats/today', {
      method: 'POST',
      body: JSON.stringify(stats),
    });
    return res ? res.data : null;
  }

  async getStatsSummary(): Promise<any | null> {
    const res = await this.request<{ success: boolean; data: any }>('/stats/summary');
    return res ? res.data : null;
  }

  // Nutrition
  async getNutrition(date?: string): Promise<NutritionEntry[] | null> {
    const query = date ? `?date=${date}` : '';
    const res = await this.request<{ success: boolean; data: NutritionEntry[] }>(`/nutrition${query}`);
    return res ? res.data : null;
  }

  async addNutrition(entry: NutritionEntry): Promise<NutritionEntry | null> {
    const res = await this.request<{ success: boolean; data: NutritionEntry }>('/nutrition', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    return res ? res.data : null;
  }

  async deleteNutrition(id: string): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/nutrition/${id}`, {
      method: 'DELETE',
    });
    return res ? res.success : false;
  }

  // Sleep
  async getSleep(date?: string): Promise<SleepEntry[] | null> {
    const query = date ? `?date=${date}` : '';
    const res = await this.request<{ success: boolean; data: SleepEntry[] }>(`/sleep${query}`);
    return res ? res.data : null;
  }

  async addSleep(entry: SleepEntry): Promise<SleepEntry | null> {
    const res = await this.request<{ success: boolean; data: SleepEntry }>('/sleep', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    return res ? res.data : null;
  }

  async deleteSleep(id: string): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/sleep/${id}`, {
      method: 'DELETE',
    });
    return res ? res.success : false;
  }

  // Goals
  async getGoals(): Promise<Goal[] | null> {
    const res = await this.request<{ success: boolean; data: Goal[] }>('/goals');
    return res ? res.data : null;
  }

  async addGoal(goal: Goal): Promise<Goal | null> {
    const res = await this.request<{ success: boolean; data: Goal }>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
    return res ? res.data : null;
  }

  async updateGoal(goal: Goal): Promise<Goal | null> {
    const res = await this.request<{ success: boolean; data: Goal }>(`/goals/${goal.id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
    return res ? res.data : null;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/goals/${id}`, {
      method: 'DELETE',
    });
    return res ? res.success : false;
  }

  // Batch Sync
  async syncBatch(payload: {
    workouts?: Workout[];
    dailyStats?: DailyStats[];
    nutrition?: NutritionEntry[];
    sleep?: SleepEntry[];
    goals?: Goal[];
  }): Promise<any | null> {
    const res = await this.request<{ success: boolean; data: any }>('/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res ? res.data : null;
  }
}

export const fitnessApi = new FitnessApiClient();
