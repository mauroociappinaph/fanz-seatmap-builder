// src/services/domain/mapService.ts
import { MapElement, MAX_LABEL_LENGTHS } from "../../domain/types";
import { calculateTableSeatPositions } from "../layout/tableLayout";

export const MapService = {
  /**
   * Adjusts seat count for a parent element (Row or Table) and recalculates layout.
   */
  adjustSeatCount: (element: MapElement, count: number): MapElement => {
    if (element.type !== "row" && element.type !== "table") return element;

    const currentSeats = element.seats || [];
    const diff = count - currentSeats.length;

    let newSeats = [...currentSeats];
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        newSeats.push({
          id: `s-${crypto.randomUUID()}`,
          type: "seat",
          label: String(currentSeats.length + i + 1),
          cx: 0,
          cy: 0,
          status: "available",
        });
      }
    } else if (diff < 0) {
      newSeats = newSeats.slice(0, count);
    }

    if (element.type === "row") {
      const spacing = element.seatSpacing || 30;
      return {
        ...element,
        seatCount: count,
        seats: newSeats.map((s, i) => ({
          ...s,
          cx: i * spacing,
          cy: 0,
        })),
      };
    } else {
      const updatedTable = { ...element, seats: newSeats };
      updatedTable.seats = calculateTableSeatPositions(updatedTable);
      return updatedTable;
    }
  },

  /**
   * Sanitizes and applies a new label based on element type.
   */
  sanitizeLabel: (label: string, type: MapElement["type"] | "seat"): string => {
    const limit = MAX_LABEL_LENGTHS[type];
    return label.slice(0, limit);
  },

  /**
   * Helper to round coordinates to prevent floating point drift.
   */
  roundCoordinate: (val: number): number => Math.round(val * 100) / 100,
};
