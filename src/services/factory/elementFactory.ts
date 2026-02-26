// src/services/factory/elementFactory.ts
import { Row, Table, Area, Position } from "../../domain/types";
import { calculateTableSeatPositions } from "../layout/tableLayout";

export const ElementFactory = {
  createRow: (pos: Position, seatCount: number, seatSpacing: number): Row => {
    return {
      id: `row-${crypto.randomUUID()}`,
      type: "row",
      label: "Nueva Fila",
      position: pos,
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
  },

  createTable: (pos: Position, capacity: number): Table => {
    const table: Table = {
      id: `table-${crypto.randomUUID()}`,
      type: "table",
      label: "T",
      position: pos,
      rotation: 0,
      shape: "round",
      width: 80,
      height: 80,
      seats: Array.from({ length: capacity }, (_, i) => ({
        id: `s-${crypto.randomUUID()}`,
        type: "seat",
        label: String(i + 1),
        cx: 0,
        cy: 0,
        status: "available",
      })),
    };

    // Use existing layout logic to position seats
    table.seats = calculateTableSeatPositions(table);
    return table;
  },

  createArea: (pos: Position): Area => {
    return {
      id: `area-${crypto.randomUUID()}`,
      type: "area",
      label: "Nueva Área",
      points: [
        { x: pos.x, y: pos.y },
        { x: pos.x + 150, y: pos.y },
        { x: pos.x + 150, y: pos.y + 100 },
        { x: pos.x, y: pos.y + 100 },
      ],
      color: "rgba(59, 130, 246, 0.2)",
    };
  },
};
