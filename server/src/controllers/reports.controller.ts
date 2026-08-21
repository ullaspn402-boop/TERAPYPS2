import { Request, Response } from 'express';
import ProgressReport from '../models/ProgressReport';

export const getReportsByPatient = async (req: Request, res: Response) => {
  try {
    const reports = await ProgressReport.find({ patientId: req.params.patientId })
      .populate('therapistId', 'name')
      .populate('supervisorId', 'name');
    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const reports = await ProgressReport.find()
      .populate('therapistId', 'name')
      .populate('supervisorId', 'name');
    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitReport = async (req: Request, res: Response) => {
  try {
    const report = await ProgressReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });

    // Update with latest edits from therapist
    Object.assign(report, req.body);
    report.status = 'Submitted';
    await report.save();

    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const approveReport = async (req: Request, res: Response) => {
  try {
    const report = await ProgressReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });

    report.status = 'Approved';
    report.supervisorFlags = req.body.supervisorFlags || report.supervisorFlags;
    await report.save();

    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
