# Fanz SeatMapBuilder - Especificación Técnica

## 1. Visión General

El **SeatMapBuilder** es una herramienta de edición visual diseñada para crear y gestionar mapas de asientos de alta fidelidad. Esta especificación detalla la arquitectura, el modelo de datos y las decisiones de diseño que sustentan la implementación del MVP.

---

## 2. Arquitectura del Sistema

### 2.1 Stack Tecnológico
*   **Frontend:** Next.js 16 (App Router) + React 19.
*   **Lenguaje:** TypeScript (Strict Mode).
*   **Estado Global:** Zustand con persistencia local (`localStorage`) y aislamiento de serialización (`partialize`).
*   **Renderizado:** SVG Nativo manipulado vía React.
*   **Estilos:** Tailwind CSS.
*   **Validación:** Zod para integridad de datos en tiempo de ejecución (Import/Export).

### 2.2 Patrones de Diseño
*   **Domain-Driven Design (DDD) Lite:** Separación clara entre `domain` (tipos), `store` (lógica de estado), `services` (lógica pura) y `components` (UI).
*   **Single Responsibility Principle (SRP):** Componentes pequeños y enfocados (ej. `RowComponent`, `Inspector`, `Toolbar`).
*   **Atomic Design:** Organización de componentes en `ui` (átomos/moléculas) y `editor` (organismos).
*   **Custom Hooks Pattern:** Centralización de lógica de interacción en `useElementInteraction` y atajos en `useEditorShortcuts`.

---

## 3. Modelo de Datos (JSON Schema)

La "Single Source of Truth" es el objeto `SeatMap`.

### 3.1 Entidades Principales

#### `SeatMap` (Raíz)
Contenedor principal del estado.
```typescript
interface SeatMap {
  id: string;
  name: string;
  elements: MapElement[]; // Polimórfico (Row | Table | Area | Seat)
  viewport: {
    zoom: number;
    panX: number;
    panY: number;
  };
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

#### `Row` (Fila de Asientos)
Elemento compuesto que genera asientos automáticamente.
```typescript
interface Row {
  id: string;
  type: "row";
  label: string;
  position: { x: number; y: number };
  rotation: number;
  seatCount: number;      // Cantidad de asientos
  seatSpacing: number;    // Espaciado en px
  seats: Seat[];          // Asientos hijos
}
```

#### `Seat` (Asiento Individual)
Unidad atómica de inventario. Puede ser hijo de una Fila/Mesa o independiente.
```typescript
interface Seat {
  id: string;
  type: "seat";
  label: string;
  status: "available" | "selected" | "blocked" | "occupied";
  cx: number; // Coordenada relativa al padre
  cy: number; // Coordenada relativa al padre
}
```

#### `Table` (Mesa)
Elemento de capacidad agrupada.
```typescript
interface Table {
  id: string;
  type: "table";
  label: string;
  shape: "round" | "rectangular";
  width: number;
  height: number;
  seats: Seat[];
}
```

#### `Area` (Zona)
Polígono arbitrario para zonificación visual.
```typescript
interface Area {
  id: string;
  type: "area";
  label: string;
  points: { x: number; y: number }[]; // Vértices del polígono
  color: string;
}
```

---

## 4. Lógica de Interacción

### 4.1 Sistema de Coordenadas
El editor utiliza un sistema de coordenadas dual:
1.  **Screen Space:** Píxeles de la pantalla (eventos del mouse).
2.  **SVG Space:** Unidades lógicas dentro del lienzo infinito.

La transformación se realiza mediante matrices SVG (`getScreenCTM().inverse()`) para garantizar precisión independientemente del nivel de zoom o desplazamiento (pan).

### 4.2 Flujo de "Drag & Drop"
1.  **MouseDown:** Se captura el elemento y su posición inicial. Se calcula el offset respecto al puntero.
2.  **MouseMove:** Se actualiza la posición del elemento en el store en tiempo real (`requestAnimationFrame` implícito por React).
3.  **MouseUp:** Se confirma la nueva posición y se persiste el estado.

### 4.3 Etiquetado por Lotes
El motor de etiquetado (`patternParser.ts`) soporta expresiones regulares simplificadas para generar secuencias:
*   `A{1..10}` -> A1, A2... A10
*   `{A..C}-{1..2}` -> A-1, A-2, B-1, B-2...

---

## 5. Persistencia e Integridad

*   **Autoguardado:** El estado se persiste automáticamente en `localStorage` tras cada acción.
*   **Validación:** Al importar un JSON, se utiliza **Zod** para validar estrictamente que la estructura coincida con el esquema esperado, previniendo corrupción de estado.

---

## 6. Seguridad y Calidad

*   **Sanitización:** Los inputs de texto (etiquetas) son tratados como cadenas literales por React, previniendo XSS.
*   **Testing:** Cobertura de tests unitarios para la lógica crítica (Store, Parsers, Validadores) usando Jest.
*   **Linting:** ESLint y Prettier configurados con pre-commit hooks (Husky).
