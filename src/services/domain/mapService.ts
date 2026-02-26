// src/services/domain/mapService.ts
import {
  MapElement,
  MAX_LABEL_LENGTHS,
  Row,
  Table,
  SeatMap,
} from "../../domain/types";
import { calculateTableSeatPositions } from "../layout/tableLayout";

export const MapService = {
  /**
   * Adjusts seat count for a parent element (Row or Table) and recalculates layout.
   * Also ensures seat labels are sequential.
   */
  adjustSeatCount: (element: MapElement, count: number): MapElement => {
    if (element.type !== "row" && element.type !== "table") return element;

    const currentSeats = element.seats || [];
    const diff = count - currentSeats.length;

    const newSeats = [...currentSeats];
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
      newSeats.splice(count);
    }

    const updatedEl = { ...element, seats: newSeats };
    if (updatedEl.type === "row") {
      updatedEl.seatCount = count;
    } else {
      updatedEl.capacity = count;
    }

    return MapService.refreshLayout(updatedEl);
  },

  /**
   * Recalculates the positions and labels of seats within a group to ensure consistency.
   */
  refreshLayout: (element: MapElement): MapElement => {
    if (element.type === "area") return element;

    const spacing = (element as Row).seatSpacing || 30;

    // Re-label seats sequentially if they are numeric labels
    const updatedSeats = element.seats.map((s, i) => {
      const isNumeric = !isNaN(Number(s.label));
      return {
        ...s,
        label: isNumeric ? String(i + 1) : s.label,
        cx:
          element.type === "row"
            ? MapService.roundCoordinate(i * spacing)
            : s.cx,
        cy: element.type === "row" ? 0 : s.cy,
      };
    });

    const updatedEl = { ...element, seats: updatedSeats };

    if (updatedEl.type === "row") {
      updatedEl.seatCount = updatedSeats.length;
      return updatedEl as Row;
    } else {
      const tableEl = updatedEl as Table;
      tableEl.capacity = updatedSeats.length;
      tableEl.seats = calculateTableSeatPositions(tableEl);
      return tableEl;
    }
  },

  /**
   * Sanitizes and applies a new label based on element type.
   */
  sanitizeLabel: (label: string, type: MapElement["type"] | "seat"): string => {
    const limit = MAX_LABEL_LENGTHS[type];

    // Aggressive cleanup for typos like ", Área"
    const cleanLabel = label
      .trim()
      .replace(/^[,.\s]+/, "") // Remove leading commas, dots, or spaces
      .replace(/[,.\s]+$/, ""); // Remove trailing commas, dots, or spaces

    return cleanLabel.slice(0, limit);
  },

  /**
   * Helper to round coordinates to prevent floating point drift.
   */
  roundCoordinate: (val: number): number => Math.round(val * 100) / 100,

  /**
   * Deep cleans the seat map data before export.
   * Removes empty rows/tables and sanitizes all data.
   */
  cleanMapData: (seatMap: SeatMap): SeatMap => {
    return {
      ...seatMap,
      elements: seatMap.elements
        .filter((el) => {
          // Remove rows/tables with 0 seats (Ghost Elements)
          if (
            (el.type === "row" || el.type === "table") &&
            el.seats.length === 0
          ) {
            return false;
          }
          return true;
        })
        .map((el) => {
          // Final label sanitization
          const cleanEl = {
            ...el,
            label: MapService.sanitizeLabel(el.label, el.type),
          };

          if (cleanEl.type === "row" || cleanEl.type === "table") {
            cleanEl.seats = cleanEl.seats.map((s) => ({
              ...s,
              label: MapService.sanitizeLabel(s.label, "seat"),
              cx: MapService.roundCoordinate(s.cx),
              cy: MapService.roundCoordinate(s.cy),
            }));
          }

          if ("position" in cleanEl) {
            cleanEl.position = {
              x: MapService.roundCoordinate(cleanEl.position.x),
              y: MapService.roundCoordinate(cleanEl.position.y),
            };
          }

          return cleanEl as MapElement;
        }),
      updatedAt: new Date().toISOString(),
    };
  },
};
