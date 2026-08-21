import { Router } from 'express';
import { getTherapists, getSupervisors, getTherapistCompetency, saveTherapistCompetency, getAllUsers, deleteUser } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/therapists', authenticate, getTherapists);
router.get('/supervisors', authenticate, getSupervisors);
router.get('/therapists/:id/competency', authenticate, getTherapistCompetency);
router.post('/therapists/:id/competency', authenticate, saveTherapistCompetency);
router.get('/', authenticate, getAllUsers);
router.delete('/:id', authenticate, deleteUser);

export default router;
