import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { ProfileController } from '../controllers/profile.controller';
import errorHandler from '../utils/errorHandler';
import { adminMiddleware, authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router
  .post('/generate-auth-token', errorHandler(AuthController.login))
  .post('/register', adminMiddleware, errorHandler(AuthController.create))
  .post('/refresh-token/:userId', errorHandler(AuthController.refreshToken))
  .post('/verify-account', authMiddleware, errorHandler(AuthController.verifyAccount))
  .get('/generate-verification-code', authMiddleware, errorHandler(AuthController.generateVerificationCode))
  .post('/password-reset', errorHandler(AuthController.passwordReset))
  .get('/generate-reset-code', errorHandler(AuthController.generatePasswordResetCode))
  .get('/me', authMiddleware, errorHandler(ProfileController.get))
  .put('/me/deactivate', authMiddleware, errorHandler(ProfileController.deactivate));

export default router;
