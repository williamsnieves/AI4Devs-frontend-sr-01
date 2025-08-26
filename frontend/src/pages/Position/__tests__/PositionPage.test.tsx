import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PositionPage from "../PositionPage";

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

describe("PositionPage Component", () => {
  test("renders loading state initially", () => {
    renderWithRouter(<PositionPage />);
    expect(screen.getByText("Loading position data...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument(); // Spinner
  });

  test("renders position header and kanban board after loading", async () => {
    renderWithRouter(<PositionPage />);

    // Wait for loading to complete
    await screen.findByTestId("position-header", {}, { timeout: 1000 });

    expect(screen.getByTestId("position-header")).toBeInTheDocument();
    expect(screen.getByTestId("kanban-board")).toBeInTheDocument();
    expect(screen.getByTestId("kanban-content")).toBeInTheDocument();
  });

  test("displays position title correctly", async () => {
    renderWithRouter(<PositionPage />);

    // Wait for data to load by looking for the header specifically
    await screen.findByTestId("position-header", {}, { timeout: 1000 });

    // The title should be in the header
    expect(
      screen.getByRole("heading", { name: "Senior Backend Engineer Position" })
    ).toBeInTheDocument();
  });

  test("displays all kanban phases correctly", async () => {
    renderWithRouter(<PositionPage />);

    // Wait for data to load
    await screen.findByTestId("kanban-board", {}, { timeout: 1000 });

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
});
