// API client for Position Kanban backend integration

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3010";

export interface InterviewFlowResponse {
  interviewFlow: {
    positionName: string;
    interviewFlow: {
      id: number;
      description: string;
      interviewSteps: InterviewStepDTO[];
    };
  };
}

export interface InterviewStepDTO {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
}

export interface CandidateDTO {
  id: number;
  applicationId: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
}

export interface UpdateCandidateStageRequest {
  applicationId: number;
  currentInterviewStep: number; // new step id
}

/**
 * Fetch interview flow data for a position
 */
export const getInterviewFlow = async (
  positionId: string
): Promise<InterviewFlowResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/position/${positionId}/interviewflow`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch interview flow: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch candidates for a position
 */
export const getCandidates = async (
  positionId: string
): Promise<CandidateDTO[]> => {
  const response = await fetch(
    `${API_BASE_URL}/position/${positionId}/candidates`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch candidates: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Update candidate stage
 */
export const updateCandidateStage = async (
  candidateId: number,
  updateData: UpdateCandidateStageRequest
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update candidate stage: ${response.statusText}`);
  }
};
