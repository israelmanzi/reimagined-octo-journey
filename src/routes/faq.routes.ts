import { Router } from 'express';
import { FAQController } from '../controllers/faq.controller';
import errorHandler from '../utils/errorHandler';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router
  .get('/faq/', errorHandler(FAQController.getAllFAQs))
  .get('/faq/:id', errorHandler(FAQController.getFAQById))
  .post('/faq/', authMiddleware, errorHandler(FAQController.createFAQ))
  .put('/faq/:id', authMiddleware, errorHandler(FAQController.updateFAQ))
  .delete('/faq/:id', authMiddleware, errorHandler(FAQController.deleteFAQ));

export default router;
