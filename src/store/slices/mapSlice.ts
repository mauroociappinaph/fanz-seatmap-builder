import { StateCreator } from "zustand";
import {
  MapElement,
  SeatMap,
  Seat,
  MAX_LABEL_LENGTHS,
  EditorState,
} from "@/domain";
import { strings } from "@/lib";
import { MapService, SeatMapRepository, parsePattern } from "@/services";

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
    set((state) => {
      const elements = state.seatMap?.elements || [];
      return {
        seatMap: {
          ...(state.seatMap || initialSeatMap),
          elements: elements.map((el): MapElement => {
            // Direct element match: delegate all logic to MapService
            if (el.id === id) {
              return MapService.applyElementUpdate(el, updates);
            }

            // Nested seat match inside a row or table
            if (el.type === "row" || el.type === "table") {
              const seatIndex = el.seats.findIndex((s) => s.id === id);
              if (seatIndex !== -1) {
                const newSeats = [...el.seats];
                const updatedSeat = {
                  ...newSeats[seatIndex],
                  ...updates,
                  type: "seat" as const,
                } as Seat;

                // Enforce seat label limit
                if (updatedSeat.label.length > MAX_LABEL_LENGTHS.seat) {
                  updatedSeat.label = updatedSeat.label.slice(
                    0,
                    MAX_LABEL_LENGTHS.seat,
                  );
                }
                newSeats[seatIndex] = updatedSeat;
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
