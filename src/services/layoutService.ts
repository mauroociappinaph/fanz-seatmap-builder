// src/services/layoutService.ts
import { MapElement, Row, Table } from "@/domain";
import { calculateTableSeatPositions } from "./layout";

export const LayoutService = {
  /**
   * Helper to round coordinates and keep them within sane bounds (-50k to 50k)
   */
  roundCoordinate: (val: number): number => {
    const rounded = Math.round(val * 100) / 100;
    return Math.min(50000, Math.max(-50000, rounded));
  },

  /**
   * Calculates a new position based on delta movement, ensuring rounding.
   */
  calculateNewPosition: (
    current: { x: number; y: number },
    delta: { x: number; y: number },
  ): { x: number; y: number } => ({
    x: LayoutService.roundCoordinate(current.x + delta.x),
    y: LayoutService.roundCoordinate(current.y + delta.y),
  }),

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

    return LayoutService.refreshLayout(updatedEl);
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
            ? LayoutService.roundCoordinate(i * spacing)
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
};
