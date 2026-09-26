import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { db } from '../database/db';
import { SleepEntry } from '../types';

export const getSleep = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const { date } = req.query;

  const entries = db.getSleep(userId, date ? String(date) : undefined);
  const avgDuration = entries.length
    ? Number((entries.reduce((s, e) => s + e.duration, 0) / entries.length).toFixed(1))
    : 0;
  const avgQuality = entries.length
    ? Number((entries.reduce((s, e) => s + e.quality, 0) / entries.length).toFixed(1))
    : 0;

  res.json({
    success: true,
    count: entries.length,
    averages: { duration: avgDuration, quality: avgQuality },
    data: entries,
  });
};

export const addSleep = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user?.id || 'user_default';
    const { date, bedtime, wakeTime, duration, quality } = req.body;

    if (!date || !bedtime || !wakeTime) {
      res.status(400).json({ success: false, message: 'Date, bedtime, and wakeTime are required' });
      return;
    }

    const newEntry: SleepEntry = {
      id: req.body.id || `s_${crypto.randomUUID().slice(0, 8)}`,
      userId,
      date,
      bedtime,
      wakeTime,
      duration: Number(duration) || 0,
      quality: (Number(quality) as 1 | 2 | 3 | 4 | 5) || 3,
      createdAt: new Date().toISOString(),
    };

    db.saveSleep(newEntry);
    res.status(201).json({ success: true, data: newEntry });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteSleep = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.id || 'user_default';
  const id = String(req.params.id);

  const deleted = db.deleteSleep(userId, id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Sleep entry not found' });
    return;
  }

  res.json({ success: true, message: 'Sleep entry deleted successfully' });
};
