import { Request, Response } from 'express';
import Case from '../models/Case';
import Patient from '../models/Patient';
import User from '../models/User';
import { calculateAllocationRecommendations } from '../services/allocationEngine.service';
import { calculateCasePriority } from '../services/priorityEngine.service';
import Session from '../models/Session';
import { AuthRequest } from '../middleware/auth';

// ─── GET CASES — role-filtered ──────────────────────────────────────────────
export const getCases = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let caseQuery: any = {};

    if (role === 'student_therapist') {
      // FIX: Strictly show ONLY cases where this therapist is the creator/owner.
      // Do NOT include a $nin fallback — that was leaking other users' cases.
      caseQuery = { therapistId: userId };
    } else if (role === 'supervisor') {
      // FIX: Supervisor sees ONLY cases explicitly submitted to them.
      // No empty fallback to all cases — a new supervisor starts with 0.
      caseQuery = { supervisorId: userId };
    } else if (role === 'admin') {
      caseQuery = {};
    }
    // patient role — no cases

    const cases = await Case.find(caseQuery)
      .populate('patientId', 'name age diagnosis')
      .populate('therapistId', 'name role')
      .populate('supervisorId', 'name title');

    res.json({ success: true, data: cases });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── CREATE CASE — student_therapist creates a case for a patient ────────────
export const createCase = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.body;
    const creatorId = req.user._id;

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patientId is required' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // Check if a case already exists for this patient
    let existingCase = await Case.findOne({ patientId });
    if (existingCase) {
      // Update the therapistId if not set
      if (!existingCase.therapistId) {
        existingCase.therapistId = creatorId as any;
        await existingCase.save();
      }
      const populated = await Case.findById(existingCase._id)
        .populate('patientId', 'name age diagnosis')
        .populate('therapistId', 'name role')
        .populate('supervisorId', 'name title');
      return res.json({ success: true, data: populated });
    }

    const count = await Case.countDocuments();
    const caseId = `CASE-${String(count + 1).padStart(3, '0')}`;

    const newCase = await Case.create({
      caseId,
      patientId,
      therapistId: creatorId,
      status: 'NEW',
      complexity: 'Medium',
      priority: 'Normal',
      priorityScore: 0,
      priorityReasons: []
    });

    // Update patient with therapist
    await Patient.findByIdAndUpdate(patientId, {
      assignedTherapistId: creatorId
    });

    const populated = await Case.findById(newCase._id)
      .populate('patientId', 'name age diagnosis')
      .populate('therapistId', 'name role')
      .populate('supervisorId', 'name title');

    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── SELECT SUPERVISOR — therapist chooses supervisor for a case ─────────────
export const selectSupervisor = async (req: AuthRequest, res: Response) => {
  try {
    const { supervisorId } = req.body;
    const userId = req.user._id;

    if (!supervisorId) {
      return res.status(400).json({ success: false, error: 'supervisorId is required' });
    }

    const supervisor = await User.findById(supervisorId);
    if (!supervisor || supervisor.role !== 'supervisor') {
      return res.status(404).json({ success: false, error: 'Supervisor not found' });
    }

    // Find the case — try by MongoDB _id first, then by caseId string, then by patientId
    // This handles all cases: seeded data (caseId string), new cases (MongoDB _id), and
    // cases created via createPatient where the patient's _id is passed.
    let caseItem = await Case.findById(req.params.id).catch(() => null);
    if (!caseItem) caseItem = await Case.findOne({ caseId: req.params.id });
    if (!caseItem) caseItem = await Case.findOne({ patientId: req.params.id });
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });

    // Only the case creator (therapistId) or admin can select a supervisor
    if (req.user.role !== 'admin' && String(caseItem.therapistId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        error: 'You do not own this case. Only the therapist who created this case can assign a supervisor.',
      });
    }

    caseItem.supervisorId = supervisor._id as any;
    caseItem.status = 'PENDING_SUPERVISOR_REVIEW';
    await caseItem.save();

    // Also update patient with supervisor
    await Patient.findByIdAndUpdate(caseItem.patientId, {
      supervisorId: supervisor._id,
      status: 'Pending Allocation'
    });

    const populated = await Case.findById(caseItem._id)
      .populate('patientId', 'name age diagnosis')
      .populate('therapistId', 'name role')
      .populate('supervisorId', 'name title');

    res.json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET ALLOCATION RECOMMENDATIONS ─────────────────────────────────────────
