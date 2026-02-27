# Plan de Acción — Auditoría Técnica `fanz-seatmap-builder`

> Basado en la auditoría del 2026-02-27. 14 puntos organizados por prioridad y sprint.

---

## 🔴 Sprint 1 — Crítico (Esta semana)

### Punto 1 — Corregir versiones en `package.json`
- **Problema:** `next: 16.1.6` y `react: 19.2.3` son versiones que no existen en npm oficialmente.
- **Archivos:** `package.json`
- **Pasos:**
  1. Ejecutar `npm info next version` y `npm info react version` para obtener la última versión estable.
  2. Actualizar `package.json` con versiones reales y verificadas.
  3. Ejecutar `npm install` y `npm run build` para confirmar que compila sin errores.
  4. Commitear con `fix: correct dependency versions`.
- **Criterio de aceptación:** `npm ci` en un directorio limpio instala sin errores.

---

### Punto 2 — Eliminar `prompts.jsonl` del repositorio
- **Problema:** Archivo con historial de prompting de IA en el repo. Datos sensibles del proceso de desarrollo.
- **Archivos:** `prompts.jsonl`, `.gitignore`
- **Pasos:**
  1. Agregar al `.gitignore`:
     ```
     prompts.jsonl
     BUGS_AUDIT.md
     BUGS_VERIFICATION_REPORT.md
     *.DS_Store
     ```
  2. Eliminar el archivo del tracking de git: `git rm --cached prompts.jsonl`.
  3. También hacer `git rm --cached BUGS_AUDIT.md BUGS_VERIFICATION_REPORT.md` si están trackeados.
  4. Commitear con `chore: remove AI artifact files from repo`.
- **Criterio de aceptación:** `git ls-files | grep prompts` no devuelve resultados.

---

### Punto 3 — Refactorizar `updateElement` extrayendo lógica a `MapService`
- **Problema:** `updateElement` en `mapSlice.ts` tiene ~110 líneas con 5 responsabilidades distintas (God Function).
- **Archivos:** `src/store/slices/mapSlice.ts`, `src/services/mapService.ts`
- **Pasos:**
  1. Crear método `MapService.applyElementUpdate(el: MapElement, updates: Partial<MapElement>): MapElement` que encapsule:
     - Sanitización de label.
     - Lógica de ajuste de `seatCount`/`capacity`.
     - Recálculo de layout por `seatSpacing`.
     - Transformación de shape en tablas.
  2. En `updateElement` del slice, reemplazar toda la lógica interna por una llamada a `MapService.applyElementUpdate(el, sanitizedUpdates)`.
  3. Corregir el bug de type safety: buscar el elemento existente para determinar su `type` real en vez de asumir `"row"`.
  4. Actualizar tests de `useSeatMapStore.test.ts` si alguno falla.
- **Criterio de aceptación:** `updateElement` tiene < 30 líneas. Todos los tests pasan.

---

## 🟡 Sprint 2 — Importante (Próxima semana)

### Punto 4 — Fix `newMap()` para resetear estado de UI completo
- **Problema:** Al crear un mapa nuevo, `activeTool`, `draggingId` y `lastMousePosition` no se resetean.
- **Archivos:** `src/store/slices/mapSlice.ts`
- **Pasos:**
  1. En la acción `newMap`, agregar al objeto de `set()`:
     ```ts
     activeTool: "select",
     draggingId: null,
     lastMousePosition: null,
     ```
  2. Agregar un test en `useSeatMapStore.test.ts`:
     ```ts
     it('should reset UI state on newMap', ...)
     ```
- **Criterio de aceptación:** Al llamar `newMap()`, el estado de UI queda en su valor inicial.

---

### Punto 5 — Reemplazar `window.confirm()` con toast de confirmación
- **Problema:** `confirm()` es síncrono, bloquea el thread y no funciona en PWA/iframes.
- **Archivos:** `src/app/page.tsx`
- **Pasos:**
  1. Reemplazar el bloque `if (confirm(...))` por un toast de `sonner` con acción:
     ```ts
     toast.warning(strings.messages.newMapConfirm, {
       action: { label: "Confirmar", onClick: () => { newMap(); toast.success(...); } }
     });
     ```
  2. Asegurarse de que `strings.messages` ya contiene el texto correcto.
- **Criterio de aceptación:** Al hacer click en "Nuevo mapa", aparece un toast de confirmación sin bloquear la UI.

