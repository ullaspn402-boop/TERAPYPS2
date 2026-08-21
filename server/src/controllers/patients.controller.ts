import { Request, Response } from 'express';
import Patient from '../models/Patient';
import Case from '../models/Case';
import { AuthRequest } from '../middleware/auth';

export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let patientQuery: any = {};

    if (role === 'student_therapist') {
      // FIX: Strictly filter to only THIS therapist's own patients.
      // Do NOT include a $nin fallback — that was leaking other users' patients.
      const myCases = await Case.find({ therapistId: userId }).select('patientId');
      const myPatientIds = myCases.map(c => c.patientId);

      patientQuery = {
        $or: [
          { assignedTherapistId: userId },
          { _id: { $in: myPatientIds } },
        ],
      };
    } else if (role === 'supervisor') {
      // FIX: Supervisor sees ONLY patients whose cases are submitted to them.
      // No empty fallback to all patients — a new supervisor starts with 0.
      const supervisorCases = await Case.find({ supervisorId: userId }).select('patientId');
      const supervisorPatientIds = supervisorCases.map(c => c.patientId);
      patientQuery = { _id: { $in: supervisorPatientIds } };
    } else if (role === 'admin') {
      // Admin sees all
      patientQuery = {};
    } else {
      patientQuery = {};
    }

    const patients = await Patient.find(patientQuery)
      .populate('assignedTherapistId', 'name role avatarType')
      .populate('supervisorId', 'name title avatarType');

    res.json({ success: true, data: patients });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    let patient = await Patient.findById(req.params.id)
      .populate('assignedTherapistId', 'name role avatarType')
      .populate('supervisorId', 'name title avatarType');
    if (!patient) {
      patient = await Patient.findOne({ patientId: req.params.id })
        .populate('assignedTherapistId', 'name role avatarType')
        .populate('supervisorId', 'name title avatarType');
    }
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name, age, gender, primaryLanguage, therapyLanguage,
      targetSound, diagnosis, initialNotes, avatarType
    } = req.body;

    if (!name || !age) {
      return res.status(400).json({ success: false, error: 'Name and age are required' });
    }

    const creatorId = req.user._id;

    // Auto-generate unique IDs
    const count = await Patient.countDocuments();
    const paddedId = String(count + 1).padStart(3, '0');
    const ts = Date.now().toString().slice(-4);
    const patientId = `PT-${paddedId}-${ts}`;

    // Generate case ID
    const caseCount = await Case.countDocuments();
    const caseId = `SLT-${String(200 + caseCount + 1).padStart(3, '0')}`;

    // Create Patient — assign therapistId to the creator
    const patient = await Patient.create({
      patientId,
      caseId,
      name,
      age: Number(age),
      gender: gender || 'Other',
      avatarType: avatarType || 'neutral',
      diagnosis: diagnosis || 'Speech-Language Evaluation Pending',
      targetSound: targetSound || '/r/',
      phoneticDescription: 'Assessment pending',
      currentLevel: 'Sound',
      progressPct: 0,
      status: 'Pending Allocation',
      priority: 'Normal',
      primaryLanguage: primaryLanguage || 'English',
      therapyLanguage: therapyLanguage || 'English',
      assignedTherapistId: creatorId,  // therapist who registered the patient owns them
      sessionCount: 0,
      totalTargetSessions: 16,
      attendancePct: 100,
      baselineScores: { sound: 0, syllable: 0, word: 0, sentence: 0, conversation: 0 },
      currentScores: { sound: 0, syllable: 0, word: 0, sentence: 0, conversation: 0 },
      positionScores: { initial: 0, medial: 0, final: 0 },
      historicalProgress: [],
      goals: [],
      initialNotes: initialNotes || '',
      recentObservation: '',
      suggestedFocus: [],
    });

    // Auto-create the associated Case document linked to this therapist
    await Case.create({
      caseId,
      patientId: patient._id,
      therapistId: creatorId,   // case owner = the therapist who created it
      status: 'NEW',
      complexity: 'Medium',
      priority: 'Normal',
      priorityScore: 0,
      priorityReasons: []
    });

    const populated = await Patient.findById(patient._id)
      .populate('assignedTherapistId', 'name role avatarType')
      .populate('supervisorId', 'name title avatarType');

    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    let patient = await Patient.findById(req.params.id);
    if (!patient) {
      patient = await Patient.findOne({ patientId: req.params.id });
    }
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    Object.assign(patient, req.body);
    await patient.save();

    const updated = await Patient.findById(patient._id)
      .populate('assignedTherapistId', 'name role avatarType')
      .populate('supervisorId', 'name title avatarType');

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
