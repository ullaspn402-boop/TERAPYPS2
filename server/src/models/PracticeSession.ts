import mongoose, { Schema, Document } from 'mongoose';

export interface IPracticeSession extends Document {
  patientId: mongoose.Types.ObjectId;
  activityType: string; // e.g., 'SpeechPracticeStudio', 'AdaptiveTherapy'
  date: Date;
  durationMinutes: number;
  level: string;
  targetSound: string;
  accuracyScore: number;
  trialsCompleted: number;
  completedBy: 'patient_independent' | 'therapist_assisted';
  therapistId?: mongoose.Types.ObjectId;
}

const practiceSessionSchema = new Schema<IPracticeSession>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    activityType: { type: String, required: true },
    date: { type: Date, default: Date.now },
    durationMinutes: { type: Number, required: true },
    level: { type: String },
    targetSound: { type: String },
    accuracyScore: { type: Number, default: 0 },
    trialsCompleted: { type: Number, default: 0 },
    completedBy: { type: String, enum: ['patient_independent', 'therapist_assisted'] },
    therapistId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model<IPracticeSession>('PracticeSession', practiceSessionSchema);
