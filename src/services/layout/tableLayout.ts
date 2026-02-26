import { Table, Seat } from "../../domain/types";

/**
 * Calculates the relative positions (cx, cy) for seats around a table
 * using trigonometry for round tables and perimeter distribution for rectangular ones.
 */
export const calculateTableSeatPositions = (table: Table): Seat[] => {
  const { seats, shape, width, height } = table;
  const count = seats.length;
  if (count === 0) return [];

  // Offset from the table edge so seats don't touch the table surface
  const margin = 15;

  if (shape === "round") {
    const radius = width / 2 + margin;
    return seats.map((seat, i) => {
      const angle = (i * 2 * Math.PI) / count;
      return {
        ...seat,
        cx: Math.cos(angle) * radius,
        cy: Math.sin(angle) * radius,
      };
    });
  } else {
    // Rectangular table: distribute along sides
    // Simplified: divide seats among 4 sides
    const w = width + margin * 2;
    const h = height + margin * 2;

    return seats.map((seat, i) => {
      // Basic distribution for MVP:
      // This could be much more complex (calculating actual perimeter)
      // but for now we'll place them in a circular pattern around the rectangle
      // which looks professional enough for most rectangular tables.
      const angle = (i * 2 * Math.PI) / count;
      return {
        ...seat,
        cx: Math.cos(angle) * (w / 2),
        cy: Math.sin(angle) * (h / 2),
      };
    });
  }
};
