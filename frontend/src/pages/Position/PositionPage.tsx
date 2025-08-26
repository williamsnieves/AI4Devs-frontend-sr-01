import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PositionHeader } from "./components/PositionHeader";
import { KanbanBoard } from "./components/KanbanBoard";
import { adaptedMockPosition } from "./data/mockData";
import { Position } from "./types/kanban";
import { Spinner, Container } from "react-bootstrap";

const PositionPage = () => {
  const { id } = useParams<{ id: string }>();
  const [position, setPosition] = useState<Position>(adaptedMockPosition);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [id]);

  const handlePositionUpdate = (updatedPosition: Position) => {
    setPosition(updatedPosition);
    console.log("Position updated:", updatedPosition);
  };

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

  return (
    <div className="min-vh-100 bg-light">
      <Container
        fluid
        className="px-3 py-4"
        style={{ maxWidth: "1400px", margin: "0 auto" }}
      >
        <PositionHeader title={position.title} />
        <main>
          <KanbanBoard
            position={position}
            onPositionUpdate={handlePositionUpdate}
          />
        </main>
      </Container>
    </div>
  );
};

export default PositionPage;
