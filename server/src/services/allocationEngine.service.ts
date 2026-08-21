import { IUser } from '../models/User';
import { IPatient } from '../models/Patient';
import { ICase } from '../models/Case';

export interface AllocationRecommendation {
  therapistId: string;
  therapistName: string;
  role: string;
  avatarType: string;
  matchScore: number;
  reasons: string[];
}

export const calculateAllocationRecommendations = (
  patient: IPatient,
  therapists: IUser[],
  supervisorCapacity: Record<string, number> // supervisorId -> current active students under them
): AllocationRecommendation[] => {
  const recommendations: AllocationRecommendation[] = [];

  const WEIGHTS = {
    skill: 0.40,
    workload: 0.25,
    availability: 0.20,
    supervisor: 0.15
  };

  therapists.forEach(therapist => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Skill / Specialization (40%)
    let skillScore = 0;
    const needsSpecialization = patient.diagnosis.toLowerCase();
    const hasMatch = therapist.specialties?.some(s => needsSpecialization.includes(s.toLowerCase()));
    if (hasMatch) {
      skillScore = 100;
      reasons.push(`Strong relevant competency match (${patient.diagnosis})`);
    } else {
      skillScore = 50; // Base clinical knowledge
      reasons.push(`General clinical competency`);
    }
    score += skillScore * WEIGHTS.skill;

    // 2. Workload (25%)
    const active = therapist.activeCaseload || 0;
    const max = therapist.maxCaseload || 8;
    let workloadScore = 0;
    if (active < max) {
      workloadScore = 100 - ((active / max) * 100);
      if (workloadScore > 50) reasons.push(`Low current caseload (${active}/${max})`);
      else reasons.push(`Moderate current caseload (${active}/${max})`);
    } else {
      workloadScore = 0;
      reasons.push(`At maximum caseload (${active}/${max})`);
    }
    score += workloadScore * WEIGHTS.workload;

    // 3. Availability (20%)
    // Simplified matching: Just assume they have availability if string is present
    let availScore = therapist.availability ? 100 : 0;
    if (availScore > 0) reasons.push('Schedule alignment possible');
    score += availScore * WEIGHTS.availability;

    // 4. Supervisor Capacity (15%)
    let supScore = 0;
    if (therapist.supervisorId) {
      const activeUnderSup = supervisorCapacity[therapist.supervisorId.toString()] || 0;
      if (activeUnderSup < 20) { // arbitrary threshold
        supScore = 100;
        reasons.push('Supervisor capacity available');
      } else {
        supScore = 50;
        reasons.push('Supervisor highly loaded');
      }
    } else {
      supScore = 100; // if independent
    }
    score += supScore * WEIGHTS.supervisor;

    recommendations.push({
      therapistId: therapist._id as unknown as string,
      therapistName: therapist.name,
      role: therapist.role,
      avatarType: therapist.avatarType || 'neutral',
      matchScore: Math.round(score),
      reasons
    });
  });

  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
};
