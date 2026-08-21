import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluation extends Document {
  therapistId: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  supervisorId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  planning: number;
  goalSetting: number;
  documentation: number;
  sessionHandling: number;
  clinicalReasoning: number;
  overallRating: number;
  comments: string;
  date: Date;
}

const evaluationSchema = new Schema<IEvaluation>(
  {
    therapistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    planning: { type: Number, required: true },
    goalSetting: { type: Number, required: true },
    documentation: { type: Number, required: true },
    sessionHandling: { type: Number, required: true },
    clinicalReasoning: { type: Number, required: true },
    overallRating: { type: Number, required: true },
    comments: { type: String },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model<IEvaluation>('Evaluation', evaluationSchema);
