import { StateCreator } from "zustand";
import { MapElement, SeatMap, Seat, EditorState } from "@/domain";
import { strings } from "@/lib";
import { toast } from "sonner";
import { MapService, SeatMapRepository, ElementFactory } from "@/services";

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
  addRow: (pos?: { x: number; y: number }) => void;
  addTable: (pos?: { x: number; y: number }) => void;
  addArea: (pos?: { x: number; y: number }) => void;
}

export const initialSeatMap: SeatMap = {
  // ... existing initialSeatMap ...
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
      activeTool: "select",
      draggingId: null,
      lastMousePosition: null,
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
      const filteredElements = MapService.removeElements(elements, ids);

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
            // Direct element match
            if (el.id === id) {
              return MapService.applyElementUpdate(el, updates);
            }

            // Nested seat match
            if (el.type === "row" || el.type === "table") {
              const seatIndex = el.seats.findIndex((s) => s.id === id);
              if (seatIndex !== -1) {
                const newSeats = [...el.seats];
                const rawSeat = {
                  ...newSeats[seatIndex],
                  ...updates,
                } as Seat;

                const updatedSeat = {
                  ...rawSeat,
                  label: MapService.sanitizeLabel(rawSeat.label, "seat"),
                  type: "seat" as const,
                } as Seat;

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
      // Ensure unique IDs on import
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
      toast.success(strings.messages.importSuccess);
    } catch (error) {
      console.error("Store: Failed to import JSON:", error);
      toast.error(
        error instanceof Error ? error.message : strings.messages.importError,
      );
      throw error;
    }
  },

  applyBulkLabels: (pattern: string) => {
    const { selectedIds, seatMap } = get();
    if (!selectedIds || selectedIds.length === 0) return;

    set({
      seatMap: {
        ...seatMap,
        elements: MapService.applyBulkLabels(
          seatMap.elements,
          selectedIds,
          pattern,
        ),
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

  addRow: (pos) => {
    const { seatMap, creationConfig } = get();
    const position = pos || {
      x: seatMap.viewport.panX + 100,
      y: seatMap.viewport.panY + 100,
    };

    const existingCount = seatMap.elements.filter(
      (el) => el.type === "row",
    ).length;
    const label = `${strings.elements.newRow} ${existingCount + 1}`;

    const newRow = ElementFactory.createRow(
      position,
      creationConfig.rowSeats,
      30,
      label,
    );
    get().addElement(newRow);
    get().setSelection([newRow.id]);
    get().setActiveTool("select");
  },

  addTable: (pos) => {
    const { seatMap, creationConfig } = get();
    const position = pos || {
      x: seatMap.viewport.panX + 200,
      y: seatMap.viewport.panY + 200,
    };

    const existingCount = seatMap.elements.filter(
      (el) => el.type === "table",
    ).length;
    const label = `${strings.elements.newTable} ${existingCount + 1}`;

    const newTable = ElementFactory.createTable(
      position,
      creationConfig.tableSeats,
      label,
    );
    get().addElement(newTable);
    get().setSelection([newTable.id]);
    get().setActiveTool("select");
  },

  addArea: (pos) => {
    const { seatMap } = get();
    const startPos = pos || {
      x: seatMap.viewport.panX + 150,
      y: seatMap.viewport.panY + 150,
    };

    const existingCount = seatMap.elements.filter(
      (el) => el.type === "area",
    ).length;
    const label = `${strings.elements.newArea} ${existingCount + 1}`;

    const newArea = ElementFactory.createArea(startPos, label);
    get().addElement(newArea);
    get().setSelection([newArea.id]);
    get().setActiveTool("select");
  },
});
