import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import errorHandler from '../utils/errorHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { ProfileController } from '../controllers/profile.controller';

const router = Router();

router
  .post('/generate-auth-token', errorHandler(AuthController.login))
  .post('/register', errorHandler(AuthController.create))
  .post('/refresh-token/:userId', errorHandler(AuthController.refreshToken))
  .post('/verify-account', authMiddleware, errorHandler(AuthController.verifyAccount))
  .post('/generate-verification-code', authMiddleware, errorHandler(AuthController.generateVerificationCode))
  .post('/password-reset', errorHandler(AuthController.passwordReset))
  .post('/generate-reset-token', errorHandler(AuthController.generatePasswordResetCode))
  .get('/me', authMiddleware, errorHandler(ProfileController.get))
  .put('/me/deactivate', authMiddleware, errorHandler(ProfileController.deactivate));

export default router;
