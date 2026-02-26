// src/domain/types.ts

export interface Position {
  x: number;
  y: number;
}

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface SeatMap {
  id: string;
  name: string;
  elements: MapElement[];
  viewport: ViewportState;
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
  seatCount: number;
}

export interface Seat {
  id: string;
  type: "seat";
  label: string; // Obligatorio (ej: A1, A2)
  status: "available" | "selected" | "blocked" | "occupied";
  // posición relativa a la fila o mesa
  cx: number;
  cy: number;
}

export interface Area {
  id: string;
  type: "area";
  label: string; // Obligatorio
  points: Position[]; // Lista de puntos para el polígono
  color?: string; // Color de relleno opcional
}

export interface Table {
  id: string;
  type: "table";
  label: string; // Obligatorio
  position: Position;
  rotation: number;
  shape: "round" | "rectangular";
  seats: Seat[];
  width: number; // Diámetro para 'round' o ancho para 'rectangular'
  height: number; // Solo para 'rectangular'
}

// Definición del estado del Store
export interface EditorState {
  seatMap: SeatMap;
  selectedIds: string[];
  activeTool: "select" | "addRow" | "addTable" | "addArea";
  draggingId: string | null;
  lastMousePosition: Position | null;
  creationConfig: {
    rowSeats: number;
    tableSeats: number;
  };

  // Acciones
  newMap: () => void;
  addElement: (element: MapElement) => void;
  removeElements: (ids: string[]) => void;
  updateElement: (id: string, updates: Partial<MapElement>) => void;
  moveElement: (id: string, position: Position) => void;
  setSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  selectElement: (id: string, isMulti?: boolean) => void;
  exportJSON: () => string;
  importJSON: (json: string) => void;
  applyBulkLabels: (pattern: string) => void;
  updateViewport: (updates: Partial<ViewportState>) => void;
  updateSeatCount: (id: string, count: number) => void;
  updateCreationConfig: (
    updates: Partial<EditorState["creationConfig"]>,
  ) => void;

  // Acciones para Tarea 8
  setActiveTool: (tool: EditorState["activeTool"]) => void;
  startDragging: (id: string, position: Position) => void;
  stopDragging: () => void;
  handleDragMove: (position: Position) => void;
  addRow: (pos?: Position) => void;
  addTable: (pos?: Position) => void;
  addArea: (pos?: Position) => void;
}
