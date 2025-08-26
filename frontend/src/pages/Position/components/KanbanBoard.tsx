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
  onCandidateMove?: (candidateId: string, stepId: string) => Promise<void>;
}

export const KanbanBoard = ({
  position,
  onCandidateMove,
}: KanbanBoardProps) => {
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
    console.log("🎯 Drag Start - activeId:", active.id);

    // Find the candidate being dragged
    for (const phase of position.phases) {
      const candidate = phase.candidates.find((c) => c.id === active.id);
      if (candidate) {
        console.log("✅ Found candidate:", candidate.fullName);
        setActiveCandidate(candidate);
        break;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);

    console.log("🎯 Drag End - activeId:", active.id, "overId:", over?.id);

    if (!over) {
      console.log("❌ No drop target");
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    // Find target phase ID
    let targetPhaseId = overId;

    // If dropping on a candidate, find its phase
    if (overId.startsWith("candidate-")) {
      const targetPhase = position.phases.find((phase) =>
        phase.candidates.some((c) => c.id === overId)
      );
      if (targetPhase) {
        targetPhaseId = targetPhase.id;
        console.log("🔄 Dropping on candidate, target phase:", targetPhaseId);
      }
    } else {
      console.log("🎯 Dropping on phase:", targetPhaseId);
    }

    // Use backend integration
    if (onCandidateMove) {
      console.log("🚀 Calling onCandidateMove:", activeId, "->", targetPhaseId);
      try {
        await onCandidateMove(activeId, targetPhaseId);
        console.log("✅ Move completed successfully");
      } catch (error) {
        console.error("❌ Failed to move candidate:", error);
        // Error handling is done in the hook
      }
    } else {
      console.log("⚠️ No onCandidateMove function provided");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {position.phases.map((phase) => (
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
