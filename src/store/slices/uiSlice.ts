import { StateCreator } from "zustand";
import {
  Position,
  ViewportState,
  EditorState,
  Seat,
  MapElement,
} from "@/domain";
import { MapService } from "@/services";

export interface UISlice {
  selectedIds: string[];
  activeTool: "select" | "addRow" | "addTable" | "addArea";
  draggingId: string | null;
  lastMousePosition: Position | null;
  creationConfig: {
    rowSeats: number;
    tableSeats: number;
  };

  setSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  selectElement: (id: string, isMulti?: boolean) => void;
  updateViewport: (updates: Partial<ViewportState>) => void;
  updateCreationConfig: (
    updates: Partial<{ rowSeats: number; tableSeats: number }>,
  ) => void;
  setActiveTool: (tool: "select" | "addRow" | "addTable" | "addArea") => void;
  startDragging: (id: string, position: Position) => void;
  stopDragging: () => void;
  handleDragMove: (position: Position) => void;
}

export const createUISlice: StateCreator<EditorState, [], [], UISlice> = (
  set,
  get,
) => ({
  selectedIds: [],
  activeTool: "select",
  draggingId: null,
  lastMousePosition: null,
  creationConfig: {
    rowSeats: 10,
    tableSeats: 4,
  },

  setSelection: (ids: string[]) => {
    set({ selectedIds: ids });
  },

  toggleSelection: (id: string) => {
    set((state) => ({
      selectedIds: (state.selectedIds || []).includes(id)
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...(state.selectedIds || []), id],
    }));
  },

  selectElement: (id: string, isMulti?: boolean) => {
    set((state) => {
      const currentSelection = state.selectedIds || [];
      if (isMulti) {
        return {
          selectedIds: currentSelection.includes(id)
            ? currentSelection.filter((sid) => sid !== id)
            : [...currentSelection, id],
        };
      } else {
        return { selectedIds: [id] };
      }
    });
  },

  updateViewport: (updates: Partial<ViewportState>) => {
    set((state) => ({
      seatMap: {
        ...state.seatMap,
        viewport: { ...state.seatMap.viewport, ...updates },
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  updateCreationConfig: (
    updates: Partial<{ rowSeats: number; tableSeats: number }>,
  ) => {
    set((state) => ({
      creationConfig: { ...state.creationConfig, ...updates },
    }));
  },

  setActiveTool: (tool) => set({ activeTool: tool }),

  startDragging: (id, position) => {
    set({ draggingId: id, lastMousePosition: position });
  },

  stopDragging: () => {
    set({ draggingId: null, lastMousePosition: null });
  },

  handleDragMove: (position) => {
    const { draggingId, lastMousePosition, seatMap, selectedIds } = get();
    if (!draggingId || !lastMousePosition || !seatMap) return;

    const dx = position.x - lastMousePosition.x;
    const dy = position.y - lastMousePosition.y;

    const idsToMove = selectedIds.includes(draggingId)
      ? selectedIds
      : [draggingId];

    set((state) => ({
      seatMap: {
        ...state.seatMap,
        elements: state.seatMap.elements.map((el) => {
          if (idsToMove.includes(el.id)) {
            if ("position" in el) {
              return {
                ...el,
                position: {
                  x: MapService.roundCoordinate(el.position.x + dx),
                  y: MapService.roundCoordinate(el.position.y + dy),
                },
              } as MapElement;
            } else if (el.type === "area") {
              return {
                ...el,
                points: el.points.map((p) => ({
                  x: MapService.roundCoordinate(p.x + dx),
                  y: MapService.roundCoordinate(p.y + dy),
                })),
              } as MapElement;
            }
          }

          if (el.type === "row" || el.type === "table") {
            const hasSelectedSeat = el.seats.some((s) =>
              idsToMove.includes(s.id),
            );
            if (hasSelectedSeat) {
              return {
                ...el,
                seats: el.seats.map((s) =>
                  idsToMove.includes(s.id)
                    ? ({
                        ...s,
                        cx: MapService.roundCoordinate(s.cx + dx),
                        cy: MapService.roundCoordinate(s.cy + dy),
                      } as Seat)
                    : s,
                ),
              } as MapElement;
            }
          }

          return el;
        }),
        updatedAt: new Date().toISOString(),
      },
      lastMousePosition: position,
    }));
  },
});
