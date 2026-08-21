import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  patientId: string;
  caseId: string; // Or reference to Case model
  name: string;
  age: number;
  gender: string;
  avatarType: string;
  diagnosis: string;
  targetSound: string;
  phoneticDescription: string;
  currentLevel: 'Sound' | 'Syllable' | 'Word' | 'Sentence' | 'Conversation';
  progressPct: number;
  status: 'Active' | 'Review Needed' | 'Milestone Due' | 'Completed' | 'Pending Allocation';
  priority: 'High' | 'Amber' | 'Normal';
  
  assignedTherapistId?: mongoose.Types.ObjectId;
  supervisorId?: mongoose.Types.ObjectId;
  
  primaryLanguage: string;
  therapyLanguage: string;
  
  sessionCount: number;
  totalTargetSessions: number;
  recentSessionDate?: Date;
  nextSessionDate?: Date;
  attendancePct: number;
  
  baselineScores: {
    sound: number;
    syllable: number;
    word: number;
    sentence: number;
    conversation: number;
  };
  currentScores: {
    sound: number;
    syllable: number;
    word: number;
    sentence: number;
    conversation: number;
  };
  positionScores: {
    initial: number;
    medial: number;
    final: number;
  };
  
  historicalProgress: {
    session: string;
    score: number;
    targetScore: number;
    level: string;
  }[];
  
  goals: {
    title: string;
    category: string;
    baselinePct: number;
    currentPct: number;
    targetPct: number;
    status: string;
    rationale: string;
  }[];
  
  initialNotes: string;
  recentObservation: string;
  suggestedFocus: string[];
}

const patientSchema = new Schema<IPatient>(
  {
    patientId: { type: String, required: true, unique: true },
    caseId: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    avatarType: { type: String, default: 'neutral' },
    diagnosis: { type: String, required: true },
    targetSound: { type: String },
    phoneticDescription: { type: String },
    currentLevel: { type: String, enum: ['Sound', 'Syllable', 'Word', 'Sentence', 'Conversation'], default: 'Sound' },
    progressPct: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['Active', 'Review Needed', 'Milestone Due', 'Completed', 'Pending Allocation'],
      default: 'Pending Allocation'
    },
    priority: { type: String, enum: ['High', 'Amber', 'Normal'], default: 'Normal' },
    
    assignedTherapistId: { type: Schema.Types.ObjectId, ref: 'User' },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'User' },
    
    primaryLanguage: { type: String },
    therapyLanguage: { type: String },
    
    sessionCount: { type: Number, default: 0 },
    totalTargetSessions: { type: Number, default: 0 },
    recentSessionDate: { type: Date },
    nextSessionDate: { type: Date },
    attendancePct: { type: Number, default: 100 },
    
    baselineScores: {
      sound: { type: Number, default: 0 },
      syllable: { type: Number, default: 0 },
      word: { type: Number, default: 0 },
      sentence: { type: Number, default: 0 },
      conversation: { type: Number, default: 0 }
    },
    currentScores: {
      sound: { type: Number, default: 0 },
      syllable: { type: Number, default: 0 },
      word: { type: Number, default: 0 },
      sentence: { type: Number, default: 0 },
      conversation: { type: Number, default: 0 }
    },
    positionScores: {
      initial: { type: Number, default: 0 },
      medial: { type: Number, default: 0 },
      final: { type: Number, default: 0 }
    },
    
    historicalProgress: [{
      session: String,
      score: Number,
      targetScore: Number,
      level: String
    }],
    
    goals: [{
      title: String,
      category: String,
      baselinePct: Number,
      currentPct: Number,
      targetPct: Number,
      status: String,
      rationale: String
    }],
    
    initialNotes: { type: String },
    recentObservation: { type: String },
    suggestedFocus: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<IPatient>('Patient', patientSchema);
