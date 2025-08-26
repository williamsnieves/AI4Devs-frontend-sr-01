import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PositionPage from "../PositionPage";

// Mock the usePositionBoard hook
jest.mock("../hooks/usePositionBoard", () => ({
  usePositionBoard: jest.fn(),
}));

// Mock the child components to avoid complex dependencies in unit test
jest.mock("../components/PositionHeader", () => ({
  PositionHeader: ({ title }: { title: string }) => (
    <div data-testid="position-header">
      <h1>{title}</h1>
    </div>
  ),
}));

jest.mock("../components/KanbanBoard", () => ({
  KanbanBoard: ({ position }: any) => (
    <div data-testid="kanban-board">
      <div data-testid="kanban-content">
        {position.phases.map((phase: any) => (
          <div key={phase.id} data-testid={`kanban-phase-${phase.id}`}>
            {phase.name}
          </div>
        ))}
      </div>
    </div>
  ),
}));

// Mock useParams to return a position ID
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "1" }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockUsePositionBoard = require("../hooks/usePositionBoard")
  .usePositionBoard as jest.MockedFunction<any>;

const mockPosition = {
  id: "1",
  title: "Senior Backend Engineer Position",
  phases: [
    {
      id: "phase-1",
      name: "Llamada telefónica",
      orderIndex: 1,
      candidates: [],
    },
    {
      id: "phase-2",
      name: "Entrevista técnica",
      orderIndex: 2,
      candidates: [],
    },
    {
      id: "phase-3",
      name: "Entrevista cultural",
      orderIndex: 3,
      candidates: [],
    },
    {
      id: "phase-4",
      name: "Entrevista manager",
      orderIndex: 4,
      candidates: [],
    },
  ],
};

describe("PositionPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state initially", () => {
    // Mock loading state
    mockUsePositionBoard.mockReturnValue({
      loading: true,
      error: null,
      position: null,
      moveCandidate: jest.fn(),
    });

    renderWithRouter(<PositionPage />);
    expect(screen.getByText("Loading position data...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument(); // Spinner
  });

  test("renders position header and kanban board after loading", () => {
    // Mock loaded state
    mockUsePositionBoard.mockReturnValue({
      loading: false,
      error: null,
      position: mockPosition,
      moveCandidate: jest.fn(),
    });

    renderWithRouter(<PositionPage />);

    expect(screen.getByTestId("position-header")).toBeInTheDocument();
    expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    expect(screen.getByTestId("kanban-content")).toBeInTheDocument();
  });

  test("displays position title correctly", () => {
    // Mock loaded state
    mockUsePositionBoard.mockReturnValue({
      loading: false,
      error: null,
      position: mockPosition,
      moveCandidate: jest.fn(),
    });

    renderWithRouter(<PositionPage />);

    // The title should be in the header
    expect(
      screen.getByRole("heading", { name: "Senior Backend Engineer Position" })
    ).toBeInTheDocument();
  });

  test("displays all kanban phases correctly", () => {
    // Mock loaded state
    mockUsePositionBoard.mockReturnValue({
      loading: false,
      error: null,
      position: mockPosition,
      moveCandidate: jest.fn(),
    });

    renderWithRouter(<PositionPage />);

    // Check that all phases are rendered
    expect(screen.getByTestId("kanban-phase-phase-1")).toBeInTheDocument();
    expect(screen.getByTestId("kanban-phase-phase-2")).toBeInTheDocument();
    expect(screen.getByTestId("kanban-phase-phase-3")).toBeInTheDocument();
    expect(screen.getByTestId("kanban-phase-phase-4")).toBeInTheDocument();

    // Check phase names
    expect(screen.getByText("Llamada telefónica")).toBeInTheDocument();
    expect(screen.getByText("Entrevista técnica")).toBeInTheDocument();
    expect(screen.getByText("Entrevista cultural")).toBeInTheDocument();
    expect(screen.getByText("Entrevista manager")).toBeInTheDocument();
  });

  test("displays error message when there is an error", () => {
    // Mock error state
    mockUsePositionBoard.mockReturnValue({
      loading: false,
      error: "Failed to fetch position data",
      position: mockPosition,
      moveCandidate: jest.fn(),
    });

    renderWithRouter(<PositionPage />);

    expect(
      screen.getByText("Failed to fetch position data")
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  test("displays position not found when position is null", () => {
    // Mock null position state
    mockUsePositionBoard.mockReturnValue({
      loading: false,
      error: null,
      position: null,
      moveCandidate: jest.fn(),
    });

    renderWithRouter(<PositionPage />);

    expect(screen.getByText("Position not found")).toBeInTheDocument();
  });
});
