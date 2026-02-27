// src/services/mapService.ts
import {
  MapElement,
  MAX_LABEL_LENGTHS,
  Row,
  Table,
  SeatMap,
  Seat,
} from "@/domain";
import { calculateTableSeatPositions } from "./layout";

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
   * Removes control characters and limits length.
   */
  sanitizeLabel: (label: string, type: MapElement["type"] | "seat"): string => {
    const limit = MAX_LABEL_LENGTHS[type];

    // Remove control characters, non-printable ASCII and potentially dangerous symbols
    // Keeping alphanumeric, spaces, and basic punctuation
    const cleanLabel = label
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control chars
      .trim()
      .replace(/^[,.\s]+/, "")
      .replace(/[,.\s]+$/, "");

    return cleanLabel.slice(0, limit);
  },

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
    x: MapService.roundCoordinate(current.x + delta.x),
    y: MapService.roundCoordinate(current.y + delta.y),
  }),

  /**
   * Applies a set of updates to an existing element, encapsulating all business rules:
   * - Label sanitization using the real element type (fixes type-safety bug)
   * - Seat count adjustment and layout recalculation
   * - Table shape dimension normalization
   *
   * Extracted from the monolithic updateElement slice action (God Function refactor).
   */
  applyElementUpdate: (
    existing: MapElement,
    updates: Partial<MapElement | Seat>,
  ): MapElement => {
    const sanitizedUpdates = { ...updates };

    // Use the EXISTING element's real type — not updates.type (which may be absent)
    // This fixes the bug where type defaulted to "row" for all element types.
    if ("label" in sanitizedUpdates && sanitizedUpdates.label) {
      sanitizedUpdates.label = MapService.sanitizeLabel(
        sanitizedUpdates.label,
        existing.type,
      );
    }

    let updatedEl = { ...existing, ...sanitizedUpdates } as MapElement;

    // Enforce label length ceiling as a hard stop
    const typeLimit = MAX_LABEL_LENGTHS[updatedEl.type];
    if (updatedEl.label.length > typeLimit) {
      updatedEl.label = updatedEl.label.slice(0, typeLimit);
    }

    // Adjust seat count if capacity or seatCount changed
    const hasCapacity = "capacity" in updates;
    const hasSeatCount = "seatCount" in updates;
    if (hasCapacity || hasSeatCount) {
      const newCount = hasCapacity
        ? (updates as { capacity: number }).capacity
        : (updates as { seatCount: number }).seatCount;
      updatedEl = MapService.adjustSeatCount(updatedEl, newCount);
    }

    // Recalculate row layout if spacing or seats changed
    if (
      updatedEl.type === "row" &&
      ("seatSpacing" in updates || "seats" in updates)
    ) {
      updatedEl = MapService.refreshLayout(updatedEl);
    }

    // Handle table shape change: normalize dimensions for visual consistency
    if (updatedEl.type === "table") {
      const tableEl = updatedEl as Table;
      if ("shape" in updates) {
        const newShape = (updates as { shape: "round" | "rectangular" }).shape;
        if (newShape === "rectangular" && tableEl.width === tableEl.height) {
          tableEl.width = Math.round(tableEl.width * 1.5);
          tableEl.height = Math.round(tableEl.height * 0.8);
        } else if (newShape === "round") {
          const avg = Math.round((tableEl.width + tableEl.height) / 2);
          tableEl.width = avg;
          tableEl.height = avg;
        }
      }
      if (
        "shape" in updates ||
        "width" in updates ||
        "height" in updates ||
        "seats" in updates
      ) {
        updatedEl = MapService.refreshLayout(tableEl);
      }
    }

    return updatedEl;
  },

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
