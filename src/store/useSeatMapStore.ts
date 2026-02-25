import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EditorState,
  MapElement,
  Position,
  SeatMap,
  ViewportState,
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
    }),
    {
      name: "fanz-seatmap-storage",
    },
  ),
);
