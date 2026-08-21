import { Router } from 'express';
import {
  createTherapyPlan,
  checkPlanQuality,
  submitPlan,
  approvePlan,
  getTherapyPlansByPatient,
  getTherapyPlanById,
  updateTherapyPlan,
  requestPlanChanges,
} from '../controllers/therapyPlans.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getTherapyPlansByPatient);
router.post('/', authenticate, authorize('student_therapist'), createTherapyPlan);
router.get('/:id', authenticate, getTherapyPlanById);
router.patch('/:id', authenticate, updateTherapyPlan);
router.post('/:id/check', authenticate, checkPlanQuality);
router.post('/:id/submit', authenticate, authorize('student_therapist'), submitPlan);
router.post('/:id/approve', authenticate, authorize('supervisor'), approvePlan);
router.post('/:id/request-changes', authenticate, authorize('supervisor'), requestPlanChanges);

export default router;
