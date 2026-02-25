// src/domain/types.ts

export interface Position {
  x: number;
  y: number;
}

export interface SeatMap {
  id: string;
  name: string;
  elements: MapElement[];
  viewport: { zoom: number; panX: number; panY: number };
  createdAt: string;
  updatedAt: string;
}

export type MapElement = Row | Area | Table;

export interface Row {
  id: string;
  type: "row";
  label: string; // Obligatorio
  position: Position;
  rotation: number;
  seats: Seat[];
  seatSpacing: number;
}

export interface Seat {
  id: string;
  type: "seat";
  label: string; // Obligatorio (ej: A1, A2)
  status: "available" | "selected" | "blocked";
  // posición relativa a la fila o mesa
  cx: number;
  cy: number;
}

export interface Area {
  id: string;
  type: "area";
  label: string; // Obligatorio
  path: string; // Datos del path SVG
  position: Position;
}

export interface Table {
  id: string;
  type: "table";
  label: string; // Obligatorio
  position: Position;
  shape: "round" | "rectangular";
  seats: Seat[];
  radius?: number; // Para forma 'round'
  width?: number; // Para forma 'rectangular'
  height?: number; // Para forma 'rectangular'
}

// Definición del estado del Store
export interface EditorState {
  seatMap: SeatMap;
  selectedIds: string[];
  activeTool: "select" | "addRow" | "addTable" | "addArea";

  // Acciones
  newMap: () => void;
  addElement: (element: MapElement) => void;
  removeElements: (ids: string[]) => void;
  updateElement: (id: string, updates: Partial<MapElement>) => void;
  moveElement: (id: string, position: Position) => void;
  setSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  exportJSON: () => string;
  importJSON: (json: string) => void;
  applyBulkLabels: (pattern: string) => void;
}
