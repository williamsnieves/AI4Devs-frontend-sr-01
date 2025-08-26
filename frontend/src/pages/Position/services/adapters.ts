// Adapters to normalize DTOs into view models

import { InterviewFlowResponse, InterviewStepDTO, CandidateDTO } from "./api";
import { Position, Phase, Candidate } from "../types/kanban";

/**
 * Convert interview steps DTO to phases view model
 */
export const adaptInterviewStepsToPhases = (
  steps: InterviewStepDTO[]
): Phase[] => {
  return steps
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((step) => ({
      id: `phase-${step.id}`,
      name: step.name,
      orderIndex: step.orderIndex,
      candidates: [], // Will be populated separately
    }));
};

/**
 * Convert candidate DTO to candidate view model
 */
export const adaptCandidateToViewModel = (
  candidate: CandidateDTO
): Candidate => ({
  id: `candidate-${candidate.id}`,
  fullName: candidate.fullName,
  currentInterviewStep: candidate.currentInterviewStep,
  averageScore: candidate.averageScore,
  // Store original IDs for backend calls
  originalId: candidate.id,
  applicationId: candidate.applicationId,
});

/**
 * Group candidates by their current interview step
 */
export const groupCandidatesByStep = (
  candidates: Candidate[],
  phases: Phase[]
): Record<string, Candidate[]> => {
  const grouped: Record<string, Candidate[]> = {};

  // Initialize empty groups for all phases
  phases.forEach((phase) => {
    grouped[phase.name] = [];
  });

  // Add special "Unassigned" group for candidates with unknown steps
  grouped["Unassigned"] = [];

  // Group candidates
  candidates.forEach((candidate) => {
    const stepName = candidate.currentInterviewStep;
    if (grouped[stepName]) {
      grouped[stepName].push(candidate);
    } else {
      // Handle candidates with unknown steps
      grouped["Unassigned"].push(candidate);
    }
  });

  return grouped;
};

/**
 * Convert backend data to Position view model
 */
export const adaptToPositionViewModel = (
  positionId: string,
  interviewFlowResponse: InterviewFlowResponse,
  candidates: CandidateDTO[]
): Position => {
  const phases = adaptInterviewStepsToPhases(
    interviewFlowResponse.interviewFlow.interviewFlow.interviewSteps
  );
  const adaptedCandidates = candidates.map(adaptCandidateToViewModel);
  const candidatesByStep = groupCandidatesByStep(adaptedCandidates, phases);

  // Populate phases with their candidates
  const phasesWithCandidates = phases.map((phase) => ({
    ...phase,
    candidates: candidatesByStep[phase.name] || [],
  }));

  // Add "Unassigned" phase if there are unassigned candidates
  if (candidatesByStep["Unassigned"].length > 0) {
    phasesWithCandidates.push({
      id: "phase-unassigned",
      name: "Unassigned",
      orderIndex: 999,
      candidates: candidatesByStep["Unassigned"],
    });
  }

  return {
    id: positionId,
    title: interviewFlowResponse.interviewFlow.positionName,
    phases: phasesWithCandidates,
  };
};

/**
 * Extract step ID from phase ID (reverse of phase-{id} format)
 */
export const extractStepIdFromPhase = (phaseId: string): number => {
  const match = phaseId.match(/^phase-(\d+)$/);
  if (!match) {
    throw new Error(`Invalid phase ID format: ${phaseId}`);
  }
  return parseInt(match[1], 10);
};

/**
 * Extract candidate ID from candidate ID (reverse of candidate-{id} format)
 */
export const extractCandidateId = (candidateId: string): number => {
  const match = candidateId.match(/^candidate-(\d+)$/);
  if (!match) {
    throw new Error(`Invalid candidate ID format: ${candidateId}`);
  }
  return parseInt(match[1], 10);
};
