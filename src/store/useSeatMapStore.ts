import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EditorState } from "@/domain";
import { createMapSlice, createUISlice } from "./slices";

export const useSeatMapStore = create<EditorState>()(
  persist(
    (...a) => ({
      ...createMapSlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: "fanz-seatmap-storage",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 1) {
          const state = persistedState as {
            seatMap?: { elements?: Record<string, unknown> | unknown[] };
          };
          // If elements is a Record (object), convert it back to Array or just reset
          if (
            state.seatMap?.elements &&
            !Array.isArray(state.seatMap.elements)
          ) {
            state.seatMap.elements = Object.values(state.seatMap.elements);
          }
        }
        return persistedState as EditorState;
      },
      partialize: (state) => ({
        seatMap: state.seatMap,
      }),
    },
  ),
);
