import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.use('/api/auth', authRoutes);

export default router;
