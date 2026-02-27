import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EditorState, Row } from "@/domain";
import { createMapSlice, createUISlice } from "./slices";

export const useSeatMapStore = create<EditorState>()(
  persist(
    (...a) => ({
      ...createMapSlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: "fanz-seatmap-storage",
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const state = persistedState as EditorState;
          if (state.seatMap?.elements) {
            state.seatMap.elements = state.seatMap.elements.map((el) => {
              if (el.type === "row" && !("seatCount" in el)) {
                const rowEl = el as unknown as Row;
                return {
                  ...rowEl,
                  seatCount: rowEl.seats?.length || 0,
                } as Row;
              }
              return el;
            });
          }
          return state;
        }
        return persistedState as EditorState;
      },
      partialize: (state) => ({
        seatMap: state.seatMap,
      }),
    },
  ),
);
