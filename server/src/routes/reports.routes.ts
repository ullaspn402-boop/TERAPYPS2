import { Router } from 'express';
import { getReportsByPatient, submitReport, approveReport, getAllReports } from '../controllers/reports.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllReports);
router.get('/patient/:patientId', authenticate, getReportsByPatient);
router.post('/:id/submit', authenticate, authorize('student_therapist', 'supervisor'), submitReport);
router.post('/:id/approve', authenticate, authorize('supervisor', 'admin'), approveReport);

export default router;
