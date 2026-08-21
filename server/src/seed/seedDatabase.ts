import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Case from '../models/Case.js';
import Session from '../models/Session.js';

import { INITIAL_PATIENTS } from '../../../src/data/mockData.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/speechcare';

const seedDatabase = async () => {
  try {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      console.log('✅ Connected to MongoDB for seeding at', MONGODB_URI);
    } catch (err) {
      console.warn('⚠️ Local MongoDB not found on port 27017. Launching embedded MongoMemoryServer fallback for seeding...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({ instance: { port: 27017 } });
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoMemoryServer for seeding at', uri);
    }

    // Clear existing
    await User.deleteMany();
    await Patient.deleteMany();
    await Case.deleteMany();
    await Session.deleteMany();
    console.log('🧹 Cleared existing data');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // ── 1. SUPERVISORS ───────────────────────────────────────────────────
    const supervisorMehta = await User.create({
      name: 'Dr. Sarah Mehta',
      email: 'sarah.mehta@speechcare.ai',
      passwordHash: defaultPassword,
      role: 'supervisor',
      gender: 'Female',
      avatarType: 'female',
      title: 'Senior Clinical Supervisor (PhD, CCC-SLP)',
      specialties: ['Articulation', 'Phonology', 'Bilingual SLP'],
      activeCaseload: 4,
      maxCaseload: 12
    });

    const supervisorKumar = await User.create({
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@speechcare.ai',
      passwordHash: defaultPassword,
      role: 'supervisor',
      gender: 'Male',
      avatarType: 'male',
      title: 'Clinical Supervisor (MEd, CCC-SLP)',
      specialties: ['Fluency', 'Language Delay', 'Voice Disorders'],
      activeCaseload: 3,
      maxCaseload: 10
    });

    // ── 2. STUDENT THERAPISTS (Therapist A & B + assigned student) ────────
    const therapistAnanya = await User.create({
      name: 'Ananya Sharma',
      email: 'ananya.sharma@speechcare.ai',
      passwordHash: defaultPassword,
      role: 'student_therapist',
      gender: 'Female',
      avatarType: 'female',
      supervisorId: supervisorMehta._id,
      specialties: ['Rhotic /r/ Articulation', 'Bilingual Telugu/English'],
      activeCaseload: 3,
      maxCaseload: 8
    });

    const therapistPriya = await User.create({
      name: 'Priya Nair',
      email: 'priya.nair@speechcare.ai',
      passwordHash: defaultPassword,
      role: 'student_therapist',
      gender: 'Female',
      avatarType: 'female',
      supervisorId: supervisorKumar._id,
      specialties: ['Language Delay', 'Phonological Disorder'],
      activeCaseload: 2,
      maxCaseload: 8
    });

    const therapistRohan = await User.create({
      name: 'Rohan Verma',
      email: 'rohan.verma@speechcare.ai',
      passwordHash: defaultPassword,
      role: 'student_therapist',
      gender: 'Male',
      avatarType: 'male',
      supervisorId: supervisorMehta._id,
      specialties: ['Articulation', 'Childhood Apraxia of Speech'],
      activeCaseload: 2,
      maxCaseload: 8
    });

    // ── 3. ADMIN ──────────────────────────────────────────────────────────
    await User.create({
      name: 'Admin User',
      email: 'admin@speechcare.ai',
      passwordHash: defaultPassword,
      role: 'admin',
      gender: 'Other',
      avatarType: 'neutral'
    });

    // ── 4. SEED PATIENTS & CASES ─────────────────────────────────────────
    // Assign patients alternately to therapistAnanya and therapistPriya
    // to demonstrate multi-therapist isolation
    const therapistAssignments = [therapistAnanya, therapistAnanya, therapistPriya, therapistPriya, therapistRohan];
    const supervisorAssignments = [supervisorMehta, supervisorMehta, supervisorKumar, supervisorKumar, supervisorMehta];

    for (let i = 0; i < INITIAL_PATIENTS.length; i++) {
      const p = INITIAL_PATIENTS[i];
      const assignedTherapist = therapistAssignments[i % therapistAssignments.length];
      const assignedSupervisor = supervisorAssignments[i % supervisorAssignments.length];

      // Determine case status
      let caseStatus: any = 'PENDING_SUPERVISOR_REVIEW';
      if (p.status === 'Active') caseStatus = 'IN_THERAPY';
      else if (p.status === 'Milestone Due') caseStatus = 'MILESTONE_DUE';
      else if (p.status === 'Review Needed') caseStatus = 'PROGRESS_REVIEW';
      else if (p.status === 'Completed') caseStatus = 'COMPLETED';

      // Create Case with therapistId = the creator therapist
      const newCase = await Case.create({
        caseId: p.caseId,
        patientId: new mongoose.Types.ObjectId(), // placeholder
        therapistId: assignedTherapist._id,       // case OWNER / creator
        supervisorId: assignedSupervisor._id,     // selected supervisor
        complexity: 'Medium',
        status: caseStatus,
        priority: p.priority,
        priorityScore: p.priority === 'High' ? 85 : p.priority === 'Amber' ? 50 : 10,
        priorityReasons: p.priority === 'High' ? ['High complexity case requiring immediate attention'] :
                         p.priority === 'Amber' ? ['Review due in upcoming sessions'] : []
      });

      // Create Patient — assignedTherapistId = who is doing the actual therapy
      // For seeded data: same therapist is both creator and doing therapy
      const patient = await Patient.create({
        patientId: p.id,
        caseId: newCase.caseId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        avatarType: p.gender === 'Male' ? 'male' : 'female',
        diagnosis: p.diagnosis,
        targetSound: p.targetSound,
        phoneticDescription: p.phoneticDescription,
        currentLevel: p.currentLevel,
        progressPct: p.progressPct,
        status: p.status,
        priority: p.priority,
        assignedTherapistId: assignedTherapist._id,
        supervisorId: assignedSupervisor._id,
        primaryLanguage: p.primaryLanguage,
        therapyLanguage: p.therapyLanguage,
        sessionCount: p.sessionCount,
        totalTargetSessions: p.totalTargetSessions,
        attendancePct: p.attendancePct,
        baselineScores: p.baselineScores,
        currentScores: p.currentScores,
        positionScores: p.positionScores,
        historicalProgress: p.historicalProgress,
        goals: p.goals,
        initialNotes: p.initialNotes,
        recentObservation: p.recentObservation,
        suggestedFocus: p.suggestedFocus
      });

      // Update case with real patient ID
      newCase.patientId = patient._id as mongoose.Types.ObjectId;
      await newCase.save();

      // Seed sessions for Rahul Verma (p1)
      if (p.id === 'p1') {
        await Session.create({
          patientId: patient._id,
          caseId: newCase._id,
          therapistId: assignedTherapist._id,
          sessionNumber: 9,
          date: new Date('2026-08-15T09:30:00.000Z'),
          durationMinutes: 45,
          level: 'Sentence',
          targetSound: '/r/',
          speechPerformanceScore: 78,
          phonemeAccuracyScore: 80,
          audioQuality: 'Good',
          attendance: 'Present',
          stimulusItems: [
            { prompt: 'Rabbit running', score: 85, phonemeResult: 'Correct' },
            { prompt: 'Red rose', score: 82, phonemeResult: 'Correct' },
            { prompt: 'Train on track', score: 58, phonemeResult: 'Distorted' },
          ],
          soapNotes: {
            subjective: 'Patient cooperated well throughout structured tactile biofeedback exercises.',
            objective: 'Sentence drills targeting initial /r/ reached 78% average score across 25 repetitions.',
            assessment: 'Isolated carrier phrases are stable; complex linguistic loads cause slight jaw tension.',
            plan: 'Advance stimulus complexity gradually while maintaining visual biofeedback cues.',
          },
          therapistConfidence: 4,
          activities: ['Tactile biofeedback exercises', 'Sentence drills'],
        });

        await Session.create({
          patientId: patient._id,
          caseId: newCase._id,
          therapistId: assignedTherapist._id,
          sessionNumber: 10,
          date: new Date('2026-08-18T10:00:00.000Z'),
          durationMinutes: 45,
          level: 'Sentence',
          targetSound: '/r/',
          speechPerformanceScore: 82,
          phonemeAccuracyScore: 84,
          audioQuality: 'Excellent',
          attendance: 'Present',
          stimulusItems: [
            { prompt: 'రాము రోడ్డుపై నడిచాడు (Ramu walked on road)', score: 88, phonemeResult: 'Correct' },
            { prompt: 'రైలు స్టేషన్ కు వచ్చింది (Train arrived at station)', score: 84, phonemeResult: 'Correct' },
            { prompt: 'The red rabbit ran fast', score: 79, phonemeResult: 'Correct' },
            { prompt: 'Trip through the green trees', score: 64, phonemeResult: 'Distorted' },
          ],
          soapNotes: {
            subjective: 'Rahul arrived on time and eager to practice. Mother reported regular home practice on carrier cards.',
            objective: 'Completed 35 sentence trials with /r/ target. Overall acoustic accuracy: 82%. Cluster blends (/tr/, /pr/) yielded 57% accuracy.',
            assessment: 'Marked progress from baseline (48% → 82%). Cluster coarticulation remains the single limiting factor.',
            plan: 'Introduce minimal pair cluster drills. Submit 10-session milestone report for supervisor review.',
          },
          therapistConfidence: 5,
          activities: ['Microphone visualizer practice', 'Carrier card drills', 'Sentence repetition'],
          supervisorFeedback: {
            supervisorId: assignedSupervisor._id,
            comment: 'Excellent structured documentation. Noticeable improvement in acoustic trajectory. Approved to continue minimal pair cluster focus.',
            rating: 5,
            date: new Date('2026-08-18T11:00:00.000Z'),
          },
        });
      } else if (p.sessionCount > 0) {
        await Session.create({
          patientId: patient._id,
          caseId: newCase._id,
          therapistId: assignedTherapist._id,
          sessionNumber: p.sessionCount,
          date: new Date('2026-08-16T14:00:00.000Z'),
          durationMinutes: 45,
          level: p.currentLevel,
          targetSound: p.targetSound,
          speechPerformanceScore: p.progressPct,
          phonemeAccuracyScore: Math.min(100, p.progressPct + 2),
          audioQuality: 'Good',
          attendance: 'Present',
          stimulusItems: [
            { prompt: `Target practice: ${p.targetSound}`, score: p.progressPct, phonemeResult: 'Correct' },
          ],
          soapNotes: {
            subjective: `Patient ${p.name} was engaged in clinical session activities.`,
            objective: `Practiced ${p.targetSound} phoneme drills at ${p.currentLevel} level. Current acoustic score: ${p.progressPct}%.`,
            assessment: `Clinical progress consistent with ${p.diagnosis}.`,
            plan: `Continue therapy protocol according to individualized care plan.`,
          },
          therapistConfidence: 4,
          activities: ['Phoneme repetition', 'Structured drill'],
        });
      }
    }

    console.log('✅ Seed completed successfully!');
    console.log('');
    console.log('═══ TEST CREDENTIALS ═══════════════════════════════════════════');
    console.log('SUPERVISORS:');
    console.log('  Dr. Sarah Mehta  : sarah.mehta@speechcare.ai / password123');
    console.log('  Dr. Rajesh Kumar : rajesh.kumar@speechcare.ai / password123');
    console.log('');
    console.log('STUDENT THERAPISTS (who create & own cases):');
    console.log('  Ananya Sharma    : ananya.sharma@speechcare.ai / password123');
    console.log('  Priya Nair       : priya.nair@speechcare.ai   / password123');
    console.log('  Rohan Verma      : rohan.verma@speechcare.ai  / password123');
    console.log('');
    console.log('ADMIN:');
    console.log('  Admin User       : admin@speechcare.ai         / password123');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('PRIVACY TEST:');
    console.log('  Ananya sees: her own patients (p1, p2)');
    console.log('  Priya  sees: her own patients (p3, p4)');
    console.log('  Rohan  sees: his own patients (p5+)');
    console.log('  Dr. Mehta  sees: cases sent to her (Ananya + Rohan cases)');
    console.log('  Dr. Kumar  sees: cases sent to him (Priya cases)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
