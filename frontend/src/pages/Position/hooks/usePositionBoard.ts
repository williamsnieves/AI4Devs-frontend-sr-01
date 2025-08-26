import { useState, useEffect, useCallback } from "react";
import { Position, Phase, Candidate } from "../types/kanban";
import {
  getInterviewFlow,
  getCandidates,
  updateCandidateStage,
} from "../services/api";
import {
  adaptToPositionViewModel,
  extractStepIdFromPhase,
} from "../services/adapters";

interface UsePositionBoardReturn {
  loading: boolean;
  error: string | null;
  steps: Phase[];
  candidatesByStep: Record<string, Candidate[]>;
  moveCandidate: (candidateId: string, stepId: string) => Promise<void>;
  position: Position | null;
}

/**
 * Custom hook to manage position board data with backend integration
 */
export const usePositionBoard = (
  positionId: string | undefined
): UsePositionBoardReturn => {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!positionId) {
        setError("Position ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch both interview flow and candidates in parallel
        const [interviewFlow, candidates] = await Promise.all([
          getInterviewFlow(positionId),
          getCandidates(positionId),
        ]);

        const adaptedPosition = adaptToPositionViewModel(
          positionId,
          interviewFlow,
          candidates
        );

        setPosition(adaptedPosition);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch position data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [positionId]);

  // Move candidate with optimistic updates
  const moveCandidate = useCallback(
    async (candidateId: string, stepId: string) => {
      if (!position) return;

      // Find the candidate to move
      const sourceCandidate = position.phases
        .flatMap((phase) => phase.candidates)
        .find((candidate) => candidate.id === candidateId);

      if (
        !sourceCandidate ||
        !sourceCandidate.originalId ||
        !sourceCandidate.applicationId
      ) {
        setError("Invalid candidate data for move operation");
        return;
      }

      // Store original state for rollback
      const originalPosition = { ...position };

      try {
        // Optimistic update: Update UI immediately
        const updatedPosition = { ...position };

        // Remove candidate from current phase
        updatedPosition.phases = updatedPosition.phases.map((phase) => ({
          ...phase,
          candidates: phase.candidates.filter((c) => c.id !== candidateId),
        }));

        // Find target phase and add candidate
        const targetPhase = updatedPosition.phases.find(
          (phase) => phase.id === stepId
        );
        if (targetPhase) {
          // Update candidate's current step name
          const updatedCandidate = {
            ...sourceCandidate,
            currentInterviewStep: targetPhase.name,
          };

          targetPhase.candidates.push(updatedCandidate);
        }

        // Apply optimistic update
        setPosition(updatedPosition);

        // Make backend call
        if (stepId !== "phase-unassigned") {
          const backendStepId = extractStepIdFromPhase(stepId);
          await updateCandidateStage(sourceCandidate.originalId, {
            applicationId: sourceCandidate.applicationId,
            currentInterviewStep: backendStepId,
          });
        }
      } catch (err) {
        // Rollback optimistic update on error
        setPosition(originalPosition);
        setError(
          err instanceof Error ? err.message : "Failed to move candidate"
        );

        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
    },
    [position]
  );

  // Computed values
  const steps = position?.phases || [];
  const candidatesByStep = steps.reduce((acc, phase) => {
    acc[phase.name] = phase.candidates;
    return acc;
  }, {} as Record<string, Candidate[]>);

  return {
    loading,
    error,
    steps,
    candidatesByStep,
    moveCandidate,
    position,
  };
};
