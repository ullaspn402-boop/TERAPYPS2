import { Request, Response } from 'express';
import User from '../models/User';
import Evaluation from '../models/Evaluation';
import Case from '../models/Case';
import Patient from '../models/Patient';
import { AuthRequest } from '../middleware/auth';

// GET all student therapists (for supervisor's allocation view)
export const getTherapists = async (req: Request, res: Response) => {
  try {
    const therapists = await User.find({ role: 'student_therapist' }).populate('supervisorId', 'name');
    res.json({ success: true, data: therapists });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET all supervisors (for therapist's supervisor selection)
export const getSupervisors = async (req: Request, res: Response) => {
  try {
    const supervisors = await User.find({ role: 'supervisor' }).select('_id name email title specialties activeCaseload maxCaseload avatarType');
    res.json({ success: true, data: supervisors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTherapistCompetency = async (req: Request, res: Response) => {
  try {
    const therapist = await User.findById(req.params.id);
    if (!therapist || therapist.role !== 'student_therapist') {
      return res.status(404).json({ success: false, error: 'Therapist not found' });
    }

    const evaluations = await Evaluation.find({ therapistId: req.params.id });

    if (evaluations.length === 0) {
      return res.json({ 
        success: true, 
        data: { 
          planning: 0, goalSetting: 0, documentation: 0, sessionHandling: 0, clinicalReasoning: 0, overallAverage: 0 
        } 
      });
    }

    const sums = evaluations.reduce((acc, curr) => {
      acc.planning += curr.planning;
      acc.goalSetting += curr.goalSetting;
      acc.documentation += curr.documentation;
      acc.sessionHandling += curr.sessionHandling;
      acc.clinicalReasoning += curr.clinicalReasoning;
      return acc;
    }, { planning: 0, goalSetting: 0, documentation: 0, sessionHandling: 0, clinicalReasoning: 0 });

    const count = evaluations.length;
    const avg = (val: number) => Math.round(val / count);

    const competency = {
      planning: avg(sums.planning),
      goalSetting: avg(sums.goalSetting),
      documentation: avg(sums.documentation),
      sessionHandling: avg(sums.sessionHandling),
      clinicalReasoning: avg(sums.clinicalReasoning),
      overallAverage: avg(sums.planning + sums.goalSetting + sums.documentation + sums.sessionHandling + sums.clinicalReasoning) / 5
    };

    res.json({ success: true, data: competency });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const saveTherapistCompetency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { planning, goalSetting, documentation, sessionHandling, clinicalReasoning, comments } = req.body;

    const therapist = await User.findById(id);
    if (!therapist || therapist.role !== 'student_therapist') {
      return res.status(404).json({ success: false, error: 'Therapist not found' });
    }

    const supervisorId = (req as any).user._id;

    const ratings = [planning, goalSetting, documentation, sessionHandling, clinicalReasoning]
      .map(Number).filter(n => !isNaN(n));
    const overallRating = ratings.length > 0
      ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
      : 0;

    const evaluation = await Evaluation.create({
      therapistId: id,
      supervisorId,
      planning: Number(planning) || 0,
      goalSetting: Number(goalSetting) || 0,
      documentation: Number(documentation) || 0,
      sessionHandling: Number(sessionHandling) || 0,
      clinicalReasoning: Number(clinicalReasoning) || 0,
      overallRating,
      comments: comments || '',
      date: new Date(),
    });

    res.status(201).json({ success: true, data: evaluation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET all users (Admin only)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    const users = await User.find().select('-passwordHash').sort({ role: 1, name: 1 });
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE user by ID (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    // Delete associated cases and patients
    await Case.deleteMany({ therapistId: id });
    await Patient.deleteMany({ assignedTherapistId: id });
    await Evaluation.deleteMany({ therapistId: id });
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: `User ${user.name} deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
