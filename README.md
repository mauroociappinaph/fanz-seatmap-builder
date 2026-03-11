# SeatFlow Studio

> Editor visual interactivo profesional para diseñar mapas de asientos. Inspirado en [Seats.io](https://seats.io/).

![Stack](https://img.shields.io/badge/Stack-Next.js%2016%20%2B%20TypeScript%20%2B%20React%2019-blue)
![Tests](https://img.shields.io/badge/Tests-Jest%20%2B%20Testing%20Library-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Descripción

**SeatFlow Studio** es una aplicación frontend profesional que permite crear y editar mapas de asientos de forma visual e intuitiva. Diseñado para venues, teatros, estadios y eventos que requieren gestión de espacios.

### Características Principales

- ✅ **Editor Visual SVG** - Canvas infinito con zoom y pan
- ✅ **Gestión de Elementos** - Filas, mesas y áreas personalizables
- ✅ **Etiquetado Inteligente** - Patrones tipo `{A..Z}{1..10}` para etiquetado masivo
- ✅ **Selección Múltiple** - Selecciona y edita varios elementos a la vez
- ✅ **Persistencia JSON** - Importa y exporta tus mapas sin pérdida de datos
- ✅ **Interfaz SaaS** - UI moderna y profesional con Tailwind CSS

---

## 🚀 Quick Start

### Requisitos Previos

- Node.js 18+
- npm, yarn, o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/mauroociappinaph/fanz-seatmap-builder.git
cd fanz-seatmap-builder

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### Build para Producción

```bash
npm run build
npm start
```

---

## 🧪 Testing

```bash
# Ejecutar tests una vez
npm test

# Modo watch durante desarrollo
npm run test:watch
```

Cobertura actual:

- Pattern Parser: 100%
- Store operations: Core tests
- Viewport hook: Unit tests

---

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Página principal del editor
│   └── layout.tsx         # Root layout
├── components/
│   ├── editor/            # Componentes del canvas SVG
│   │   ├── SvgEditor.tsx  # Editor principal
│   │   ├── MapElements.tsx # Renderizado de elementos
│   │   └── elements/      # Row, Table, Area, Seat components
│   └── ui/                # Componentes de interfaz
│       ├── Toolbar.tsx    # Herramientas de creación
│       └── Inspector.tsx  # Panel de propiedades
├── domain/
│   └── types.ts           # Tipos TypeScript del dominio
├── store/
│   ├── slices/            # Zustand slices (Map & UI)
│   └── useSeatMapStore.ts # Store principal con persistencia y migración
├── services/
│   ├── factory/           # Creación de elementos
│   ├── labeling/          # Parser de patrones
│   ├── layout/            # Algoritmos geométricos
│   ├── persistence/       # Zod schemas y Repository
│   ├── layoutService.ts   # Fragmento: Coordenadas y Layout
│   ├── elementService.ts  # Fragmento: CRUD y Lógica de Negocio
│   ├── sanitizationService.ts # Fragmento: Limpieza de inputs
│   └── mapService.ts      # Fachada principal de servicios
├── hooks/
│   ├── index.ts           # Barrel de hooks
│   ├── useViewport.ts     # Control de cámara (zoom/pan)
│   ├── useKeyboardShortcuts.ts # Atajos del sistema
│   ├── useEditorShortcuts.ts # Atajos del editor
│   ├── useElementInteraction.ts # Arrastre y selección
│   └── useResizeObserver.ts # Adaptabilidad del canvas
└── __tests__/             # Tests unitarios (Jest)
```

---

## 🏗️ Decisiones Técnicas

### 1. SVG Nativo sobre Canvas/WebGL

**Decisión:** Usar SVG nativo con React.

**Razones:**

- Mayor accesibilidad (DOM manipulable)
- Event handling nativo de React
- No requiere librerías pesadas
- Ideal para diagramas 2D interactivos
- Exportación a vector simple

### 2. Zustand sobre Redux/Context

**Decisión:** Zustand con persistencia local.

**Razones:**

- API minimalista y type-safe
- Middleware de persistencia integrado
- Sin boilerplate
- Rendimiento óptimo para updates frecuentes

### 3. Arquitectura de Componentes

**Principios aplicados:**

- **SRP:** Cada componente tiene una única responsabilidad
- **Barrel exports:** Cada carpeta tiene `index.ts`
- **Máximo 300 líneas:** Componentes pequeños y enfocados
- **Separación UI/Logic:** Hooks para lógica, componentes para renderizado

### 4. TypeScript Strict

- Tipado exhaustivo del dominio
- `MapElement` como discriminated union
- Validación runtime con Zod para JSON

### 5. Patrón de Etiquetado

Implementación de parser propio para patrones como:

- `{A..Z}` - Rangos alfabéticos
- `{1..50}` - Rangos numéricos
- `{A..C}{1..3}` - Producto cartesiano

---

## 📊 Esquema de Datos

### SeatMap

```typescript
{
  id: string;
  name: string;
  elements: (Row | Table | Area)[];
  viewport: { zoom: number; panX: number; panY: number };
  createdAt: string;
  updatedAt: string;
}
```

### Elementos

**Row:**

```typescript
{
  id: string;
  type: 'row';
  label: string;           // Obligatorio
  position: { x, y };
  rotation: number;
  seats: Seat[];
  seatSpacing: number;
}
```

**Table:**

```typescript
{
  id: string;
  type: 'table';
  label: string;           // Obligatorio
  position: { x, y };
  rotation: number;
  shape: 'round' | 'rectangular';
  seats: Seat[];
  width: number;
  height: number;
}
```

**Area:**

```typescript
{
  id: string;
  type: 'area';
  label: string;           // Obligatorio
  points: Position[];      // Polígono
  color?: string;
}
```

**Seat:**

```typescript
{
  id: string;
  type: 'seat';
  label: string;           // Obligatorio
  status: 'available' | 'selected' | 'blocked' | 'occupied';
  cx: number;              // Posición relativa
  cy: number;
}
```

---

## 📦 Import / Export

### Exportar Mapa

Haz clic en **"Save as JSON"** en la navbar o ejecuta en consola:

```javascript
const json = useSeatMapStore.getState().exportJSON();
console.log(json);
```

### Importar Mapa

```javascript
useSeatMapStore.getState().importJSON(jsonString);
```

**Validación:** El JSON se valida con Zod para garantizar integridad.

---

## 🛠️ Stack Tecnológico

| Tecnología   | Propósito                     |
| ------------ | ----------------------------- |
| Next.js 16   | Framework React con App Router (React 19) |
| TypeScript   | Type safety y DX              |
| Zustand      | Gestión de estado             |
| Tailwind CSS | Estilos utilitarios           |
| Lucide React | Iconografía                   |
| Sonner       | Notificaciones toast          |
| Zod          | Validación de schemas         |
| Jest         | Testing framework             |
| Husky        | Git hooks                     |

---

## 📝 Supuestos y Consideraciones

1. **Frontend-only:** No se requiere backend para el MVP. El estado persiste en localStorage.

2. **Navegadores soportados:** Chrome, Firefox, Safari, Edge (últimas 2 versiones).

3. **Tamaño de mapas:** Optimizado para mapas con hasta 1000 asientos. Para mapas más grandes, considerar virtualización.

4. **Etiquetas obligatorias:** Todos los elementos deben tener etiqueta para facilitar la referencia.

5. **Coordenadas:** Sistema de coordenadas relativo al viewport SVG.

6. **Persistencia:** Los datos se guardan automáticamente en localStorage.

---

## 🧩 Próximas Mejoras

- [ ] Selección por área (lasso)
- [ ] Undo/Redo
- [ ] Soporte para dispositivos Touch
- [ ] Preview de impresión
- [ ] Temas personalizables

---

## 📄 Licencia

MIT License - Ver [LICENSE](./LICENSE) para detalles.

---

## 👤 Autor

**Mauro Ociappina**

- GitHub: [@mauroociappinaph](https://github.com/mauroociappinaph)
- Proyecto: [seatflow-studio](https://github.com/mauroociappinaph/fanz-seatmap-builder)

---

<p align="center">
  Desarrollado con ❤️ para SeatFlow Studio
</p>
