// data/mockData.ts
import { PositionDTO, CandidateDTO, Position } from "../types/kanban";

// Original mocks from prompt
export const mockPosition: PositionDTO = {
  positionName: "Senior backend engineer",
  interviewFlow: {
    id: 1,
    description: "Standard development interview process",
    interviewSteps: [
      {
        id: 1,
        interviewFlowId: 1,
        interviewTypeId: 1,
        name: "Initial Screening",
        orderIndex: 1,
      },
      {
        id: 2,
        interviewFlowId: 1,
        interviewTypeId: 2,
        name: "Technical Interview",
        orderIndex: 2,
      },
      {
        id: 3,
        interviewFlowId: 1,
        interviewTypeId: 3,
        name: "Manager Interview",
        orderIndex: 3,
      },
    ],
  },
};

export const mockCandidates: CandidateDTO[] = [
  {
    fullName: "Jane Smith",
    currentInterviewStep: "Technical Interview",
    averageScore: 4,
  },
  {
    fullName: "Carlos García",
    currentInterviewStep: "Initial Screening",
    averageScore: 0,
  },
  {
    fullName: "John Doe",
    currentInterviewStep: "Manager Interview",
    averageScore: 5,
  },
];

// Adapted for Kanban component (matching screenshot data)
export const adaptedMockPosition: Position = {
  id: "1",
  title: "Senior Backend Engineer Position",
  phases: [
    {
      id: "phase-1",
      name: "Llamada telefónica", // Spanish as shown in screenshot
      orderIndex: 1,
      candidates: [
        {
          id: "candidate-1",
          fullName: "John Doe",
          currentInterviewStep: "Llamada telefónica",
          averageScore: 3,
        },
        {
          id: "candidate-2",
          fullName: "Alice Johnson",
          currentInterviewStep: "Llamada telefónica",
          averageScore: 4,
        },
      ],
    },
    {
      id: "phase-2",
      name: "Entrevista técnica",
      orderIndex: 2,
      candidates: [
        {
          id: "candidate-3",
          fullName: "Jane Smith",
          currentInterviewStep: "Entrevista técnica",
          averageScore: 3,
        },
      ],
    },
    {
      id: "phase-3",
      name: "Entrevista cultural",
      orderIndex: 3,
      candidates: [
        {
          id: "candidate-4",
          fullName: "Bob Brown",
          currentInterviewStep: "Entrevista cultural",
          averageScore: 2,
        },
      ],
    },
    {
      id: "phase-4",
      name: "Entrevista manager",
      orderIndex: 4,
      candidates: [
        {
          id: "candidate-5",
          fullName: "Eva White",
          currentInterviewStep: "Entrevista manager",
          averageScore: 5,
        },
      ],
    },
  ],
};
