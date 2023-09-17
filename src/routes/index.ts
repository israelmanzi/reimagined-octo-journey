import { Router } from 'express';
import authRoutes from './auth.routes';
import analyticsRoutes from './analytics.routes';
import faqRoutes from './faq.routes';

const router = Router();

router.use('/auth', authRoutes).use('/analytics', analyticsRoutes).use('/faq', faqRoutes);

export default router;
