import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import errorHandler from '../utils/errorHandler';
import { adminMiddleware, authMiddleware } from '../middlewares/auth.middleware';
import { ProfileController } from '../controllers/profile.controller';

const router = Router();

router
  .post('/upload-data', [authMiddleware], errorHandler(ProfileController.updateWithCurrentStatus))
  .post('/register-device', [authMiddleware], errorHandler(AnalyticsController.registerDevice))
  .get('/devices', [adminMiddleware], errorHandler(AnalyticsController.getAllDevices))
  .get('/devices/:id', [adminMiddleware], errorHandler(AnalyticsController.getDeviceById))
  .put('/devices/:id', [adminMiddleware], errorHandler(AnalyticsController.updateDevice))
  .put('/devices/:id/deactivate', [adminMiddleware], errorHandler(AnalyticsController.deactivateDevice))
  .put('/devices/:id/activate', [adminMiddleware], errorHandler(AnalyticsController.activateDevice))
  .get('/devices/active-devices', [adminMiddleware], errorHandler(AnalyticsController.getActiveDevices))
  .get('/devices/inactive-devices', [adminMiddleware], errorHandler(AnalyticsController.getInactiveDevices));

export default router;
