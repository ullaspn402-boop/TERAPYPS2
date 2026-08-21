import mongoose, { Schema, Document } from 'mongoose';

export interface ITherapyPlan extends Document {
  patientId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  supervisorId?: mongoose.Types.ObjectId;
  goals: {
    title: string;
    baseline: string;
    target: string;
    activities: string[];
    expectedOutcome: string;
    frequency: string;
  }[];
  qualityCheck: {
    passed: boolean;
    warnings: string[];
    errors: string[];
  };
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Revision Requested';
  supervisorFeedback?: string;
}

const therapyPlanSchema = new Schema<ITherapyPlan>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'User' },
    goals: [{
      title: String,
      baseline: String,
      target: String,
      activities: [String],
      expectedOutcome: String,
      frequency: String
    }],
    qualityCheck: {
      passed: { type: Boolean, default: false },
      warnings: [String],
      errors: [String]
    },
    status: { 
      type: String, 
      enum: ['Draft', 'Pending Review', 'Approved', 'Revision Requested'],
      default: 'Draft'
    },
    supervisorFeedback: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<ITherapyPlan>('TherapyPlan', therapyPlanSchema);
