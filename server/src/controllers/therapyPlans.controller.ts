import { Request, Response } from 'express';
import TherapyPlan from '../models/TherapyPlan';
import Case from '../models/Case';
import { checkTherapyPlanCompleteness } from '../services/qualityGate.service';

export const getTherapyPlansByPatient = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    const filter: any = {};
    if (patientId) filter.patientId = patientId;
    const plans = await TherapyPlan.find(filter)
      .populate('therapistId', 'name role avatarType')
      .populate('supervisorId', 'name title')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTherapyPlanById = async (req: Request, res: Response) => {
  try {
    const plan = await TherapyPlan.findById(req.params.id)
      .populate('therapistId', 'name role avatarType')
      .populate('supervisorId', 'name title');
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTherapyPlan = async (req: Request, res: Response) => {
  try {
    const plan = await TherapyPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    if (req.body.goals !== undefined) plan.goals = req.body.goals;
    if (req.body.status !== undefined) plan.status = req.body.status;
    await plan.save();
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const requestPlanChanges = async (req: Request, res: Response) => {
  try {
    const plan = await TherapyPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    plan.status = 'Revision Requested';
    plan.supervisorFeedback = req.body.feedback || '';
    await plan.save();
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const createTherapyPlan = async (req: Request, res: Response) => {
  try {
    const { caseId, patientId, goals } = req.body;
    
    const caseItem = await Case.findById(caseId);
    if (!caseItem) return res.status(404).json({ success: false, error: 'Case not found' });

    const newPlan = await TherapyPlan.create({
      caseId,
      patientId,
      therapistId: (req as any).user._id,
      supervisorId: caseItem.supervisorId,
      goals,
      status: 'Draft'
    });

    res.status(201).json({ success: true, data: newPlan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const checkPlanQuality = async (req: Request, res: Response) => {
  try {
    const plan = await TherapyPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

    const result = checkTherapyPlanCompleteness(plan);
    
    plan.qualityCheck = result;
    await plan.save();

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitPlan = async (req: Request, res: Response) => {
  try {
    const plan = await TherapyPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

    const result = checkTherapyPlanCompleteness(plan);
    if (!result.passed) {
      return res.status(400).json({ success: false, error: 'Plan failed quality check. Cannot submit.', details: result.errors });
    }

    plan.status = 'Pending Review';
    await plan.save();

    const caseItem = await Case.findById(plan.caseId);
    if (caseItem) {
      caseItem.status = 'SUPERVISOR_REVIEW';
      await caseItem.save();
    }

    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const approvePlan = async (req: Request, res: Response) => {
  try {
    const plan = await TherapyPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

    plan.status = 'Approved';
    await plan.save();

    const caseItem = await Case.findById(plan.caseId);
    if (caseItem) {
      caseItem.status = 'IN_THERAPY';
      await caseItem.save();
    }

    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