---

### Punto 6 — Eliminar dead code
- **Problema:** Código y archivos que no se usan ocupan espacio y generan confusión.
- **Archivos:** `src/services/persistence/jsonMapper.ts`, `src/app/page.module.css`, `README.next.md`, `src/app/page.tsx`
- **Pasos:**
  1. En `jsonMapper.ts`: eliminar las funciones `exportSeatMapToJSON` e `importSeatMapFromJSON`.
  2. Actualizar `src/__tests__/jsonMapper.test.ts` para usar `SeatMapRepository.serialize/deserialize`.
  3. Eliminar `src/app/page.module.css` (no se importa en ningún lado).
  4. Eliminar `README.next.md` (plantilla de Next.js sin uso).
  5. Eliminar `console.log(json)` en `page.tsx` línea 42.
- **Criterio de aceptación:** `npm run build` sin warnings de imports no usados. Tests pasan.

---

### Punto 7 — Refactorizar `Toolbar.tsx` eliminando repetición (DRY)
- **Problema:** 4 botones con estructura idéntica de 15 líneas cada uno = 160 líneas de código repetido.
- **Archivos:** `src/components/ui/Toolbar.tsx`
- **Pasos:**
  1. Definir array de configuración:
     ```ts
     const TOOLS = [
       { tool: "addRow" as const, icon: LayoutGrid, label: strings.toolbar.row },
       { tool: "addTable" as const, icon: Circle, label: strings.toolbar.table },
       { tool: "addArea" as const, icon: Square, label: strings.toolbar.area },
       { tool: "select" as const, icon: MousePointer2, label: strings.toolbar.select },
     ];
     ```
  2. Crear componente interno `ToolButton` que reciba `{ tool, icon: Icon, label }`.
  3. Renderizar con `TOOLS.map(t => <ToolButton key={t.tool} {...t} />)`.
- **Criterio de aceptación:** `Toolbar.tsx` < 80 líneas. Comportamiento visual idéntico al anterior.

---

### Punto 8 — Agregar Error Boundary (`error.tsx`)
- **Problema:** Sin error boundary en Next.js App Router, los errores en runtime muestran pantalla en blanco.
- **Archivos:** `src/app/error.tsx` (nuevo)
- **Pasos:**
  1. Crear `src/app/error.tsx`:
     ```tsx
     "use client";
     export default function Error({ error, reset }: { error: Error; reset: () => void }) {
       return (
         <div className="flex flex-col items-center justify-center h-screen gap-4">
           <h2 className="text-lg font-bold text-red-600">Algo salió mal</h2>
           <p className="text-sm text-slate-500">{error.message}</p>
           <button onClick={reset} className="px-4 py-2 bg-blue-600 text-white rounded">
             Reintentar
           </button>
         </div>
       );
     }
     ```
  2. Verificar que el error se captura correctamente en desarrollo tirando una excepción manual.
- **Criterio de aceptación:** Un error en runtime muestra la pantalla de error con botón de retry, no pantalla en blanco.

---

## 🟢 Sprint 3 — Mejoras de Largo Plazo (Backlog)

### Punto 9 — Estandarizar comentarios al inglés
- **Problema:** El código está en inglés pero los comentarios inline están en español (inconsistencia).
- **Archivos:** `src/components/editor/SvgEditor.tsx`, `src/store/slices/mapSlice.ts`, `src/store/slices/uiSlice.ts`
- **Pasos:**
  1. Traducir al inglés todos los comentarios inline en español.
  2. Mantener en español solo los strings de UI que vienen de `lib/i18n`.
- **Criterio de aceptación:** `grep -r "// [A-ZÁÉÍÓÚ]" src/` no devuelve comentarios en español.

---

### Punto 10 — Agregar `loading.tsx` para evitar FOUC en hidratación
- **Problema:** Sin loading state, la hidratación de Zustand `persist` puede mostrar un flash de contenido.
- **Archivos:** `src/app/loading.tsx` (nuevo)
- **Pasos:**
  1. Crear `src/app/loading.tsx` con un skeleton del layout:
     ```tsx
     export default function Loading() {
       return (
         <div className="flex flex-col h-screen bg-slate-50 animate-pulse">
           <div className="h-12 bg-white border-b border-slate-200" />
           <div className="flex-1 flex">
             <div className="w-64 bg-white border-r border-slate-200" />
             <div className="flex-1 bg-slate-100" />
             <div className="w-72 bg-white border-l border-slate-200" />
           </div>
         </div>
       );
     }
     ```
