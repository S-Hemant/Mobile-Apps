import { Router } from 'express';
import { syncData } from '../controllers/sync.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', syncData);

export default router;
