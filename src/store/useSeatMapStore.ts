// src/store/useSeatMapStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EditorState, MapElement, Position, SeatMap } from "@/domain/types";

const initialSeatMap: SeatMap = {
  id: "new-map",
  name: "Nuevo Mapa",
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
    }),
    {
      name: "fanz-seatmap-storage",
    },
  ),
);
