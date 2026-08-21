import mongoose, { Schema, Document } from 'mongoose';

export interface IAIActivity extends Document {
  activityId: string;
  title: string;
  level: 'Sound' | 'Syllable' | 'Word' | 'Sentence' | 'Conversation';
  description: string;
  clinicalRationale: string;
  targetPhoneme: string;
  recommendedDuration: string;
  status: 'suggested' | 'approved' | 'modified' | 'rejected';
  patientId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const aiActivitySchema = new Schema<IAIActivity>(
  {
    activityId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    level: { 
      type: String, 
      enum: ['Sound', 'Syllable', 'Word', 'Sentence', 'Conversation'],
      default: 'Sentence' 
    },
    description: { type: String, required: true },
    clinicalRationale: { type: String, required: true },
    targetPhoneme: { type: String, required: true },
    recommendedDuration: { type: String, default: '15 mins' },
    status: {
      type: String,
      enum: ['suggested', 'approved', 'modified', 'rejected'],
      default: 'suggested'
    },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' }
  },
  { timestamps: true }
);

export default mongoose.model<IAIActivity>('AIActivity', aiActivitySchema);
