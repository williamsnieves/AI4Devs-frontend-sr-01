import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Candidate } from "../types/kanban";

interface CandidateCardProps {
  candidate: Candidate;
}

export const CandidateCard = ({ candidate }: CandidateCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`candidate-card ${isDragging ? "dragging" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div className="flex-fill">
          <h3 className="candidate-name">{candidate.fullName}</h3>
          <div className="d-flex gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`score-dot ${
                  index < Math.round(candidate.averageScore)
                    ? "filled"
                    : "empty"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="drag-handle">⋮⋮</div>
      </div>
    </div>
  );
};