export const getCaseAllocationRecommendations = async (req: Request, res: Response) => {
  try {
    let caseItem = await Case.findById(req.params.id).catch(() => null);
    if (!caseItem) caseItem = await Case.findOne({ patientId: req.params.id });
    if (!caseItem) {
      console.log('Failed to find case for ID:', req.params.id);
      return res.status(404).json({ success: false, error: 'Case not found' });
    }
    
    const patient = await Patient.findById(caseItem.patientId);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

    const therapists = await User.find({ role: 'student_therapist' });
    const supervisorCap = {}; 

    const recommendations = calculateAllocationRecommendations(patient, therapists, supervisorCap);
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── ALLOCATE CASE — supervisor assigns a student therapist ─────────────────
export const allocateCase = async (req: AuthRequest, res: Response) => {
  try {
    // Only supervisors and admins can allocate
    if (req.user.role !== 'supervisor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only supervisors can assign student therapists' });
    }

    const { therapistId } = req.body;
    let caseItem = await Case.findById(req.params.id).catch(() => null);
    if (!caseItem) caseItem = await Case.findOne({ patientId: req.params.id });
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });

    const therapist = await User.findById(therapistId);
    if (!therapist) return res.status(404).json({ success: false, error: 'Therapist not found' });

    caseItem.status = 'ALLOCATED';
    
    // Preserve the original therapistId (case creator) and set supervisor
    if (!caseItem.supervisorId) {
      caseItem.supervisorId = req.user._id as any;
    }

    await caseItem.save();

    // Update patient with the ASSIGNED student therapist
    await Patient.findByIdAndUpdate(caseItem.patientId, {
      assignedTherapistId: therapist._id,
      supervisorId: caseItem.supervisorId,
      status: 'Active'
    });

    res.json({ success: true, data: caseItem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── RECALCULATE PRIORITY ────────────────────────────────────────────────────
export const recalculateCasePriority = async (req: Request, res: Response) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });

    const patient = await Patient.findById(caseItem.patientId);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

    const recentSessions = await Session.find({ caseId: caseItem._id }).sort({ date: -1 }).limit(3);
    
    const priorityResult = calculateCasePriority(patient, caseItem, recentSessions);
    
    caseItem.priorityScore = priorityResult.priorityScore;
    caseItem.priority = priorityResult.priorityLevel === 'HIGH' ? 'High' : 
                        priorityResult.priorityLevel === 'REVIEW_SOON' ? 'Amber' : 'Normal';
    caseItem.priorityReasons = priorityResult.reasons;
    await caseItem.save();

    res.json({ success: true, data: priorityResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── APPROVE CASE ────────────────────────────────────────────────────────────
export const approveCase = async (req: Request, res: Response) => {
  try {
    let caseItem = await Case.findById(req.params.id).catch(() => null);
    if (!caseItem) caseItem = await Case.findOne({ caseId: req.params.id });
    if (!caseItem) caseItem = await Case.findOne({ patientId: req.params.id });
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });

    caseItem.status = 'APPROVED';
    caseItem.priority = 'Normal';
    await caseItem.save();

    res.json({ success: true, data: caseItem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── UPDATE CASE STATUS ──────────────────────────────────────────────────────
export const updateCaseStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['IN_THERAPY', 'COMPLETED', 'DISCONTINUED', 'SUPERVISOR_REVIEW', 'ALLOCATED', 'PENDING_SUPERVISOR_REVIEW'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    let caseItem = await Case.findById(req.params.id).catch(() => null);
    if (!caseItem) caseItem = await Case.findOne({ caseId: req.params.id });
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });

    caseItem.status = status as any;
    await caseItem.save();

    if (status === 'COMPLETED') {
      await Patient.findByIdAndUpdate(caseItem.patientId, { status: 'Completed' });
    } else if (status === 'DISCONTINUED') {
      await Patient.findByIdAndUpdate(caseItem.patientId, { status: 'Review Needed' });
    }

    res.json({ success: true, data: caseItem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
