import {
  adaptInterviewStepsToPhases,
  adaptCandidateToViewModel,
  groupCandidatesByStep,
  adaptToPositionViewModel,
  extractStepIdFromPhase,
  extractCandidateId,
} from "../services/adapters";
import { InterviewStepDTO, CandidateDTO } from "../services/api";

describe("Adapters", () => {
  describe("adaptInterviewStepsToPhases", () => {
    test("converts interview steps to phases correctly", () => {
      // Arrange
      const steps: InterviewStepDTO[] = [
        {
          id: 2,
          interviewFlowId: 1,
          interviewTypeId: 2,
          name: "Technical Interview",
          orderIndex: 2,
        },
        {
          id: 1,
          interviewFlowId: 1,
          interviewTypeId: 1,
          name: "Phone Screen",
          orderIndex: 1,
        },
      ];

      // Act
      const result = adaptInterviewStepsToPhases(steps);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "phase-1",
        name: "Phone Screen",
        orderIndex: 1,
        candidates: [],
      });
      expect(result[1]).toEqual({
        id: "phase-2",
        name: "Technical Interview",
        orderIndex: 2,
        candidates: [],
      });
    });

    test("sorts phases by orderIndex", () => {
      // Arrange
      const steps: InterviewStepDTO[] = [
        {
          id: 3,
          interviewFlowId: 1,
          interviewTypeId: 3,
          name: "Final",
          orderIndex: 3,
        },
        {
          id: 1,
          interviewFlowId: 1,
          interviewTypeId: 1,
          name: "First",
          orderIndex: 1,
        },
        {
          id: 2,
          interviewFlowId: 1,
          interviewTypeId: 2,
          name: "Second",
          orderIndex: 2,
        },
      ];

      // Act
      const result = adaptInterviewStepsToPhases(steps);

      // Assert
      expect(result.map((p) => p.name)).toEqual(["First", "Second", "Final"]);
    });
  });

  describe("adaptCandidateToViewModel", () => {
    test("converts candidate DTO to view model", () => {
      // Arrange
      const candidate: CandidateDTO = {
        id: 1,
        applicationId: 101,
        fullName: "John Doe",
        currentInterviewStep: "Phone Screen",
        averageScore: 4,
      };

      // Act
      const result = adaptCandidateToViewModel(candidate);

      // Assert
      expect(result).toEqual({
        id: "candidate-1",
        fullName: "John Doe",
        currentInterviewStep: "Phone Screen",
        averageScore: 4,
        originalId: 1,
        applicationId: 101,
      });
    });
  });

  describe("groupCandidatesByStep", () => {
    test("groups candidates by their current step", () => {
      // Arrange
      const candidates = [
        {
          id: "candidate-1",
          fullName: "John Doe",
          currentInterviewStep: "Phone Screen",
          averageScore: 4,
        },
        {
          id: "candidate-2",
          fullName: "Jane Smith",
          currentInterviewStep: "Technical Interview",
          averageScore: 3,
        },
        {
          id: "candidate-3",
          fullName: "Bob Johnson",
          currentInterviewStep: "Phone Screen",
          averageScore: 5,
        },
      ];

      const phases = [
        { id: "phase-1", name: "Phone Screen", orderIndex: 1, candidates: [] },
        {
          id: "phase-2",
          name: "Technical Interview",
          orderIndex: 2,
          candidates: [],
        },
      ];

      // Act
      const result = groupCandidatesByStep(candidates, phases);

      // Assert
      expect(result["Phone Screen"]).toHaveLength(2);
      expect(result["Technical Interview"]).toHaveLength(1);
      expect(result["Unassigned"]).toHaveLength(0);
    });

    test("handles candidates with unknown steps", () => {
      // Arrange
      const candidates = [
        {
          id: "candidate-1",
          fullName: "John Doe",
          currentInterviewStep: "Unknown Step",
          averageScore: 4,
        },
      ];

      const phases = [
        { id: "phase-1", name: "Phone Screen", orderIndex: 1, candidates: [] },
      ];

      // Act
      const result = groupCandidatesByStep(candidates, phases);

      // Assert
      expect(result["Unassigned"]).toHaveLength(1);
      expect(result["Unassigned"][0].fullName).toBe("John Doe");
    });
  });

  describe("adaptToPositionViewModel", () => {
    test("converts full backend data to position view model", () => {
      // Arrange
      const interviewFlowResponse: InterviewFlowResponse = {
        interviewFlow: {
          positionName: "Senior Backend Engineer",
          interviewFlow: {
            id: 1,
            description: "Standard flow",
            interviewSteps: [
              {
                id: 1,
                interviewFlowId: 1,
                interviewTypeId: 1,
                name: "Phone Screen",
                orderIndex: 1,
              },
            ],
          },
        },
      };

      const candidates: CandidateDTO[] = [
        {
          id: 1,
          applicationId: 101,
          fullName: "John Doe",
          currentInterviewStep: "Phone Screen",
          averageScore: 4,
        },
        {
          id: 2,
          applicationId: 102,
          fullName: "Jane Smith",
          currentInterviewStep: "Unknown Step",
          averageScore: 3,
        },
      ];

      // Act
      const result = adaptToPositionViewModel(
        "1",
        interviewFlowResponse,
        candidates
      );

      // Assert
      expect(result.id).toBe("1");
      expect(result.title).toBe("Senior Backend Engineer");
      expect(result.phases).toHaveLength(2); // 1 regular + 1 unassigned

      const phoneScreenPhase = result.phases.find(
        (p) => p.name === "Phone Screen"
      );
      expect(phoneScreenPhase?.candidates).toHaveLength(1);

      const unassignedPhase = result.phases.find(
        (p) => p.name === "Unassigned"
      );
      expect(unassignedPhase?.candidates).toHaveLength(1);
    });

    test("does not create unassigned phase when all candidates are assigned", () => {
      // Arrange
      const interviewFlowResponse: InterviewFlowResponse = {
        interviewFlow: {
          positionName: "Senior Backend Engineer",
          interviewFlow: {
            id: 1,
            description: "Standard flow",
            interviewSteps: [
              {
                id: 1,
                interviewFlowId: 1,
                interviewTypeId: 1,
                name: "Phone Screen",
                orderIndex: 1,
              },
            ],
          },
        },
      };

      const candidates: CandidateDTO[] = [
        {
          id: 1,
          applicationId: 101,
          fullName: "John Doe",
          currentInterviewStep: "Phone Screen",
          averageScore: 4,
        },
      ];

      // Act
      const result = adaptToPositionViewModel(
        "1",
        interviewFlowResponse,
        candidates
      );

      // Assert
      expect(result.phases).toHaveLength(1);
      expect(
        result.phases.find((p) => p.name === "Unassigned")
      ).toBeUndefined();
    });
  });

  describe("extractStepIdFromPhase", () => {
    test("extracts step ID from valid phase ID", () => {
      // Act & Assert
      expect(extractStepIdFromPhase("phase-1")).toBe(1);
      expect(extractStepIdFromPhase("phase-123")).toBe(123);
    });

    test("throws error for invalid phase ID format", () => {
      // Act & Assert
      expect(() => extractStepIdFromPhase("invalid")).toThrow(
        "Invalid phase ID format: invalid"
      );
      expect(() => extractStepIdFromPhase("phase-")).toThrow(
        "Invalid phase ID format: phase-"
      );
      expect(() => extractStepIdFromPhase("phase-abc")).toThrow(
        "Invalid phase ID format: phase-abc"
      );
    });
  });

  describe("extractCandidateId", () => {
    test("extracts candidate ID from valid candidate ID", () => {
      // Act & Assert
      expect(extractCandidateId("candidate-1")).toBe(1);
      expect(extractCandidateId("candidate-456")).toBe(456);
    });

    test("throws error for invalid candidate ID format", () => {
      // Act & Assert
      expect(() => extractCandidateId("invalid")).toThrow(
        "Invalid candidate ID format: invalid"
      );
      expect(() => extractCandidateId("candidate-")).toThrow(
        "Invalid candidate ID format: candidate-"
      );
      expect(() => extractCandidateId("candidate-xyz")).toThrow(
        "Invalid candidate ID format: candidate-xyz"
      );
    });
  });
});
