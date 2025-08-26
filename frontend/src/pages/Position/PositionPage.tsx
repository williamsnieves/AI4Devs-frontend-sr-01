import React from "react";
import { useParams } from "react-router-dom";
import { PositionHeader } from "./components/PositionHeader";
import { KanbanBoard } from "./components/KanbanBoard";
import { usePositionBoard } from "./hooks/usePositionBoard";
import { Spinner, Container, Alert } from "react-bootstrap";

const PositionPage = () => {
  const { id } = useParams<{ id: string }>();
  const { loading, error, position, moveCandidate } = usePositionBoard(id);

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div>Loading position data...</div>
        </div>
      </Container>
    );
  }

  if (!position) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Position not found</Alert>
      </Container>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Container
        fluid
        className="px-3 py-4"
        style={{ maxWidth: "1400px", margin: "0 auto" }}
      >
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        <PositionHeader title={position.title} />
        <main>
          <KanbanBoard position={position} onCandidateMove={moveCandidate} />
        </main>
      </Container>
    </div>
  );
};

export default PositionPage;
