import { Router } from 'express';
import {
  getSleep,
  addSleep,
  deleteSleep,
} from '../controllers/sleep.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSleep);
router.post('/', addSleep);
router.delete('/:id', deleteSleep);

export default router;
