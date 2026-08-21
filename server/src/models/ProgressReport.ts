import mongoose, { Schema, Document } from 'mongoose';

export interface IProgressReport extends Document {
  patientId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  supervisorId?: mongoose.Types.ObjectId;
  sessionRange: { start: number; end: number };
  initialAssessmentSummary: string;
  goalsProgress: {
    goalTitle: string;
    baselinePct: number;
    currentPct: number;
    status: string;
  }[];
  baselineScores: any;
  currentScores: any;
  attendancePct: number;
  trendAnalysis: string;
  therapistObservations: string;
  supervisorFlags: string[];
  status: 'Draft' | 'Submitted' | 'Approved' | 'Revision Requested';
  createdAt: Date;
  updatedAt: Date;
}

const progressReportSchema = new Schema<IProgressReport>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionRange: {
      start: { type: Number },
      end: { type: Number }
    },
    initialAssessmentSummary: { type: String },
    goalsProgress: [{
      goalTitle: String,
      baselinePct: Number,
      currentPct: Number,
      status: String
    }],
    baselineScores: { type: Schema.Types.Mixed },
    currentScores: { type: Schema.Types.Mixed },
    attendancePct: { type: Number },
    trendAnalysis: { type: String },
    therapistObservations: { type: String },
    supervisorFlags: [{ type: String }],
    status: { 
      type: String, 
      enum: ['Draft', 'Submitted', 'Approved', 'Revision Requested'],
      default: 'Draft'
    }
  },
  { timestamps: true }
);

export default mongoose.model<IProgressReport>('ProgressReport', progressReportSchema);
