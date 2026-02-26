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
      // Start from the top (-PI/2) for better visual ordering
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      return {
        ...seat,
        cx: Math.cos(angle) * radius,
        cy: Math.sin(angle) * radius,
      };
    });
  } else {
    // Rectangular table: distribute evenly along the perimeter
    const w = width + margin * 2;
    const h = height + margin * 2;
    const perimeter = 2 * (w + h);

    return seats.map((seat, i) => {
      // Find position along the perimeter (0 to perimeter)
      // We add 0.5 to offset seats into the center of their perimeter segment
      // this ensures symmetry and prevents seats from sticking to corners.
      const distance = ((i + 0.5) / count) * perimeter;

      let cx = 0;
      let cy = 0;

      // Top edge (left to right)
      if (distance < w) {
        cx = -w / 2 + distance;
        cy = -h / 2;
      }
      // Right edge (top to bottom)
      else if (distance < w + h) {
        cx = w / 2;
        cy = -h / 2 + (distance - w);
      }
      // Bottom edge (right to left)
      else if (distance < 2 * w + h) {
        cx = w / 2 - (distance - (w + h));
        cy = h / 2;
      }
      // Left edge (bottom to top)
      else {
        cx = -w / 2;
        cy = h / 2 - (distance - (2 * w + h));
      }

      return {
        ...seat,
        cx,
        cy,
      };
    });
  }
};
