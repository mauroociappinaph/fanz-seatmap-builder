import { StateCreator } from "zustand";
import {
  MapElement,
  SeatMap,
  Seat,
  MAX_LABEL_LENGTHS,
  Row,
  Table,
} from "@/domain/types";
import { parsePattern } from "@/services/labeling";
import { SeatMapRepository } from "@/services/persistence/seatMapRepository";
import { strings } from "@/lib/i18n/strings";
import { MapService } from "@/services/domain/mapService";
import { EditorState } from "@/domain/types";

export interface MapSlice {
  seatMap: SeatMap;
  newMap: () => void;
  addElement: (element: MapElement) => void;
  removeElements: (ids: string[]) => void;
  updateElement: (id: string, updates: Partial<MapElement | Seat>) => void;
  moveElement: (id: string, position: { x: number; y: number }) => void;
  exportJSON: () => string;
  importJSON: (json: string) => void;
  applyBulkLabels: (pattern: string) => void;
  updateSeatCount: (id: string, count: number) => void;
}

export const initialSeatMap: SeatMap = {
  id: "initial-map",
  name: strings.nav.newMap,
  elements: [],
  viewport: { zoom: 1, panX: 0, panY: 0 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const createMapSlice: StateCreator<EditorState, [], [], MapSlice> = (
  set,
  get,
) => ({
  seatMap: initialSeatMap,

  newMap: () => {
    set({
      seatMap: {
        ...initialSeatMap,
        id: crypto.randomUUID(),
        name: strings.nav.newMap,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      selectedIds: [],
    });
  },

  addElement: (element: MapElement) => {
    set((state) => {
      const elements = state.seatMap?.elements || [];
      const idExists = elements.some((el) => el.id === element.id);
      const finalElement = idExists
        ? { ...element, id: `${element.type}-${crypto.randomUUID()}` }
        : element;

      return {
        seatMap: {
          ...(state.seatMap || initialSeatMap),
          elements: [...elements, finalElement],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  removeElements: (ids: string[]) => {
    set((state) => {
      const elements = state.seatMap?.elements || [];
      const filteredElements: MapElement[] = elements
        .filter((el) => !ids.includes(el.id))
        .map((el): MapElement => {
          if (el.type === "row" || el.type === "table") {
            const filteredSeats = el.seats.filter((s) => !ids.includes(s.id));
            return MapService.refreshLayout({
              ...el,
              seats: filteredSeats,
            } as MapElement);
          }
          return el;
        });

      return {
        seatMap: {
          ...(state.seatMap || initialSeatMap),
          elements: filteredElements,
          updatedAt: new Date().toISOString(),
        },
        selectedIds: (state.selectedIds || []).filter(
          (id) => !ids.includes(id),
        ),
        draggingId:
          state.draggingId && ids.includes(state.draggingId)
            ? null
            : state.draggingId,
        lastMousePosition:
          state.draggingId && ids.includes(state.draggingId)
            ? null
            : state.lastMousePosition,
      };
    });
  },

  updateElement: (id: string, updates: Partial<MapElement | Seat>) => {
    const sanitizedUpdates = { ...updates };
    if ("label" in sanitizedUpdates && sanitizedUpdates.label) {
      const targetType = (sanitizedUpdates as { type?: string }).type || "row";
      sanitizedUpdates.label = MapService.sanitizeLabel(
        sanitizedUpdates.label,
        targetType === "row" ||
          targetType === "table" ||
          targetType === "area" ||
          targetType === "seat"
          ? (targetType as MapElement["type"] | "seat")
          : "row",
      );
    }

    set((state) => {
      const elements = state.seatMap?.elements || [];
      return {
        seatMap: {
          ...(state.seatMap || initialSeatMap),
          elements: elements.map((el): MapElement => {
            if (el.id === id) {
              let updatedEl = {
                ...el,
                ...sanitizedUpdates,
              } as MapElement;

              const typeLimit = MAX_LABEL_LENGTHS[updatedEl.type];
              if (updatedEl.label.length > typeLimit) {
                updatedEl.label = updatedEl.label.slice(0, typeLimit);
              }

              const hasCapacity = "capacity" in updates;
              const hasSeatCount = "seatCount" in updates;

              if (hasCapacity || hasSeatCount) {
                const newCount = hasCapacity
                  ? (updates as { capacity: number }).capacity
                  : (updates as { seatCount: number }).seatCount;
                updatedEl = MapService.adjustSeatCount(updatedEl, newCount);
              }

              if (
                updatedEl.type === "row" &&
                ("seatSpacing" in updates || "seats" in updates)
              ) {
                updatedEl = MapService.refreshLayout(updatedEl);
              }

              if (updatedEl.type === "table") {
                const tableEl = updatedEl as Table;
                if ("shape" in updates) {
                  const newShape = (
                    updates as {
                      shape: "round" | "rectangular";
                    }
                  ).shape;
                  if (
                    newShape === "rectangular" &&
                    tableEl.width === tableEl.height
                  ) {
                    tableEl.width = Math.round(tableEl.width * 1.5);
                    tableEl.height = Math.round(tableEl.height * 0.8);
                  } else if (newShape === "round") {
                    const avg = Math.round(
                      (tableEl.width + tableEl.height) / 2,
                    );
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
            }

            if (el.type === "row" || el.type === "table") {
              const seatIndex = el.seats.findIndex((s) => s.id === id);
              if (seatIndex !== -1) {
                const newSeats = [...el.seats];
                newSeats[seatIndex] = {
                  ...newSeats[seatIndex],
                  ...sanitizedUpdates,
                } as Seat;
                newSeats[seatIndex].type = "seat";
                if (newSeats[seatIndex].label.length > MAX_LABEL_LENGTHS.seat) {
                  newSeats[seatIndex].label = newSeats[seatIndex].label.slice(
                    0,
                    MAX_LABEL_LENGTHS.seat,
                  );
                }
                return { ...el, seats: newSeats } as MapElement;
              }
            }

            return el;
          }),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  moveElement: (id: string, position: { x: number; y: number }) => {
    set((state) => ({
      seatMap: {
        ...state.seatMap,
        elements: state.seatMap.elements.map((el) =>
          el.id === id ? ({ ...el, position } as MapElement) : el,
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  exportJSON: () => {
    return SeatMapRepository.serialize(get().seatMap);
  },

  importJSON: (json: string) => {
    try {
      const validatedSeatMap = SeatMapRepository.deserialize(json);

      const existingIds = new Set<string>();
      validatedSeatMap.elements = validatedSeatMap.elements.map((el) => {
        if (existingIds.has(el.id)) {
          el.id = `${el.type}-${crypto.randomUUID()}`;
        }
        existingIds.add(el.id);

        if (el.type === "row" || el.type === "table") {
          el.seats = el.seats.map((s) => {
            if (existingIds.has(s.id)) {
              s.id = `s-${crypto.randomUUID()}`;
            }
            existingIds.add(s.id);
            return s;
          });
        }
        return el;
      });

      set({ seatMap: validatedSeatMap, selectedIds: [] });
    } catch (error) {
      console.error("Store: Failed to import JSON:", error);
      throw error;
    }
  },

  applyBulkLabels: (pattern: string) => {
    const labels = parsePattern(pattern);
    const { selectedIds, seatMap } = get();

    if (labels.length === 0 || !selectedIds || selectedIds.length === 0) return;

    set({
      seatMap: {
        ...seatMap,
        elements: seatMap.elements.map((el): MapElement => {
          if (selectedIds.includes(el.id)) {
            const index = selectedIds.indexOf(el.id);
            let label = labels[index % labels.length];
            label = MapService.sanitizeLabel(label, el.type);
            return { ...el, label } as MapElement;
          }

          if (el.type === "row" || el.type === "table") {
            const updatedSeats = el.seats.map((s) => {
              if (selectedIds.includes(s.id)) {
                const index = selectedIds.indexOf(s.id);
                let label = labels[index % labels.length];
                label = MapService.sanitizeLabel(label, "seat");
                return { ...s, label };
              }
              return s;
            });
            return { ...el, seats: updatedSeats } as MapElement;
          }

          return el;
        }),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  updateSeatCount: (id: string, count: number) => {
    set((state) => ({
      seatMap: {
        ...state.seatMap,
        elements: state.seatMap.elements.map((el): MapElement => {
          if (el.id === id) {
            return MapService.adjustSeatCount(el, count);
          }
          return el;
        }),
        updatedAt: new Date().toISOString(),
      },
    }));
  },
});
