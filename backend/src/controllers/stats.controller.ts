import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { db } from '../database/db';
import { DailyStats } from '../types';

const today = () => new Date().toISOString().split('T')[0];

export const getTodayStats = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const todayDate = today();

  let stats = db.getDailyStats(userId, todayDate);
  if (!stats) {
    stats = {
      id: `ds_${todayDate}`,
      userId,
      date: todayDate,
      steps: 0,
      calories: 0,
      activeMinutes: 0,
      distance: 0,
      waterIntake: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.saveDailyStats(stats);
  }

  res.json({ success: true, data: stats });
};

export const updateTodayStats = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user?.id || 'user_default';
    const todayDate = today();

    let existing = db.getDailyStats(userId, todayDate);
    const updatedStats: DailyStats = {
      id: existing ? existing.id : `ds_${todayDate}`,
      userId,
      date: todayDate,
      steps: req.body.steps !== undefined ? Number(req.body.steps) : existing?.steps || 0,
      calories: req.body.calories !== undefined ? Number(req.body.calories) : existing?.calories || 0,
      activeMinutes: req.body.activeMinutes !== undefined ? Number(req.body.activeMinutes) : existing?.activeMinutes || 0,
      distance: req.body.distance !== undefined ? Number(req.body.distance) : existing?.distance || 0,
      waterIntake: req.body.waterIntake !== undefined ? Number(req.body.waterIntake) : existing?.waterIntake || 0,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveDailyStats(updatedStats);
    res.json({ success: true, data: updatedStats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStatsHistory = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const history = db.getAllDailyStats(userId);
  res.json({ success: true, count: history.length, data: history });
};

export const getStatsSummary = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const workouts = db.getWorkouts(userId);
  const dailyHistory = db.getAllDailyStats(userId);
  const user = db.getUserById(userId);

  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalDistance = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);

  // Group workouts by activity type
  const activityDistribution: Record<string, number> = {};
  workouts.forEach(w => {
    activityDistribution[w.type] = (activityDistribution[w.type] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      totalWorkouts: workouts.length,
      totalCaloriesBurned: totalCalories,
      totalActiveMinutes: totalDuration,
      totalDistanceKm: Number(totalDistance.toFixed(2)),
      currentStreak: user?.streak || 14,
      level: user?.level || 18,
      xp: user?.xp || 7450,
      activityDistribution,
      daysTracked: dailyHistory.length,
    },
  });
};
