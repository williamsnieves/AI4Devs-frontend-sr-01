import {
  getInterviewFlow,
  getCandidates,
  updateCandidateStage,
} from "../services/api";

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getInterviewFlow", () => {
    test("fetches interview flow successfully", async () => {
      // Arrange
      const mockResponse = {
        positionName: "Senior Backend Engineer",
        interviewSteps: [
          {
            id: 1,
            interviewFlowId: 1,
            interviewTypeId: 1,
            name: "Phone Screen",
            orderIndex: 1,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      const result = await getInterviewFlow("1");

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3010/position/1/interviewflow"
      );
      expect(result).toEqual(mockResponse);
    });

    test("throws error on failed request", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
      } as Response);

      // Act & Assert
      await expect(getInterviewFlow("1")).rejects.toThrow(
        "Failed to fetch interview flow: Not Found"
      );
    });
  });

  describe("getCandidates", () => {
    test("fetches candidates successfully", async () => {
      // Arrange
      const mockCandidates = [
        {
          id: 1,
          applicationId: 101,
          fullName: "John Doe",
          currentInterviewStep: "Phone Screen",
          averageScore: 4,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCandidates,
      } as Response);

      // Act
      const result = await getCandidates("1");

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3010/position/1/candidates"
      );
      expect(result).toEqual(mockCandidates);
    });

    test("throws error on failed request", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      } as Response);

      // Act & Assert
      await expect(getCandidates("1")).rejects.toThrow(
        "Failed to fetch candidates: Internal Server Error"
      );
    });
  });

  describe("updateCandidateStage", () => {
    test("updates candidate stage successfully", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      const updateData = {
        applicationId: 101,
        currentInterviewStep: 2,
      };

      // Act
      await updateCandidateStage(1, updateData);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3010/candidates/1",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );
    });

    test("throws error on failed request", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
      } as Response);

      const updateData = {
        applicationId: 101,
        currentInterviewStep: 2,
      };

      // Act & Assert
      await expect(updateCandidateStage(1, updateData)).rejects.toThrow(
        "Failed to update candidate stage: Bad Request"
      );
    });
  });

  describe("Environment Configuration", () => {
    test("uses default API URL when environment variable not set", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ positionName: "Test", interviewSteps: [] }),
      } as Response);

      // Act
      await getInterviewFlow("1");

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3010/position/1/interviewflow"
      );
    });
  });
});