- **Criterio de aceptación:** En conexiones lentas o CPU throttling, se muestra el skeleton antes del editor.

---

### Punto 11 — Mover `addRow/addTable/addArea` de `uiSlice` a `mapSlice`
- **Problema:** Lógica de creación de elementos (que accede a `ElementFactory` y `seatMap`) vive en `uiSlice`.
- **Archivos:** `src/store/slices/uiSlice.ts`, `src/store/slices/mapSlice.ts`
- **Pasos:**
  1. Mover las funciones `addRow`, `addTable`, `addArea` de `uiSlice.ts` a `mapSlice.ts`.
  2. Actualizar la interfaz `MapSlice` para incluirlas.
  3. Eliminar de `UISlice` interface y de `createUISlice`.
  4. Verificar que `SvgEditor.tsx` y `uiSlice` destruccionan correctamente del store.
- **Criterio de aceptación:** `uiSlice.ts` solo maneja estado de UI puro. Todos los tests pasan.

---

### Punto 12 — Dimensiones dinámicas en `SvgEditor` con `ResizeObserver`
- **Problema:** `width = 1200; height = 800` están hardcodeadas. El `viewBox` no se adapta al contenedor real.
- **Archivos:** `src/components/editor/SvgEditor.tsx`
- **Pasos:**
  1. Crear hook `useElementSize(ref)` que use `ResizeObserver` para retornar `{ width, height }`.
  2. Aplicar el hook al `containerRef` del div padre del SVG.
  3. Reemplazar las constantes hardcodeadas por los valores del hook.
  4. Agregar un fallback `|| { width: 1200, height: 800 }` para SSR.
- **Criterio de aceptación:** Redimensionar la ventana actualiza el `viewBox` correctamente sin hardcode.

---

### Punto 13 — Reforzar schema Zod con validaciones adicionales
- **Problema:** El schema acepta IDs vacíos, fechas inválidas y mapas con cantidad ilimitada de elementos.
- **Archivos:** `src/services/persistence/jsonMapper.ts`
- **Pasos:**
  1. Actualizar el schema:
     ```ts
     id: z.string().min(1),
     name: z.string().min(1).max(100),
     createdAt: z.string().datetime(),
     updatedAt: z.string().datetime(),
     elements: z.array(MapElementSchema).max(5000),
     ```
  2. Agregar al menos un test en `jsonMapper.test.ts` que valide estas restricciones.
- **Criterio de aceptación:** Un JSON con `id: ""` o `createdAt: "banana"` lanza `ZodError`.

---

### Punto 14 — Unificar rutas de serialización (eliminar duplicidad de storage)
- **Problema:** `SeatMapRepository.save/load` usa `"fanz-seatmap-snapshot"` mientras Zustand `persist` usa `"fanz-seatmap-storage"`. Dos fuentes de verdad del mismo dato.
- **Archivos:** `src/services/persistence/seatMapRepository.ts`, `src/store/useSeatMapStore.ts`
- **Decisión requerida:** Elegir UNA estrategia:
  - **Opción A (recomendada):** Eliminar `save/load` de `SeatMapRepository` y confiar 100% en `zustand/persist`.
  - **Opción B:** Eliminar `zustand/persist` y manejar todo con `SeatMapRepository.save/load` + `useEffect`.
- **Pasos (Opción A):**
  1. Eliminar los métodos `save` y `load` de `SeatMapRepository` y de `ISeatMapRepository`.
  2. Verificar que nadie en el codebase los llame (búsqueda con `grep`).
  3. Eliminar la referencia a `"fanz-seatmap-snapshot"` de localStorage.
- **Criterio de aceptación:** Solo existe una clave en localStorage relacionada al seatmap.

---

## 📊 Resumen de Sprints

| Sprint | Puntos | Esfuerzo estimado | Impacto |
|--------|--------|-------------------|---------|
| Sprint 1 — Crítico | 1, 2, 3 | ~4-6h | 🔴 Alto |
| Sprint 2 — Importante | 4, 5, 6, 7, 8 | ~6-8h | 🟡 Medio |
| Sprint 3 — Backlog | 9, 10, 11, 12, 13, 14 | ~8-12h | 🟢 Bajo-Medio |

**Tiempo total estimado:** 18–26 horas de desarrollo.
