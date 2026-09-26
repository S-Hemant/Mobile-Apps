import { Router } from 'express';
import authRoutes from './auth.routes';
import workoutRoutes from './workout.routes';
import statsRoutes from './stats.routes';
import nutritionRoutes from './nutrition.routes';
import sleepRoutes from './sleep.routes';
import goalsRoutes from './goals.routes';
import syncRoutes from './sync.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workouts', workoutRoutes);
router.use('/stats', statsRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/sleep', sleepRoutes);
router.use('/goals', goalsRoutes);
router.use('/sync', syncRoutes);

export default router;
