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
            elements: state.seatMap.elements
              .filter((el) => !ids.includes(el.id))
              .map((el) => {
                if (el.type === "row" || el.type === "table") {
                  return {
                    ...el,
                    seats: el.seats.filter((s) => !ids.includes(s.id)),
                  };
                }
                return el;
              }),
            updatedAt: new Date().toISOString(),
          },
          selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
        }));
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateElement: (id: string, updates: Partial<any>) => {
        set((state) => ({
          seatMap: {
            ...state.seatMap,
            elements: state.seatMap.elements.map((el) => {
              if (el.id === id) {
                const updatedEl = { ...el, ...updates };

                // Si es una fila y se actualizó el espaciado, recalculamos posiciones de asientos
                if (
                  updatedEl.type === "row" &&
                  ("seatSpacing" in updates || "seats" in updates)
                ) {
                  const spacing = updatedEl.seatSpacing || 30;
                  updatedEl.seats = updatedEl.seats.map(
                    (s: Seat, i: number) => ({
                      ...s,
                      cx: i * spacing,
                      cy: 0,
                    }),
                  );
                }

                return updatedEl;
              }
              if (el.type === "row" || el.type === "table") {
                const hasSeat = el.seats.some((s) => s.id === id);
                if (hasSeat) {
                  return {
                    ...el,
                    seats: el.seats.map((s) =>
                      s.id === id ? { ...s, ...updates } : s,
                    ),
                  };
                }
              }
              return el;
            }),
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

        if (labels.length === 0 || selectedIds.length === 0) return;

        set({
          seatMap: {
            ...seatMap,
            elements: seatMap.elements.map((el) => {
              // Si el elemento raíz está seleccionado, lo etiquetamos
              if (selectedIds.includes(el.id)) {
                const index = selectedIds.indexOf(el.id);
                const label = labels[index % labels.length];
                return { ...el, label } as MapElement;
              }

              // Si es una fila o mesa, buscamos asientos seleccionados dentro
              if (el.type === "row" || el.type === "table") {
                const updatedSeats = el.seats.map((s) => {
                  if (selectedIds.includes(s.id)) {
                    const index = selectedIds.indexOf(s.id);
                    const label = labels[index % labels.length];
                    return { ...s, label };
                  }
                  return s;
                });
                return { ...el, seats: updatedSeats };
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

      updateSeatCount: (id: string, count: number) => {
        const { seatMap } = get();
        set({
          seatMap: {
            ...seatMap,
            elements: seatMap.elements.map((el) => {
              if (el.id === id && (el.type === "row" || el.type === "table")) {
                const spacing = el.type === "row" ? el.seatSpacing || 30 : 0;
                const currentSeats = el.seats || [];
                const diff = count - currentSeats.length;

                let newSeats = [...currentSeats];
                if (diff > 0) {
                  // Add seats
                  for (let i = 0; i < diff; i++) {
                    const index = currentSeats.length + i;
                    newSeats.push({
                      id: `s-${crypto.randomUUID()}`,
                      type: "seat",
                      label: String(index + 1),
                      cx: el.type === "row" ? index * spacing : 0,
                      cy: 0,
                      status: "available",
                    });
                  }
                } else if (diff < 0) {
                  // Remove seats
                  newSeats = newSeats.slice(0, count);
                }

                // Recalculate all positions to be sure
                if (el.type === "row") {
                  newSeats = newSeats.map((s, i) => ({
                    ...s,
                    cx: i * spacing,
                    cy: 0,
                  }));
                }

                return { ...el, seats: newSeats };
              }
              return el;
            }),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      draggingId: null,
      lastMousePosition: null,

      setActiveTool: (tool) => set({ activeTool: tool }),

      startDragging: (id, position) => {
        set({ draggingId: id, lastMousePosition: position });
      },

      stopDragging: () => {
        set({ draggingId: null, lastMousePosition: null });
      },

      handleDragMove: (position) => {
        const { draggingId, lastMousePosition, seatMap } = get();
        if (!draggingId || !lastMousePosition) return;

        const dx = position.x - lastMousePosition.x;
        const dy = position.y - lastMousePosition.y;

        const element = seatMap.elements.find((el) => el.id === draggingId);
        if (element && "position" in element) {
          get().moveElement(draggingId, {
            x: element.position.x + dx,
            y: element.position.y + dy,
          });
        } else if (element && element.type === "area") {
          // Special handling for areas (polygons)
          const newPoints = element.points.map((p) => ({
            x: p.x + dx,
            y: p.y + dy,
          }));
          get().updateElement(draggingId, { points: newPoints });
        }

        set({ lastMousePosition: position });
      },

      addRow: (pos) => {
        const { viewport } = get().seatMap;
        const position = pos || {
          x: viewport.panX + 100,
          y: viewport.panY + 100,
        };

        const newRow: Row = {
          id: `row-${crypto.randomUUID()}`,
          type: "row",
          label: "Nueva Fila",
          position,
          rotation: 0,
          seatSpacing: 30,
          seatCount: 2, // Initialize with the number of seats created by default
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
        get().setActiveTool("select");
      },

      addTable: (pos) => {
        const { viewport } = get().seatMap;
        const position = pos || {
          x: viewport.panX + 200,
          y: viewport.panY + 200,
        };

        const newTable: Table = {
          id: `table-${crypto.randomUUID()}`,
          type: "table",
          label: "T",
          position,
          rotation: 0,
          shape: "round",
          width: 80,
          height: 80,
          seats: [],
        };
        get().addElement(newTable);
        get().setSelection([newTable.id]);
        get().setActiveTool("select");
      },

      addArea: (pos) => {
        const { viewport } = get().seatMap;
        const startPos = pos || {
          x: viewport.panX + 150,
          y: viewport.panY + 150,
        };

        const newArea: Area = {
          id: `area-${crypto.randomUUID()}`,
          type: "area",
          label: "Nueva Área",
          points: [
            { x: startPos.x, y: startPos.y },
            { x: startPos.x + 150, y: startPos.y },
            { x: startPos.x + 150, y: startPos.y + 100 },
            { x: startPos.x, y: startPos.y + 100 },
          ],
          color: "rgba(59, 130, 246, 0.2)",
        };
        get().addElement(newArea);
        get().setSelection([newArea.id]);
        get().setActiveTool("select");
      },
    }),
    {
      name: "fanz-seatmap-storage",
      partialize: (state) => ({
        seatMap: state.seatMap,
      }),
    },
  ),
);
