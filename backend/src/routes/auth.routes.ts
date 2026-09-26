import { Router } from 'express';
import { register, login, demoLogin, getMe, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo', demoLogin);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
