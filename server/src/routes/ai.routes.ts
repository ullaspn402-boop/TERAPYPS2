import { Router } from 'express';
import {
  askAssistant,
  getAIActivities,
  updateAIActivityStatus,
  checkPlanQualityHandler,
  getAdaptiveTherapyRecommendation,
  generateProgressSummaryHandler,
  getSupervisorPriority,
  getSupervisorPriorityForCase,
  getCaseAllocationHandler,
} from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// ── Existing routes (preserved) ───────────────────────────────────────────────
router.post('/assistant', authenticate, askAssistant);
router.get('/activities', authenticate, getAIActivities);
router.put('/activities/:id', authenticate, updateAIActivityStatus);

// ── AI Feature #2: Case Allocation ────────────────────────────────────────────
// POST /api/ai/case-allocation  { caseId? OR patientId? }
router.post('/case-allocation', authenticate, getCaseAllocationHandler);

// ── AI Feature #3: Plan Quality Check ──────────────────────────────────────────
// POST /api/ai/plan-quality  { planId? OR plan: {...} }
router.post('/plan-quality', authenticate, checkPlanQualityHandler);

// ── AI Feature #4: Adaptive Therapy Recommendation ────────────────────────────
// POST /api/ai/adaptive-therapy  { patientId }
router.post('/adaptive-therapy', authenticate, getAdaptiveTherapyRecommendation);

// ── AI Feature #5: Progress Summary ───────────────────────────────────────────
// POST /api/ai/progress-summary  { patientId, sessionRange?: { start, end } }
router.post('/progress-summary', authenticate, generateProgressSummaryHandler);

// ── AI Feature #6: Supervisor Priority Intelligence ───────────────────────────
// GET  /api/ai/supervisor-priority          → all active cases ranked by priority
// GET  /api/ai/supervisor-priority/:caseId  → single case priority
router.get('/supervisor-priority', authenticate, getSupervisorPriority);
router.get('/supervisor-priority/:caseId', authenticate, getSupervisorPriorityForCase);

export default router;

