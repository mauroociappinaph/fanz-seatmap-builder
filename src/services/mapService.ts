// src/services/mapService.ts
import { SeatMap, MapElement } from "@/domain";
import { LayoutService } from "./layoutService";
import { SanitizationService } from "./sanitizationService";
import { ElementService } from "./elementService";

/**
 * MapService acts as a central facade for the fragmented services:
 * LayoutService, SanitizationService, and ElementService.
 */
export const MapService = {
  // Delegated Layout methods
  roundCoordinate: LayoutService.roundCoordinate,
  calculateNewPosition: LayoutService.calculateNewPosition,
  adjustSeatCount: LayoutService.adjustSeatCount,
  refreshLayout: LayoutService.refreshLayout,

  // Delegated Sanitization methods
  sanitizeLabel: SanitizationService.sanitizeLabel,

  // Delegated Element methods
  removeElements: ElementService.removeElements,
  applyBulkLabels: ElementService.applyBulkLabels,
  applyElementUpdate: ElementService.applyElementUpdate,

  /**
   * Deep cleans the seat map data before export.
   * Keeps this as a service orchestrator.
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
            label: SanitizationService.sanitizeLabel(el.label, el.type),
          };

          if (cleanEl.type === "row" || cleanEl.type === "table") {
            cleanEl.seats = cleanEl.seats.map((s) => ({
              ...s,
              label: SanitizationService.sanitizeLabel(s.label, "seat"),
              cx: LayoutService.roundCoordinate(s.cx),
              cy: LayoutService.roundCoordinate(s.cy),
            }));
          }

          if ("position" in cleanEl) {
            cleanEl.position = {
              x: LayoutService.roundCoordinate(cleanEl.position.x),
              y: LayoutService.roundCoordinate(cleanEl.position.y),
            };
          }

          return cleanEl as MapElement;
        }),
      updatedAt: new Date().toISOString(),
    };
  },
};
