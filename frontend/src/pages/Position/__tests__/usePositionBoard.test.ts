import { renderHook, waitFor, act } from "@testing-library/react";
import { usePositionBoard } from "../hooks/usePositionBoard";
import * as api from "../services/api";
import * as adapters from "../services/adapters";

// Mock the API functions and adapters
jest.mock("../services/api");
jest.mock("../services/adapters");
const mockApi = api as jest.Mocked<typeof api>;
const mockAdapters = adapters as jest.Mocked<typeof adapters>;

const mockInterviewFlow = {
  interviewFlow: {
    positionName: "Senior Backend Engineer",
    interviewFlow: {
      id: 1,
      description: "Standard development interview process",
      interviewSteps: [
        {
          id: 1,
          interviewFlowId: 1,
          interviewTypeId: 1,
          name: "Phone Screen",
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
  },
};

const mockCandidates = [
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
    currentInterviewStep: "Technical Interview",
    averageScore: 3,
  },
  {
    id: 3,
    applicationId: 103,
    fullName: "Bob Johnson",
    currentInterviewStep: "Unknown Step",
    averageScore: 2,
  },
];

const mockPositionViewModel = {
  id: "1",
  title: "Senior Backend Engineer",
  phases: [
    {
      id: "phase-1",
      name: "Phone Screen",
      orderIndex: 1,
      candidates: [
        {
          id: "candidate-1",
          fullName: "John Doe",
          currentInterviewStep: "Phone Screen",
          averageScore: 4,
          originalId: 1,
          applicationId: 101,
        },
      ],
    },
    {
      id: "phase-2",
      name: "Technical Interview",
      orderIndex: 2,
      candidates: [
        {
          id: "candidate-2",
          fullName: "Jane Smith",
          currentInterviewStep: "Technical Interview",
          averageScore: 3,
          originalId: 2,
          applicationId: 102,
        },
      ],
    },
    {
      id: "phase-3",
      name: "Manager Interview",
      orderIndex: 3,
      candidates: [],
    },
    {
      id: "phase-unassigned",
      name: "Unassigned",
      orderIndex: 999,
      candidates: [
        {
          id: "candidate-3",
          fullName: "Bob Johnson",
          currentInterviewStep: "Unknown Step",
          averageScore: 2,
          originalId: 3,
          applicationId: 103,
        },
      ],
    },
  ],
};

describe("usePositionBoard Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockApi.getInterviewFlow.mockResolvedValue(mockInterviewFlow);
    mockApi.getCandidates.mockResolvedValue(mockCandidates);
    mockAdapters.adaptToPositionViewModel.mockReturnValue(
      mockPositionViewModel
    );
    mockAdapters.extractStepIdFromPhase.mockReturnValue(2); // Default step ID
  });

  describe("Data Loading", () => {
    test("loads data and renders correctly", async () => {
      // Act
      const { result } = renderHook(() => usePositionBoard("1"));

      // Assert initial state
      expect(result.current.loading).toBe(true);
      expect(result.current.position).toBe(null);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert loaded state
      expect(result.current.position).toBeDefined();
      expect(result.current.position?.title).toBe("Senior Backend Engineer");
      expect(result.current.position?.phases).toHaveLength(4); // 3 regular + 1 unassigned
      expect(result.current.error).toBe(null);

      // Verify API calls
      expect(mockApi.getInterviewFlow).toHaveBeenCalledWith("1");
      expect(mockApi.getCandidates).toHaveBeenCalledWith("1");
      expect(mockAdapters.adaptToPositionViewModel).toHaveBeenCalledWith(
        "1",
        mockInterviewFlow,
        mockCandidates
      );
    });

    test("handles fetch error", async () => {
      // Arrange
      mockApi.getInterviewFlow.mockRejectedValue(new Error("Network error"));
      mockApi.getCandidates.mockResolvedValue(mockCandidates);

      // Act
      const { result } = renderHook(() => usePositionBoard("1"));

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Network error");
      expect(result.current.position).toBe(null);
    });

    test("handles candidates with unknown steps (go to Unassigned)", async () => {
      // Arrange
      mockApi.getInterviewFlow.mockResolvedValue(mockInterviewFlow);
      mockApi.getCandidates.mockResolvedValue(mockCandidates);

      // Act
      const { result } = renderHook(() => usePositionBoard("1"));

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const unassignedPhase = result.current.steps.find(
        (step) => step.name === "Unassigned"
      );
      expect(unassignedPhase).toBeDefined();
      expect(unassignedPhase?.candidates).toHaveLength(1);
      expect(unassignedPhase?.candidates[0].fullName).toBe("Bob Johnson");
    });
  });

  describe("Move Candidate", () => {
    beforeEach(() => {
      mockApi.getInterviewFlow.mockResolvedValue(mockInterviewFlow);
      mockApi.getCandidates.mockResolvedValue(mockCandidates);
    });

    test("moves candidate and calls PUT with correct args", async () => {
      // Arrange
      mockApi.updateCandidateStage.mockResolvedValue();

      const { result } = renderHook(() => usePositionBoard("1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.moveCandidate("candidate-1", "phase-2");
      });

      // Assert
      expect(mockApi.updateCandidateStage).toHaveBeenCalledWith(1, {
        applicationId: 101,
        currentInterviewStep: 2,
      });

      // Verify optimistic update in position
      const technicalPhase = result.current.position?.phases.find(
        (phase) => phase.name === "Technical Interview"
      );
      expect(technicalPhase?.candidates).toHaveLength(2);
      expect(
        technicalPhase?.candidates.some(
          (candidate) => candidate.fullName === "John Doe"
        )
      ).toBe(true);
    });

    test("rollbacks state on error", async () => {
      // Arrange
      mockApi.updateCandidateStage.mockRejectedValue(
        new Error("Update failed")
      );

      const { result } = renderHook(() => usePositionBoard("1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const originalPhoneScreenCount = result.current.position?.phases.find(
        (phase) => phase.name === "Phone Screen"
      )?.candidates.length;

      // Act
      await act(async () => {
        await result.current.moveCandidate("candidate-1", "phase-2");
      });

      // Assert error and rollback
      expect(result.current.error).toBe("Update failed");

      // Verify rollback
      const phoneScreenPhase = result.current.position?.phases.find(
        (phase) => phase.name === "Phone Screen"
      );
      expect(phoneScreenPhase?.candidates.length).toBe(
        originalPhoneScreenCount
      );
      expect(
        phoneScreenPhase?.candidates.some(
          (candidate) => candidate.fullName === "John Doe"
        )
      ).toBe(true);
    });

    test("handles move to unassigned phase", async () => {
      // Arrange
      const { result } = renderHook(() => usePositionBoard("1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.moveCandidate("candidate-1", "phase-unassigned");
      });

      // Assert
      // Should not call backend API for unassigned moves
      expect(mockApi.updateCandidateStage).not.toHaveBeenCalled();

      // Verify candidate moved to unassigned
      const unassignedPhase = result.current.position?.phases.find(
        (phase) => phase.name === "Unassigned"
      );
      expect(unassignedPhase?.candidates).toHaveLength(2);
    });
  });

  describe("Error Handling", () => {
    test("clears error after timeout", async () => {
      // Arrange
      jest.useFakeTimers();
      mockApi.updateCandidateStage.mockRejectedValue(
        new Error("Update failed")
      );

      const { result } = renderHook(() => usePositionBoard("1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.moveCandidate("candidate-1", "phase-2");
      });

      // Assert error is set
      expect(result.current.error).toBe("Update failed");

      // Fast-forward time to clear error
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Assert error is cleared
      expect(result.current.error).toBe(null);

      jest.useRealTimers();
    });
  });

  describe("Edge Cases", () => {
    test("handles missing position ID", () => {
      // Act
      const { result } = renderHook(() => usePositionBoard(undefined));

      // Assert
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Position ID is required");
      expect(result.current.position).toBe(null);
    });

    test("handles invalid candidate data", async () => {
      // Arrange
      const { result } = renderHook(() => usePositionBoard("1"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act - try to move candidate that doesn't exist
      await act(async () => {
        await result.current.moveCandidate("invalid-candidate", "phase-2");
      });

      // Assert
      expect(result.current.error).toBe(
        "Invalid candidate data for move operation"
      );
    });
  });
});
