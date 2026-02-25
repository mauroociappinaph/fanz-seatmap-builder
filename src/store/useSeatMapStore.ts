import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EditorState,
  MapElement,
  Position,
  SeatMap,
  ViewportState,
  Row,
  Table,
  Area,
} from "@/domain/types";
import { parsePattern } from "@/services/labeling";

const initialSeatMap: SeatMap = {
  id: "initial-map",
  name: "Mapa Vacío",
  elements: [],
  viewport: { zoom: 1, panX: 0, panY: 0 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useSeatMapStore = create<EditorState>()(
  persist(
    (set, get) => ({
      seatMap: initialSeatMap,
      selectedIds: [],
      activeTool: "select",

      newMap: () => {
        set({
          seatMap: {
            ...initialSeatMap,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          selectedIds: [],
        });
      },

      addElement: (element: MapElement) => {
        set((state) => ({
          seatMap: {
            ...state.seatMap,
            elements: [...state.seatMap.elements, element],
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      removeElements: (ids: string[]) => {
        set((state) => ({
          seatMap: {
            ...state.seatMap,
            elements: state.seatMap.elements.filter(
              (el) => !ids.includes(el.id),
            ),
            updatedAt: new Date().toISOString(),
          },
          selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
        }));
      },

      updateElement: (id: string, updates: Partial<MapElement>) => {
        set((state) => ({
          seatMap: {
            ...state.seatMap,
            elements: state.seatMap.elements.map((el) =>
              el.id === id ? ({ ...el, ...updates } as MapElement) : el,
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      moveElement: (id: string, position: Position) => {
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

      setSelection: (ids: string[]) => {
        set({ selectedIds: ids });
      },

      toggleSelection: (id: string) => {
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        }));
      },

      exportJSON: () => {
        return JSON.stringify(get().seatMap, null, 2);
      },

      importJSON: (json: string) => {
        try {
          const seatMap = JSON.parse(json) as SeatMap;
          // TODO: Add schema validation
          set({ seatMap, selectedIds: [] });
        } catch (error) {
          console.error("Failed to import JSON:", error);
        }
      },

      applyBulkLabels: (pattern: string) => {
        const labels = parsePattern(pattern);
        const { selectedIds, seatMap } = get();

        set({
          seatMap: {
            ...seatMap,
            elements: seatMap.elements.map((el) => {
              if (selectedIds.includes(el.id)) {
                const index = selectedIds.indexOf(el.id);
                // Cycle through labels if there are more elements than labels
                const label = labels[index % labels.length];
                return { ...el, label } as MapElement;
              }
              return el;
            }),
            updatedAt: new Date().toISOString(),
          },
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

      addRow: () => {
        const { viewport } = get().seatMap;
        const newRow: Row = {
          id: `row-${crypto.randomUUID()}`,
          type: "row",
          label: "Nueva Fila",
          position: { x: viewport.panX + 50, y: viewport.panY + 50 },
          rotation: 0,
          seatSpacing: 30,
          seats: [
            {
              id: `s-${crypto.randomUUID()}`,
              type: "seat",
              label: "1",
              cx: 0,
              cy: 0,
              status: "available",
            },
            {
              id: `s-${crypto.randomUUID()}`,
              type: "seat",
              label: "2",
              cx: 30,
              cy: 0,
              status: "available",
            },
          ],
        };
        get().addElement(newRow);
        get().setSelection([newRow.id]);
      },

      addTable: () => {
        const { viewport } = get().seatMap;
        const newTable: Table = {
          id: `table-${crypto.randomUUID()}`,
          type: "table",
          label: "T",
          position: { x: viewport.panX + 200, y: viewport.panY + 200 },
          rotation: 0,
          shape: "round",
          width: 80,
          height: 80,
          seats: [],
        };
        get().addElement(newTable);
        get().setSelection([newTable.id]);
      },

      addArea: () => {
        const { viewport } = get().seatMap;
        const px = viewport.panX + 100;
        const py = viewport.panY + 100;
        const newArea: Area = {
          id: `area-${crypto.randomUUID()}`,
          type: "area",
          label: "Nueva Área",
          points: [
            { x: px, y: py },
            { x: px + 100, y: py },
            { x: px + 100, y: py + 100 },
            { x: px, y: py + 100 },
          ],
          color: "rgba(59, 130, 246, 0.2)",
        };
        get().addElement(newArea);
        get().setSelection([newArea.id]);
      },
    }),
    {
      name: "fanz-seatmap-storage",
    },
  ),
);
