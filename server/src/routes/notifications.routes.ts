import { Router } from 'express';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Note: read-all must come before /:id/read so Express doesn't treat "read-all" as a param
router.get('/', authenticate, getNotifications);
router.put('/read-all', authenticate, markAllNotificationsRead);
router.put('/:id/read', authenticate, markNotificationRead);

export default router;
