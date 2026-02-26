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
  Seat,
} from "@/domain/types";
import { parsePattern } from "@/services/labeling";
import { calculateTableSeatPositions } from "@/services/layout/tableLayout";
import { validateSeatMap } from "@/services/persistence/jsonMapper";

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
        set((state) => {
          // Bug 3: Ensure ID uniqueness before adding
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
                const filteredSeats = el.seats.filter(
                  (s) => !ids.includes(s.id),
                );
                return { ...el, seats: filteredSeats } as MapElement;
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
                if (el.id === id) {
                  // Root element update
                  const updatedEl = { ...el, ...updates } as MapElement;

                  // Si es una fila y se actualizó el espaciado o los asientos, recalculamos posiciones
                  if (
                    updatedEl.type === "row" &&
                    ("seatSpacing" in updates || "seats" in updates)
                  ) {
                    const rowEl = updatedEl as Row;
                    const spacing = rowEl.seatSpacing || 30;
                    rowEl.seats = rowEl.seats.map((s, i) => ({
                      ...s,
                      cx: i * spacing,
                      cy: 0,
                    }));
                  }

                  // Si es una mesa y cambió forma o dimensiones o asientos o capacidad, recalculamos
                  if (
                    updatedEl.type === "table" &&
                    ("shape" in updates ||
                      "width" in updates ||
                      "height" in updates ||
                      "seats" in updates ||
                      "capacity" in (updates as Record<string, unknown>))
                  ) {
                    const tableEl = updatedEl as Table;

                    // Support for capacity update via generic updateElement
                    if ("capacity" in (updates as Record<string, unknown>)) {
                      const count = (updates as Record<string, number>)
                        .capacity;
                      const currentSeats = [...tableEl.seats];
                      const diff = count - currentSeats.length;

                      if (diff > 0) {
                        for (let i = 0; i < diff; i++) {
                          currentSeats.push({
                            id: `s-${crypto.randomUUID()}`,
                            type: "seat",
                            label: String(currentSeats.length + 1),
                            cx: 0,
                            cy: 0,
                            status: "available",
                          });
                        }
                      } else if (diff < 0) {
                        currentSeats.splice(count);
                      }
                      tableEl.seats = currentSeats;
                    }

                    tableEl.seats = calculateTableSeatPositions(tableEl);
                  }

                  return updatedEl;
                }

                // Nested seat update
                if (el.type === "row" || el.type === "table") {
                  const seatIndex = el.seats.findIndex((s) => s.id === id);
                  if (seatIndex !== -1) {
                    const newSeats = [...el.seats];
                    newSeats[seatIndex] = {
                      ...newSeats[seatIndex],
                      ...updates,
                    } as Seat;
                    // Ensure type stays 'seat'
                    newSeats[seatIndex].type = "seat";

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
          selectedIds: (state.selectedIds || []).includes(id)
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...(state.selectedIds || []), id],
        }));
      },

      selectElement: (id: string, isMulti?: boolean) => {
        set((state) => {
          const currentSelection = state.selectedIds || [];
          if (isMulti) {
            // Toggle element in selection
            return {
              selectedIds: currentSelection.includes(id)
                ? currentSelection.filter((sid) => sid !== id)
                : [...currentSelection, id],
            };
          } else {
            // Set selection to only this element
            return { selectedIds: [id] };
          }
        });
      },

      exportJSON: () => {
        return JSON.stringify(get().seatMap, null, 2);
      },

      importJSON: (json: string) => {
        try {
          const data = JSON.parse(json);
          const validatedSeatMap = validateSeatMap(data);

          // Bug 3: Ensure all IDs are unique upon import
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
          console.error("Failed to import JSON:", error);
          throw error;
        }
      },

      applyBulkLabels: (pattern: string) => {
        const labels = parsePattern(pattern);
        const { selectedIds, seatMap } = get();

        if (labels.length === 0 || !selectedIds || selectedIds.length === 0)
          return;

        const elements = seatMap?.elements || [];

        set({
          seatMap: {
            ...seatMap,
            elements: elements.map((el): MapElement => {
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
                return { ...el, seats: updatedSeats } as MapElement;
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
            elements: seatMap.elements.map((el): MapElement => {
              if (el.id === id && (el.type === "row" || el.type === "table")) {
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
                      cx: 0, // Will be recalculated below
                      cy: 0,
                      status: "available",
                    });
                  }
                } else if (diff < 0) {
                  // Remove seats
                  newSeats = newSeats.slice(0, count);
                }

                const updatedEl = { ...el, seats: newSeats } as MapElement;

                // Recalculate positions based on type
                if (updatedEl.type === "row") {
                  const spacing = updatedEl.seatSpacing || 30;
                  updatedEl.seats = updatedEl.seats.map(
                    (s: Seat, i: number) => ({
                      ...s,
                      cx: i * spacing,
                      cy: 0,
                    }),
                  );
                  // Consistency fix: update seatCount property
                  updatedEl.seatCount = count;
                } else if (updatedEl.type === "table") {
                  updatedEl.seats = calculateTableSeatPositions(
                    updatedEl as Table,
                  );
                }

                return updatedEl;
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
        const { draggingId, lastMousePosition, seatMap, selectedIds } = get();
        if (!draggingId || !lastMousePosition || !seatMap) return;

        const dx = position.x - lastMousePosition.x;
        const dy = position.y - lastMousePosition.y;

        // If the dragged element is selected, move the whole selection
        // Otherwise, just move the dragged element
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
                    position: { x: el.position.x + dx, y: el.position.y + dy },
                  } as MapElement;
                } else if (el.type === "area") {
                  return {
                    ...el,
                    points: el.points.map((p) => ({
                      x: p.x + dx,
                      y: p.y + dy,
                    })),
                  } as MapElement;
                }
              }

              // Handle individual nested seats if they are selected
              if (el.type === "row" || el.type === "table") {
                const hasSelectedSeat = el.seats.some((s) =>
                  idsToMove.includes(s.id),
                );
                if (hasSelectedSeat) {
                  return {
                    ...el,
                    seats: el.seats.map((s) =>
                      idsToMove.includes(s.id)
                        ? ({ ...s, cx: s.cx + dx, cy: s.cy + dy } as Seat)
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

      addRow: (pos) => {
        const { viewport } = get().seatMap;
        const position = pos || {
          x: viewport.panX + 100,
          y: viewport.panY + 100,
        };

        const seatSpacing = 30;
        const seatCount = 2;

        const newRow: Row = {
          id: `row-${crypto.randomUUID()}`,
          type: "row",
          label: "Nueva Fila",
          position,
          rotation: 0,
          seatSpacing,
          seatCount,
          seats: Array.from({ length: seatCount }, (_, i) => ({
            id: `s-${crypto.randomUUID()}`,
            type: "seat",
            label: String(i + 1),
            cx: i * seatSpacing,
            cy: 0,
            status: "available",
          })),
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

        const initialTable: Table = {
          id: `table-${crypto.randomUUID()}`,
          type: "table",
          label: "T",
          position,
          rotation: 0,
          shape: "round",
          width: 80,
          height: 80,
          seats: Array.from({ length: 4 }, (_, i) => ({
            id: `s-${crypto.randomUUID()}`,
            type: "seat",
            label: String(i + 1),
            cx: 0,
            cy: 0,
            status: "available",
          })),
        };

        // Distribute initial seats
        initialTable.seats = calculateTableSeatPositions(initialTable);

        get().addElement(initialTable);
        get().setSelection([initialTable.id]);
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
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // Migration for Bug 4: seatCount missing
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
