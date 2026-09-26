import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { db } from '../database/db';
import { Workout } from '../types';

export const getWorkouts = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const { type, date } = req.query;

  let workouts = db.getWorkouts(userId);
  if (type) {
    workouts = workouts.filter(w => w.type.toLowerCase() === String(type).toLowerCase());
  }
  if (date) {
    workouts = workouts.filter(w => w.date === String(date));
  }

  res.json({ success: true, count: workouts.length, data: workouts });
};

export const getWorkoutById = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const id = String(req.params.id);

  const workout = db.getWorkoutById(userId, id);
  if (!workout) {
    res.status(404).json({ success: false, message: 'Workout not found' });
    return;
  }

  res.json({ success: true, data: workout });
};

export const createWorkout = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user?.id || 'user_default';
    const { type, date, duration, calories, exercises, notes, distance } = req.body;

    if (!type || !date) {
      res.status(400).json({ success: false, message: 'Type and date are required' });
      return;
    }

    const newWorkout: Workout = {
      id: req.body.id || `w_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      type,
      date,
      duration: Number(duration) || 0,
      calories: Number(calories) || 0,
      exercises: Array.isArray(exercises) ? exercises : [],
      notes: notes || '',
      distance: distance !== undefined ? Number(distance) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveWorkout(newWorkout);

    // Reward XP to user upon completing a workout
    const user = db.getUserById(userId);
    if (user) {
      const xpGained = Math.max(50, Math.round((newWorkout.calories || 100) * 0.5));
      const newXp = (user.xp || 0) + xpGained;
      const newLevel = Math.floor(newXp / 500) + 1;
      db.saveUser({ ...user, xp: newXp, level: Math.max(user.level, newLevel) });
    }

    res.status(201).json({ success: true, data: newWorkout });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateWorkout = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user?.id || 'user_default';
    const id = String(req.params.id);

    const existing = db.getWorkoutById(userId, id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Workout not found' });
      return;
    }

    const updated: Workout = {
      ...existing,
      ...req.body,
      id,
      userId,
      updatedAt: new Date().toISOString(),
    };

    db.saveWorkout(updated);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteWorkout = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const id = String(req.params.id);

  const deleted = db.deleteWorkout(userId, id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Workout not found' });
    return;
  }

  res.json({ success: true, message: 'Workout deleted successfully' });
};
