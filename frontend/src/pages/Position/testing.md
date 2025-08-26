# Testing Documentation - Position Kanban View

## Overview
The Position Kanban View includes comprehensive testing for all components using Jest and React Testing Library following AAA (Arrange, Act, Assert) patterns.

## Test Coverage Targets
- **Lines**: ≥90%
- **Branches**: ≥80%
- **Functions**: ≥85%
- **Statements**: ≥90%

## Components Test Coverage

### PositionPage Component
- ✅ Renders with correct position data from mock
- ✅ Updates position state when candidates are moved
- ✅ Handles loading states gracefully
- ✅ Proper TypeScript integration
- ✅ Responsive layout validation

### PositionHeader Component
- ✅ Renders position title correctly
- ✅ Displays back button with proper accessibility
- ✅ Navigates back to positions list on click
- ✅ Handles long titles with truncation
- ✅ Keyboard navigation support

### CandidateCard Component  
- ✅ Displays candidate name and score dots
- ✅ Renders correct number of filled/unfilled score indicators
- ✅ Includes drag handle with proper ARIA attributes
- ✅ Supports drag-and-drop functionality via dnd-kit
- ✅ Handles edge cases (score=0, long names)
- ✅ Keyboard accessibility compliance
- ✅ Focus management during drag operations

### KanbanColumn Component
- ✅ Renders phase name and candidate count (singular/plural)
- ✅ Displays all candidate cards within column
- ✅ Handles empty phases with proper drop zone
- ✅ Supports drop functionality via useDroppable
- ✅ Visual feedback during drag over states
- ✅ Responsive design validation
- ✅ ARIA roles and labels for accessibility

### KanbanBoard Component
- ✅ Renders all phases in responsive Bootstrap grid
- ✅ Supports drag-and-drop between columns via DndContext
- ✅ Handles reordering within same column
- ✅ Calls update callbacks when candidates move
- ✅ Maintains position state management
- ✅ Mobile/desktop responsive behavior
- ✅ Drag overlay functionality
- ✅ Sensor configuration for touch/mouse

## Testing Architecture

### Setup
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/pages/Position/**/*.{ts,tsx}',
    '!src/pages/Position/**/*.test.{ts,tsx}',
    '!src/pages/Position/testing.md'
  ],
  coverageThreshold: {
    global: {
      lines: 90,
      branches: 80,
      functions: 85,
      statements: 90
    }
  }
};
```

### Test Utilities
```typescript
// testUtils.tsx
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <DndContext>
        {ui}
      </DndContext>
    </BrowserRouter>
  );
};

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Key Testing Patterns

### 1. Component Isolation
```typescript
// Mock child components for unit tests
jest.mock('./KanbanColumn', () => ({
  KanbanColumn: ({ phase }: any) => (
    <div data-testid={`column-${phase.id}`}>{phase.name}</div>
  )
}));
```

### 2. DnD Testing
```typescript
// Test drag and drop functionality
test('moves candidate between columns', async () => {
  const mockOnUpdate = jest.fn();
  render(<KanbanBoard position={mockPosition} onPositionUpdate={mockOnUpdate} />);
  
  const candidate = screen.getByText('John Doe');
  const targetColumn = screen.getByTestId('column-2');
  
  fireEvent.dragStart(candidate);
  fireEvent.dragOver(targetColumn);
  fireEvent.drop(targetColumn);
  
  expect(mockOnUpdate).toHaveBeenCalled();
});
```

### 3. Accessibility Testing
```typescript
// Verify ARIA attributes and roles
test('has proper accessibility attributes', () => {
  render(<KanbanColumn phase={mockPhase} />);
  
  const column = screen.getByRole('list');
  expect(column).toHaveAttribute('aria-label');
  expect(column).toBeInTheDocument();
});
```

### 4. Responsive Testing
```typescript
// Test Bootstrap responsive classes
test('applies responsive grid classes', () => {
  const { container } = render(<KanbanBoard position={mockPosition} />);
  
  const grid = container.querySelector('.row.row-cols-1.row-cols-md-2.row-cols-lg-4');
  expect(grid).toBeInTheDocument();
});
```

### 5. Edge Case Testing
```typescript
// Test error boundaries and edge cases
describe('Edge Cases', () => {
  test('handles empty candidate list', () => {
    const emptyPosition = { ...mockPosition, phases: [] };
    render(<KanbanBoard position={emptyPosition} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('handles candidate with score 0', () => {
    const zeroScoreCandidate = { ...mockCandidate, averageScore: 0 };
    render(<CandidateCard candidate={zeroScoreCandidate} />);
    expect(screen.getByText('No score yet')).toBeInTheDocument();
  });
});
```

## Running Tests

```bash
# Install testing dependencies (if not already installed)
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test PositionPage.test.tsx
```

## Mocking Strategy

### React Router
```typescript
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
```

### DnD Kit
```typescript
// Mock dnd-kit hooks for unit tests
jest.mock('@dnd-kit/core', () => ({
  useDndContext: () => ({ active: null }),
  useDroppable: () => ({ setNodeRef: jest.fn(), isOver: false }),
}));

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));
```

## AAA Pattern Examples

```typescript
describe('CandidateCard', () => {
  test('displays candidate information correctly', () => {
    // Arrange
    const mockCandidate = {
      id: '1',
      fullName: 'John Doe',
      averageScore: 4,
      currentInterviewStep: 'Technical Interview'
    };

    // Act
    render(<CandidateCard candidate={mockCandidate} />);

    // Assert
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByLabelText('Score: 4 out of 5')).toBeInTheDocument();
  });
});
```

## Continuous Integration

The tests are designed to run in CI/CD pipelines with:
- Automated coverage reporting
- Accessibility compliance checks
- Cross-browser compatibility validation
- Performance regression testing

## Coverage Reports

Coverage reports are generated in HTML format and include:
- Line-by-line coverage visualization
- Branch coverage analysis
- Function coverage metrics
- Uncovered code highlighting
