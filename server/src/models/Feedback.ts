import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  caseId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  supervisorId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  therapyPlanId?: mongoose.Types.ObjectId;
  comment: string;
  rating?: number;
  status: 'Pending' | 'Addressed' | 'Resolved';
}

const feedbackSchema = new Schema<IFeedback>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    therapyPlanId: { type: Schema.Types.ObjectId, ref: 'TherapyPlan' },
    comment: { type: String, required: true },
    rating: { type: Number },
    status: { type: String, enum: ['Pending', 'Addressed', 'Resolved'], default: 'Pending' }
  },
  { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);
