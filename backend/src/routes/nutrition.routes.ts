import { Router } from 'express';
import {
  getNutrition,
  addNutrition,
  deleteNutrition,
} from '../controllers/nutrition.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNutrition);
router.post('/', addNutrition);
router.delete('/:id', deleteNutrition);

export default router;
