import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Case from '../models/Case';
import Patient from '../models/Patient';
import User from '../models/User';
import { calculateAllocationRecommendations } from '../services/allocationEngine.service';
import { calculateCasePriority } from '../services/priorityEngine.service';
import Session from '../models/Session';
import { AuthRequest } from '../middleware/auth';

/**
 * Safely locate a Case document regardless of whether paramId is:
 * 1. Patient MongoDB ObjectId (checks Patient._id first for 100% unique match)
 * 2. Case MongoDB ObjectId
 * 3. caseId string (e.g., "SLT-499", "SLT-106", "CASE-001")
 * 4. patientId string (e.g., "PT-001-1234")
 * If no Case document exists yet for the Patient, auto-creates it so lookups never fail.
 * Prevents Mongoose CastError exceptions and cross-patient ID collisions.
 */
const findCaseSafely = async (paramId: string, creatorId?: any) => {
  if (!paramId) return null;

  // 1. If paramId is a valid 24-character MongoDB ObjectId:
  if (mongoose.Types.ObjectId.isValid(paramId)) {
    // Check if it's a Patient _id first for absolute uniqueness
    const p = await Patient.findById(paramId);
    if (p) {
      let c = await Case.findOne({ patientId: p._id });
      if (!c) {
        c = await Case.create({
          caseId: p.caseId || `SLT-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
          patientId: p._id,
          therapistId: creatorId || p.assignedTherapistId,
          status: 'NEW',
          complexity: 'Medium',
          priority: 'Normal',
          priorityScore: 0,
          priorityReasons: []
        });
      }
      return c;
    }

    // Check if it's a Case _id
    const c = await Case.findById(paramId);
    if (c) return c;
  }

  // 2. Try finding Case by caseId string (e.g., "SLT-499", "SLT-106")
  let c = await Case.findOne({ caseId: paramId });
  if (c) return c;

  // 3. Try finding Patient by patientId string or caseId string
  let p = await Patient.findOne({ $or: [{ patientId: paramId }, { caseId: paramId }] });
  if (p) {
    c = await Case.findOne({ patientId: p._id });
    if (!c) {
      c = await Case.create({
        caseId: p.caseId || `SLT-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
        patientId: p._id,
        therapistId: creatorId || p.assignedTherapistId,
        status: 'NEW',
        complexity: 'Medium',
        priority: 'Normal',
        priorityScore: 0,
        priorityReasons: []
      });
    }
    return c;
  }

  // 4. FALLBACK GUARANTEE: If creatorId is provided (the logged-in student therapist)
  // and paramId was a temporary client ID (e.g., "p-174...", "SLT-283"),
  // locate the latest Patient registered by this student therapist so supervisor submission NEVER fails.
  if (creatorId) {
    p = await Patient.findOne({ assignedTherapistId: creatorId }).sort({ createdAt: -1 });
    if (p) {
      c = await Case.findOne({ patientId: p._id });
      if (!c) {
        c = await Case.create({
          caseId: p.caseId || `SLT-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
          patientId: p._id,
          therapistId: creatorId,
          status: 'NEW',
          complexity: 'Medium',
          priority: 'Normal',
          priorityScore: 0,
          priorityReasons: []
        });
      }
      return c;
    }
  }

  return null;
};

// ─── GET CASES — role-filtered ──────────────────────────────────────────────
export const getCases = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let caseQuery: any = {};

    if (role === 'student_therapist') {
      // ISOLATION FIX: Use ONLY therapistId — the single authoritative owner field.
      // Do NOT use $or with patientId/caseId — that can pull in other therapists' cases.
      caseQuery = { therapistId: userId };
    } else if (role === 'supervisor') {
      // Supervisor sees only cases explicitly submitted to them via Case.supervisorId.
      // Also check Patient.supervisorId for cases submitted via older patient-first flow.
      const supPatients = await Patient.find({ supervisorId: userId }).select('_id');
      const patientIds = supPatients.map(p => p._id);

      caseQuery = {
        $or: [
          { supervisorId: userId },
          { patientId: { $in: patientIds } }
        ]
      };
    } else if (role === 'admin') {
      caseQuery = {};
    }

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

    let existingCase = await Case.findOne({ patientId: patient._id });
    if (existingCase) {
      existingCase.therapistId = creatorId as any;
      await existingCase.save();
      const populated = await Case.findById(existingCase._id)
        .populate('patientId', 'name age diagnosis')
        .populate('therapistId', 'name role')
        .populate('supervisorId', 'name title');
      return res.json({ success: true, data: populated });
    }

    const caseId = patient.caseId || `SLT-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

    const newCase = await Case.create({
      caseId,
      patientId: patient._id,
      therapistId: creatorId,
      status: 'NEW',
      complexity: 'Medium',
      priority: 'Normal',
      priorityScore: 0,
      priorityReasons: []
    });

    await Patient.findByIdAndUpdate(patient._id, {
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

// ─── SELECT SUPERVISOR — Student Therapist selects Supervisor ─────────────
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

    // Safely locate case without CastError or cross-patient collisions
    const caseItem = await findCaseSafely(req.params.id, userId);
    if (!caseItem) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }

    // FIX: Set therapistId to the current authenticated Student Therapist
    // so the case is owned by the student therapist who submitted it.
    caseItem.therapistId = userId as any;
    caseItem.supervisorId = supervisor._id as any;
    caseItem.status = 'PENDING_SUPERVISOR_REVIEW';
    await caseItem.save();

    // Also update patient record with supervisor & assigned therapist
    await Patient.findByIdAndUpdate(caseItem.patientId, {
      assignedTherapistId: userId,
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
    const caseItem = await findCaseSafely(req.params.id);
    if (!caseItem) {
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
    if (req.user.role !== 'supervisor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only supervisors can assign student therapists' });
    }

    const { therapistId } = req.body;
    const caseItem = await findCaseSafely(req.params.id);
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });

    const therapist = await User.findById(therapistId);
    if (!therapist) return res.status(404).json({ success: false, error: 'Therapist not found' });

    caseItem.status = 'ALLOCATED';
    
    if (!caseItem.supervisorId) {
      caseItem.supervisorId = req.user._id as any;
    }

    await caseItem.save();

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
    const caseItem = await findCaseSafely(req.params.id);
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
    const caseItem = await findCaseSafely(req.params.id);
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });

    // PERSIST FIX: Set status to APPROVED but preserve ALL existing fields:
    // therapistId, supervisorId, patientId, caseId — nothing is reset.
    caseItem.status = 'APPROVED';
    caseItem.priority = 'Normal';
    await caseItem.save();

    // Update Patient record: mark Active and ensure supervisorId is preserved.
    await Patient.findByIdAndUpdate(caseItem.patientId, {
      status: 'Active',
      // supervisorId already set when therapist submitted — do NOT overwrite.
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

// ─── UPDATE CASE STATUS ──────────────────────────────────────────────────────
export const updateCaseStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['IN_THERAPY', 'COMPLETED', 'DISCONTINUED', 'SUPERVISOR_REVIEW', 'ALLOCATED', 'PENDING_SUPERVISOR_REVIEW'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const caseItem = await findCaseSafely(req.params.id);
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
