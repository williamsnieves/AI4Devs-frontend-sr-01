import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
// arrayMove removed - using simpler logic
import { KanbanColumn } from "./KanbanColumn";
import { Position, Candidate } from "../types/kanban";

interface KanbanBoardProps {
  position: Position;
  onPositionUpdate?: (position: Position) => void;
}

export const KanbanBoard = ({
  position,
  onPositionUpdate,
}: KanbanBoardProps) => {
  const [phases, setPhases] = useState(position.phases);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Find the candidate being dragged
    for (const phase of phases) {
      const candidate = phase.candidates.find((c) => c.id === active.id);
      if (candidate) {
        setActiveCandidate(candidate);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Find source and target
    let sourcePhaseIndex = -1;
    let sourceCandidateIndex = -1;
    let targetPhaseIndex = -1;

    // Find source
    for (let i = 0; i < phases.length; i++) {
      const candidateIndex = phases[i].candidates.findIndex(
        (c) => c.id === activeId
      );
      if (candidateIndex !== -1) {
        sourcePhaseIndex = i;
        sourceCandidateIndex = candidateIndex;
        break;
      }
    }

    // Find target phase (could be phase ID or candidate ID)
    for (let i = 0; i < phases.length; i++) {
      if (phases[i].id === overId) {
        targetPhaseIndex = i;
        break;
      }
      // If dropping on a candidate, find its phase
      if (phases[i].candidates.some((c) => c.id === overId)) {
        targetPhaseIndex = i;
        break;
      }
    }

    if (sourcePhaseIndex === -1 || targetPhaseIndex === -1) return;

    setPhases((currentPhases) => {
      const newPhases = [...currentPhases];

      // Get the candidate being moved
      const draggedCandidate =
        newPhases[sourcePhaseIndex].candidates[sourceCandidateIndex];

      // Safety check
      if (!draggedCandidate) {
        return currentPhases;
      }

      // Remove from source
      newPhases[sourcePhaseIndex] = {
        ...newPhases[sourcePhaseIndex],
        candidates: newPhases[sourcePhaseIndex].candidates.filter(
          (c) => c.id !== activeId
        ),
      };

      // Create updated candidate
      const updatedCandidate = {
        ...draggedCandidate,
        currentInterviewStep: newPhases[targetPhaseIndex].name,
      };

      // If dropping on same phase, handle reordering
      if (sourcePhaseIndex === targetPhaseIndex) {
        const targetCandidateIndex = newPhases[
          targetPhaseIndex
        ].candidates.findIndex((c) => c.id === overId);

        if (targetCandidateIndex !== -1) {
          // Insert at specific position
          const newCandidates = [...newPhases[targetPhaseIndex].candidates];
          newCandidates.splice(targetCandidateIndex, 0, updatedCandidate);
          newPhases[targetPhaseIndex] = {
            ...newPhases[targetPhaseIndex],
            candidates: newCandidates,
          };
        } else {
          // Add to end
          newPhases[targetPhaseIndex] = {
            ...newPhases[targetPhaseIndex],
            candidates: [
              ...newPhases[targetPhaseIndex].candidates,
              updatedCandidate,
            ],
          };
        }
      } else {
        // Add to end of target phase
        newPhases[targetPhaseIndex] = {
          ...newPhases[targetPhaseIndex],
          candidates: [
            ...newPhases[targetPhaseIndex].candidates,
            updatedCandidate,
          ],
        };
      }

      return newPhases;
    });

    // Notify parent
    if (onPositionUpdate) {
      setTimeout(() => {
        onPositionUpdate({ ...position, phases });
      }, 0);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {phases.map((phase) => (
          <KanbanColumn key={phase.id} phase={phase} />
        ))}
      </div>

      <DragOverlay>
        {activeCandidate ? (
          <div className="candidate-card dragging">
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div className="flex-fill">
                <h3 style={{ fontSize: "0.95rem", margin: "0 0 0.5rem 0" }}>
                  {activeCandidate.fullName}
                </h3>
                <div className="d-flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor:
                          index < Math.round(activeCandidate.averageScore)
                            ? "#198754"
                            : "#dee2e6",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: "14px", color: "#6c757d" }}>⋮⋮</div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
