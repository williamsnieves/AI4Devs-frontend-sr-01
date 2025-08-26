import { useState, useEffect } from "react";
import { Position } from "../types/kanban";
import { adaptedMockPosition } from "../data/mockData";

interface UsePositionDataProps {
  positionId?: string;
}

export const usePositionData = ({ positionId }: UsePositionDataProps = {}) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchPosition = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // For now, return mock data regardless of positionId
        // Later this will make actual API call to /positions/{id}
        setPosition(adaptedMockPosition);
      } catch (err) {
        setError("Failed to load position data");
        console.error("Error fetching position:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosition();
  }, [positionId]);

  const updatePosition = (updatedPosition: Position) => {
    setPosition(updatedPosition);

    // TODO: Here you would typically make API call to save changes
    // Example: await fetch(`/api/positions/${updatedPosition.id}`, { method: 'PUT', body: JSON.stringify(updatedPosition) })
    console.log("Position updated:", updatedPosition);
  };

  return {
    position,
    loading,
    error,
    updatePosition,
    refetch: () => {
      setPosition(null);
      setLoading(true);
      // Re-trigger useEffect
    },
  };
};
