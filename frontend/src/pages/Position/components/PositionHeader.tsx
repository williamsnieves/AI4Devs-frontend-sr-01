import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

interface PositionHeaderProps {
  title: string;
}

export const PositionHeader = ({ title }: PositionHeaderProps) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/positions");
  };

  return (
    <header className="d-flex align-items-center gap-3 mb-4">
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={handleBackClick}
        className="flex-shrink-0 d-flex align-items-center justify-content-center"
        style={{ width: "40px", height: "40px", transition: "all 0.2s ease" }}
        aria-label="Back to positions"
      >
        <span aria-hidden="true">←</span>
      </Button>
      <h1 className="fs-4 fs-md-3 fw-bold text-dark text-truncate mb-0">
        {title}
      </h1>
    </header>
  );
};
