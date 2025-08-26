import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CandidateCard } from "./CandidateCard";
import { Phase } from "../types/kanban";

interface KanbanColumnProps {
  phase: Phase;
}

export const KanbanColumn = ({ phase }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: phase.id,
  });

  return (
    <div className="kanban-column-wrapper">
      <div className={`kanban-column ${isOver ? "drag-over" : ""}`}>
        <div className="kanban-column-header">
          <h3 className="kanban-column-title">{phase.name}</h3>
          <p className="kanban-column-count">
            {phase.candidates.length} candidate
            {phase.candidates.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div ref={setNodeRef} className="kanban-column-content">
          <SortableContext
            items={phase.candidates.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {phase.candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
            {phase.candidates.length === 0 && (
              <div className="empty-column-message">Drop candidates here</div>
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
};
