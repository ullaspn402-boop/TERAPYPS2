import { Router } from 'express';
import {
  getCases,
  createCase,
  getCaseAllocationRecommendations,
  allocateCase,
  selectSupervisor,
  recalculateCasePriority,
  approveCase,
  updateCaseStatus
} from '../controllers/cases.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getCases);
router.post('/', authenticate, createCase);
router.get('/:id/allocation-recommendations', authenticate, getCaseAllocationRecommendations);
router.post('/:id/allocate', authenticate, allocateCase);
router.patch('/:id/supervisor', authenticate, selectSupervisor);
router.post('/:id/recalculate-priority', authenticate, recalculateCasePriority);
router.post('/:id/approve', authenticate, approveCase);
router.patch('/:id/status', authenticate, updateCaseStatus);

export default router;
