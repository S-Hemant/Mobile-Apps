import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { db } from '../database/db';

export const syncData = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user?.id || 'user_default';
    const { workouts, dailyStats, nutrition, sleep, goals } = req.body;

    const updatedState = db.batchSync(userId, {
      workouts,
      dailyStats,
      nutrition,
      sleep,
      goals,
    });

    res.json({
      success: true,
      message: 'State synchronized successfully',
      data: updatedState,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
