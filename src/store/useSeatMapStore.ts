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
  Seat,
  MAX_LABEL_LENGTHS,
} from "@/domain/types";
import { parsePattern } from "@/services/labeling";
import { SeatMapRepository } from "@/services/persistence/seatMapRepository";
import { strings } from "@/lib/i18n/strings";
import { ElementFactory } from "@/services/factory/elementFactory";
import { MapService } from "@/services/domain/mapService";

const initialSeatMap: SeatMap = {
  id: "initial-map",
  name: strings.nav.newMap,
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
      draggingId: null,
      lastMousePosition: null,
      creationConfig: {
        rowSeats: 10,
        tableSeats: 4,
      },

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
                const filteredSeats = el.seats.filter(
                  (s) => !ids.includes(s.id),
                );
                const updatedEl = { ...el, seats: filteredSeats };
                if (updatedEl.type === "row") {
                  updatedEl.seatCount = filteredSeats.length;
                }
                return updatedEl as MapElement;
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
        const sanitizedUpdates = { ...updates };
        if ("label" in sanitizedUpdates && sanitizedUpdates.label) {
          sanitizedUpdates.label = MapService.sanitizeLabel(
            sanitizedUpdates.label,
            ("type" in sanitizedUpdates &&
            (sanitizedUpdates.type === "row" ||
              sanitizedUpdates.type === "table" ||
              sanitizedUpdates.type === "area" ||
              sanitizedUpdates.type === "seat")
              ? sanitizedUpdates.type
              : "row") as MapElement["type"] | "seat",
          );
        }

        set((state) => {
          const elements = state.seatMap?.elements || [];
          return {
            seatMap: {
              ...(state.seatMap || initialSeatMap),
              elements: elements.map((el): MapElement => {
                if (el.id === id) {
                  let updatedEl = { ...el, ...sanitizedUpdates } as MapElement;

                  // Force truncation
                  const typeLimit = MAX_LABEL_LENGTHS[updatedEl.type];
                  if (updatedEl.label.length > typeLimit) {
                    updatedEl.label = updatedEl.label.slice(0, typeLimit);
                  }

                  // Sync seats if capacity or seatCount changed
                  const hasCapacity = "capacity" in updates;
                  const hasSeatCount = "seatCount" in updates;

                  if (hasCapacity || hasSeatCount) {
                    const newCount = hasCapacity
                      ? (updates as { capacity: number }).capacity
                      : (updates as { seatCount: number }).seatCount;
                    updatedEl = MapService.adjustSeatCount(updatedEl, newCount);
                  }

                  // Recalculate layout if relevant properties changed
                  if (
                    updatedEl.type === "row" &&
                    ("seatSpacing" in updates || "seats" in updates)
                  ) {
                    const rowEl = updatedEl as Row;
                    const spacing = rowEl.seatSpacing || 30;
                    rowEl.seats = rowEl.seats.map((s, i) => ({
                      ...s,
                      cx: MapService.roundCoordinate(i * spacing),
                      cy: 0,
                    }));
                  }

                  if (
                    updatedEl.type === "table" &&
                    ("shape" in updates ||
                      "width" in updates ||
                      "height" in updates ||
                      "seats" in updates)
                  ) {
                    const tableEl = updatedEl as Table;
                    const adjustedTable = MapService.adjustSeatCount(
                      tableEl,
                      tableEl.seats.length,
                    ) as Table;
                    tableEl.seats = adjustedTable.seats;
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
                      ...sanitizedUpdates,
                    } as Seat;
                    newSeats[seatIndex].type = "seat";
                    if (
                      newSeats[seatIndex].label.length > MAX_LABEL_LENGTHS.seat
                    ) {
                      newSeats[seatIndex].label = newSeats[
                        seatIndex
                      ].label.slice(0, MAX_LABEL_LENGTHS.seat);
                    }
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

        if (labels.length === 0 || !selectedIds || selectedIds.length === 0)
          return;

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

      updateCreationConfig: (
        updates: Partial<EditorState["creationConfig"]>,
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

      addRow: (pos) => {
        const { seatMap, creationConfig } = get();
        const position = pos || {
          x: seatMap.viewport.panX + 100,
          y: seatMap.viewport.panY + 100,
        };

        const newRow = ElementFactory.createRow(
          position,
          creationConfig.rowSeats,
          30,
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

        const newTable = ElementFactory.createTable(
          position,
          creationConfig.tableSeats,
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

        const newArea = ElementFactory.createArea(startPos);
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
