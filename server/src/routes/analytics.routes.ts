import { Router } from 'express';
import { getAnalyticsSummary } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/summary', authenticate, getAnalyticsSummary);

export default router;
