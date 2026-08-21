import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  patientId: mongoose.Types.ObjectId;
  caseId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  sessionNumber: number;
  date: Date;
  durationMinutes: number;
  level: 'Sound' | 'Syllable' | 'Word' | 'Sentence' | 'Conversation';
  targetSound: string;
  speechPerformanceScore: number;
  phonemeAccuracyScore: number;
  audioQuality: 'Excellent' | 'Good' | 'Fair';
  attendance: 'Present' | 'Absent' | 'Late';
  stimulusItems: {
    prompt: string;
    score: number;
    phonemeResult: 'Correct' | 'Distorted' | 'Substituted' | 'Omitted';
  }[];
  soapNotes: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  therapistConfidence: number;
  activities: string[];
  supervisorFeedback?: {
    supervisorId: mongoose.Types.ObjectId;
    comment: string;
    rating: number; // 1-5
    date: Date;
  };
}

const sessionSchema = new Schema<ISession>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    level: { type: String, enum: ['Sound', 'Syllable', 'Word', 'Sentence', 'Conversation'] },
    targetSound: { type: String },
    speechPerformanceScore: { type: Number, default: 0 },
    phonemeAccuracyScore: { type: Number, default: 0 },
    audioQuality: { type: String, enum: ['Excellent', 'Good', 'Fair'], default: 'Good' },
    attendance: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
    stimulusItems: [{
      prompt: String,
      score: Number,
      phonemeResult: { type: String, enum: ['Correct', 'Distorted', 'Substituted', 'Omitted'] }
    }],
    soapNotes: {
      subjective: String,
      objective: String,
      assessment: String,
      plan: String
    },
    therapistConfidence: { type: Number, default: 5 },
    activities: [{ type: String }],
    supervisorFeedback: {
      supervisorId: { type: Schema.Types.ObjectId, ref: 'User' },
      comment: String,
      rating: Number,
      date: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model<ISession>('Session', sessionSchema);
