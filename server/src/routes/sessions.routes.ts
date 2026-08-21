import { Router } from 'express';
import { createSession, getSessionsByPatient } from '../controllers/sessions.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('student_therapist', 'supervisor'), createSession);
router.get('/patient/:patientId', authenticate, getSessionsByPatient);

export default router;
