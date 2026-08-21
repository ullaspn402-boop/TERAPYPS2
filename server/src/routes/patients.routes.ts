import { Router } from 'express';
import { getPatients, getPatientById, updatePatient, createPatient } from '../controllers/patients.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getPatients);
router.post('/', authenticate, createPatient);
router.get('/:id', authenticate, getPatientById);
router.put('/:id', authenticate, updatePatient);

export default router;
