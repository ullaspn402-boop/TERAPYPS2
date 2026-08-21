import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../../../src/types'; // We'll redefine or omit import since backend should be standalone.

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'student_therapist' | 'supervisor' | 'patient';
  gender?: string;
  avatarType?: string; // male, female, neutral
  specialties?: string[];
  experienceYears?: number;
  availability?: string;
  supervisorId?: mongoose.Types.ObjectId; // For students
  activeCaseload?: number;
  maxCaseload?: number;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['admin', 'student_therapist', 'supervisor', 'patient'], 
      required: true 
    },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    avatarType: { type: String, enum: ['male', 'female', 'neutral'], default: 'neutral' },
    
    // Therapist/Supervisor specific
    specialties: [{ type: String }],
    experienceYears: { type: Number },
    availability: { type: String },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'User' },
    activeCaseload: { type: Number, default: 0 },
    maxCaseload: { type: Number, default: 8 },
    title: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
