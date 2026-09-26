import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { db } from '../database/db';
import { Goal } from '../types';

export const getGoals = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const goals = db.getGoals(userId);
  res.json({ success: true, count: goals.length, data: goals });
};

export const createGoal = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user?.id || 'user_default';
    const { title, type, target, current, unit, deadline, color } = req.body;

    if (!title || !target) {
      res.status(400).json({ success: false, message: 'Title and target are required' });
      return;
    }

    const newGoal: Goal = {
      id: req.body.id || `g_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      title,
      type: type || 'custom',
      target: Number(target),
      current: Number(current) || 0,
      unit: unit || '',
      deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      color: color || '#7C3AED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveGoal(newGoal);
    res.status(201).json({ success: true, data: newGoal });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateGoal = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user?.id || 'user_default';
    const id = String(req.params.id);

    const existingGoals = db.getGoals(userId);
    const existing = existingGoals.find(g => g.id === id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }

    const updatedGoal: Goal = {
      ...existing,
      ...req.body,
      id,
      userId,
      target: req.body.target !== undefined ? Number(req.body.target) : existing.target,
      current: req.body.current !== undefined ? Number(req.body.current) : existing.current,
      updatedAt: new Date().toISOString(),
    };

    db.saveGoal(updatedGoal);
    res.json({ success: true, data: updatedGoal });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteGoal = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const id = String(req.params.id);

  const deleted = db.deleteGoal(userId, id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Goal not found' });
    return;
  }

  res.json({ success: true, message: 'Goal deleted successfully' });
};
