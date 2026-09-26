import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { db } from '../database/db';
import { NutritionEntry } from '../types';

export const getNutrition = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const { date } = req.query;

  const entries = db.getNutrition(userId, date ? String(date) : undefined);
  const totalCalories = entries.reduce((s, e) => s + e.calories, 0);
  const totalProtein = entries.reduce((s, e) => s + e.protein, 0);
  const totalCarbs = entries.reduce((s, e) => s + e.carbs, 0);
  const totalFat = entries.reduce((s, e) => s + e.fat, 0);

  res.json({
    success: true,
    count: entries.length,
    totals: { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
    data: entries,
  });
};

export const addNutrition = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user?.id || 'user_default';
    const { date, name, calories, protein, carbs, fat, mealType } = req.body;

    if (!date || !name) {
      res.status(400).json({ success: false, message: 'Date and meal name are required' });
      return;
    }

    const newEntry: NutritionEntry = {
      id: req.body.id || `n_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      date,
      name,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      mealType: mealType || 'snack',
      createdAt: new Date().toISOString(),
    };

    db.saveNutrition(newEntry);
    res.status(201).json({ success: true, data: newEntry });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNutrition = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const id = String(req.params.id);

  const deleted = db.deleteNutrition(userId, id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Nutrition entry not found' });
    return;
  }

  res.json({ success: true, message: 'Nutrition entry deleted successfully' });
};
