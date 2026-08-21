import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  caseId: string;
  patientId: mongoose.Types.ObjectId;
  therapistId?: mongoose.Types.ObjectId;
  supervisorId?: mongoose.Types.ObjectId;
  complexity: 'Low' | 'Medium' | 'High';
  status: 'NEW' | 'PENDING_ALLOCATION' | 'PENDING_SUPERVISOR_REVIEW' | 'ALLOCATED' | 'PLAN_PENDING' | 'SUPERVISOR_REVIEW' | 'APPROVED' | 'IN_THERAPY' | 'MILESTONE_DUE' | 'PROGRESS_REVIEW' | 'COMPLETED' | 'DISCONTINUED';
  priority: 'Normal' | 'Amber' | 'High';
  priorityScore: number;
  priorityReasons: string[];
}

const caseSchema = new Schema<ICase>(
  {
    caseId: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'User' },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'User' },
    complexity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { 
      type: String, 
      enum: ['NEW', 'PENDING_ALLOCATION', 'PENDING_SUPERVISOR_REVIEW', 'ALLOCATED', 'PLAN_PENDING', 'SUPERVISOR_REVIEW', 'APPROVED', 'IN_THERAPY', 'MILESTONE_DUE', 'PROGRESS_REVIEW', 'COMPLETED', 'DISCONTINUED'],
      default: 'NEW'
    },
    priority: { type: String, enum: ['Normal', 'Amber', 'High'], default: 'Normal' },
    priorityScore: { type: Number, default: 0 },
    priorityReasons: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<ICase>('Case', caseSchema);
