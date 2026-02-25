# Fanz SeatMapBuilder - Especificación Técnica (SPEC V2 - Dominio Concreto)

## 1. Objetivo
Desarrollar un editor visual interactivo de alta fidelidad para mapas de asientos utilizando SVG nativo, optimizado para la selección de asientos, gestión de filas y etiquetado secuencial. La UX debe estar inspirada en Seats.io.

## 2. Estándares de Ingeniería (Obligatorios)
- **SRP (Principio de Responsabilidad Única):** Los componentes solo deben encargarse del renderizado. La lógica pertenece a los hooks o al store.
- **DRY (No te repitas):** Las formas SVG compartidas y los ayudantes matemáticos deben estar centralizados.
- **Archivos Barrel:** Cada directorio en `src/` debe tener un `index.ts` para gestionar las exportaciones.
- **Componentes Atómicos:** Los componentes deben ser pequeños y enfocados. Máximo 300 líneas por archivo para asegurar la legibilidad y SRP. Sin "Componentes Dios".

## 3. Stack Tecnológico
- **Framework:** Next.js 14+ (App Router)
- **Lenguaje:** TypeScript (Modo Estricto)
- **Gestión de Estado:** Zustand (con middleware de persistencia)
- **Motor Gráfico:** SVG nativo con integración React
- **Registro de Logs:** `prompts.jsonl` (Seguimiento obligatorio de todas las interacciones con IA)

## 4. Modelo de Dominio (Esquema JSON y Tipos Concretos)
La "Única Fuente de Verdad" para el mapa de asientos y el estado del editor se define de la siguiente manera:

```typescript
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
  type: 'row';
  label: string; // Obligatorio
  position: Position;
  rotation: number;
  seats: Seat[];
  seatSpacing: number;
}

export interface Seat {
  id: string;
  type: 'seat';
  label: string; // Obligatorio (ej: A1, A2)
  status: 'available' | 'selected' | 'blocked';
  // posición relativa a la fila, calculada por el offset
  cx: number;
  cy: number;
}

export interface Area {
  id: string;
  type: 'area';
  label: string; // Obligatorio
  path: string; // Datos del path SVG
  position: Position;
}

export interface Table {
  id: string;
  type: 'table';
  label: string; // Obligatorio
  position: Position;
  shape: 'round' | 'rectangular';
  seats: Seat[];
  radius?: number; // Para forma 'round'
  width?: number;  // Para forma 'rectangular'
  height?: number; // Para forma 'rectangular'
}

// Definición del estado del Store
export interface EditorState {
  seatMap: SeatMap;
  selectedIds: string[];
  activeTool: 'select' | 'addRow' | 'addTable' | 'addArea';

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
}
```

## 5. Estructura del Proyecto

```
src/
  app/
    page.tsx
    layout.tsx
  components/
    editor/
      SvgEditor.tsx
      MapElements.tsx
      RowRenderer.tsx
      SeatRenderer.tsx
      TableRenderer.tsx
      AreaRenderer.tsx
      index.ts
    ui/
      Toolbar.tsx
      Sidebar.tsx
      Inspector.tsx
      ConfirmDeleteModal.tsx
      AddRowModal.tsx
      index.ts
    index.ts
  domain/
    types.ts
    index.ts
  store/
    useSeatMapStore.ts
    index.ts
  services/
    labeling/
      labelGenerator.ts
      index.ts
    persistence/
      jsonMapper.ts
      index.ts
    index.ts
  hooks/
    useCanvasInteraction.ts
    index.ts
```

## 6. Estándares
- **SRP:** Los componentes renderizan. La lógica está en hooks/store.
- **DRY:** Formas compartidas en componentes reutilizables.
- **Barrel files** en cada directorio.
- **Máximo 300 líneas** por archivo.
