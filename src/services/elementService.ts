// src/services/elementService.ts
import { MapElement, Seat, MAX_LABEL_LENGTHS } from "@/domain";
import { LayoutService } from "./layoutService";
import { SanitizationService } from "./sanitizationService";
import { parsePattern } from "./labeling";

export const ElementService = {
  /**
   * Logic for removing elements and their nested seats if applicable.
   */
  removeElements: (
    elements: MapElement[],
    idsToRemove: string[],
  ): MapElement[] => {
    return elements
      .filter((el) => !idsToRemove.includes(el.id))
      .map((el): MapElement => {
        if (el.type === "row" || el.type === "table") {
          const filteredSeats = el.seats.filter(
            (s) => !idsToRemove.includes(s.id),
          );
          return LayoutService.refreshLayout({
            ...el,
            seats: filteredSeats,
          } as MapElement);
        }
        return el;
      });
  },

  /**
   * Applies bulk labels based on a pattern to selected elements/seats.
   */
  applyBulkLabels: (
    elements: MapElement[],
    selectedIds: string[],
    pattern: string,
  ): MapElement[] => {
    const labels = parsePattern(pattern);
    if (labels.length === 0 || selectedIds.length === 0) return elements;

    return elements.map((el): MapElement => {
      if (selectedIds.includes(el.id)) {
        const index = selectedIds.indexOf(el.id);
        const rawLabel = labels[index % labels.length];
        const label = SanitizationService.sanitizeLabel(rawLabel, el.type);
        return { ...el, label } as MapElement;
      }

      if (el.type === "row" || el.type === "table") {
        const updatedSeats = el.seats.map((s) => {
          if (selectedIds.includes(s.id)) {
            const index = selectedIds.indexOf(s.id);
            const rawLabel = labels[index % labels.length];
            const label = SanitizationService.sanitizeLabel(rawLabel, "seat");
            return { ...s, label };
          }
          return s;
        });
        return { ...el, seats: updatedSeats } as MapElement;
      }

      return el;
    });
  },

  /**
   * Applies a set of updates to an existing element, encapsulating all business rules.
   */
  applyElementUpdate: (
    existing: MapElement,
    updates: Partial<MapElement | Seat>,
  ): MapElement => {
    const sanitizedUpdates = { ...updates };

    if ("label" in sanitizedUpdates && sanitizedUpdates.label) {
      sanitizedUpdates.label = SanitizationService.sanitizeLabel(
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
      updatedEl = LayoutService.adjustSeatCount(updatedEl, newCount);
    }

    // Recalculate row layout if spacing or seats changed
    if (
      updatedEl.type === "row" &&
      ("seatSpacing" in updates || "seats" in updates)
    ) {
      updatedEl = LayoutService.refreshLayout(updatedEl);
    }

    // Handle table shape change
    if (updatedEl.type === "table") {
      const tableEl = { ...updatedEl };
      if ("shape" in updates) {
        const newShape = updates.shape;
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
        updatedEl = LayoutService.refreshLayout(tableEl);
      }
    }

    return updatedEl;
  },
};
