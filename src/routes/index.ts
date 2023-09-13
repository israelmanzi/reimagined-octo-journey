import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/')

export default router;
