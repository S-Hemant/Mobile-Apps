import { Router } from 'express';
import {
  getTodayStats,
  updateTodayStats,
  getStatsHistory,
  getStatsSummary,
} from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/today', getTodayStats);
router.post('/today', updateTodayStats);
router.put('/today', updateTodayStats);
router.get('/history', getStatsHistory);
router.get('/summary', getStatsSummary);

export default router;
