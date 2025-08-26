// types/kanban.ts
export interface InterviewStep {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
}

export interface InterviewFlow {
  id: number;
  description: string;
  interviewSteps: InterviewStep[];
}

export interface PositionDTO {
  positionName: string;
  interviewFlow: InterviewFlow;
}

export interface CandidateDTO {
  fullName: string;
  currentInterviewStep: string; // must match InterviewStep.name
  averageScore: number; // 0..5
}

// Adapted types for Kanban (combining both structures)
export interface Candidate {
  id: string;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
  // Backend integration fields
  originalId?: number;
  applicationId?: number;
}

export interface Phase {
  id: string;
  name: string;
  orderIndex: number;
  candidates: Candidate[];
}

export interface Position {
  id: string;
  title: string;
  phases: Phase[];
  interviewFlow?: InterviewFlow; // Optional for compatibility
}
