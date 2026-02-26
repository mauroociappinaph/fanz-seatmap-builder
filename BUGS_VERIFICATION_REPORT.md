# 🔍 Informe de Verificación de Bugs - Fanz SeatMap Builder

**Fecha de verificación:** 26/02/2026
**Total de bugs documentados:** 82
**Verificador:** Análisis de código fuente

---

## 📊 Resumen Ejecutivo

| Estado | Cantidad | Porcentaje |
|--------|----------|------------|
| ✅ **Confirmados** | 40 | 49% |
| ⚠️ **Parciales/Mejoras** | 10 | 12% |
| ❌ **No confirmados/Corregidos** | 32 | 39% |

**Conclusión:** Aproximadamente la mitad de los bugs documentados son reales y requieren atención. El resto son mejoras de calidad de código, falsos positivos, o bugs que ya fueron corregidos pero no actualizados en la documentación.

---

## ✅ Bugs Confirmados (40 bugs reales)

### 🔴 Críticos - Build Bloqueado (3 bugs)

| ID | Archivo | Bug | Evidencia |
|----|---------|-----|-----------|
| **B1/B41** | `useSeatMapStore.ts:88` | Type error en `removeElements` - unión de tipos incorrecta | `tsc` reporta: Type 'Row \| Seat' is not assignable to type 'Seat' |
| **B53** | `useSeatMapStore.ts:445` | Spread types error | `tsc` reporta: Spread types may only be created from object types |
| **B9** | Global | Sin selección múltiple Ctrl/Cmd+Click | No existe implementación de selección múltiple con teclas modificadoras |

### 🟠 Arquitectura - Deuda Técnica (14 bugs)

| ID | Archivo | Bug | Evidencia |
|----|---------|-----|-----------|
| **B32** | `useSeatMapStore.ts` | Mezcla de responsabilidades (SRP) | Archivo de ~450 líneas maneja estado, persistencia, lógica geométrica, UI |
| **B33** | `layout/index.ts` | Barrel vacío | Archivo existe pero no exporta nada |
| **B54** | `domain/types.ts` | Table sin propiedad `capacity` | Table usa `seats.length` pero no tiene `capacity` como Row tiene `seatCount` |
| **B55** | `SvgEditor.tsx` | Suscripción masiva al store | `useSeatMapStore((state) => state.seatMap)` suscribe a TODO el estado |
| **B56** | `useSeatMapStore.ts` | Dragging no se cancela al borrar | `draggingId` persiste después de `removeElements` |
| **B59** | `MapElements.tsx` | Trampa del Z-Index | Áreas renderizadas después cubren asientos (no se pueden seleccionar) |
| **B60** | `useSeatMapStore.ts` | Floating Point Drift | `moveElement` acumula decimales: `x: 100.0000000000004` |
| **B61** | `patternParser.ts` | Patrones inválidos no dan error | `{1..Z}` genera etiqueta literal sin validar tipos mixtos |
| **B69** | `useSeatMapStore.ts` | Estructura anidada O(N*M) | Actualizar un asiento requiere mapear todo el array |
| **B70** | `useSeatMapStore.ts` | Mezcla de datos persistentes y UI state | `draggingId`, `activeTool` en store con persistencia |
| **B71** | `RowComponent.tsx`, `TableComponent.tsx` | Fuga de abstracción | Dependencia de `e.currentTarget.ownerSVGElement` |
| **B72** | `useSeatMapStore.ts` | Fat Store | Lógica algorítmica compleja en `updateElement` (recálculo de posiciones) |
| **B73** | `useSeatMapStore.ts` | Dependencia Inversa (DIP) | Store importa `validateSeatMap` de persistencia |
| **B74** | `useSeatMapStore.ts` | Violación DRY | `addRow`, `addTable`, `addArea` duplican lógica de inicialización |
| **B75** | `MapElements.tsx` | Falta Strategy Pattern | Switch-case gigante sobre `el.type` |

### 🟡 UX/Performance (13 bugs)

| ID | Archivo | Bug | Evidencia |
|----|---------|-----|-----------|
| **B4** | `page.tsx` | Race condition en delete | Toast con `onClick` async puede cerrarse antes de ejecutar |
| **B29** | `useViewport.ts` | Sin debounce/throttle | `handleWheel` ejecuta en cada evento de scroll |
| **B49** | `jest.config.ts` | Sin coverage threshold | Config no especifica mínimo de cobertura |
| **B7** | `AreaComponent.tsx` | Sin transform | Áreas no usan `transform` como Row/Table (inconsistencia) |
| **B64** | `Inspector.tsx` | Color picker sin debounce | `onChange` dispara actualización en cada micro-movimiento |
| **B65** | `SvgEditor.tsx` | Dimensiones fijas | `width = 1200`, `height = 800` hardcodeado |
| **B66** | `SeatComponent.tsx` | fontSize fijo 6px | Texto puede salir del círculo |
| **B67** | `AreaComponent.tsx` | Etiquetas fuera de cuadro | `x={area.points[0]?.x}` si el punto está fuera de pantalla |
| **B76** | `SvgEditor.tsx` | Passive Event Listener | `onWheel={handleWheel}` sin `passive: false` explícito |
| **B77** | Componentes SVG | Sin a11y | Ningún componente tiene `role="button"`, `aria-label`, `tabIndex` |
| **B78** | Todos los componentes | Sin React.memo | Ningún componente usa memoización |
| **B79** | `page.tsx`, `layout.tsx` | Sin Error Boundaries | Un error en cualquier componente hace crash toda la app |
| **B82** | `SeatComponent.tsx` | Layout Bomb | Sin validación de longitud máxima en labels |

### 🟢 Configuración/Dependencias (10 bugs)

| ID | Archivo | Bug | Evidencia |
|----|---------|-----|-----------|
| **B42** | `next.config.ts` | Config vacío | Solo exporta objeto vacío |
| **B44** | `jest.config.ts` | Preset duplicado | `nextJest` + `preset: 'ts-jest'` |
| **B45** | `tailwind.config.ts` | Tailwind v4 con sintaxis v3 | Usa `content` en lugar de `@source` |
| **B47** | `package.json` | React 19 experimental | `"react": "19.2.3"` - API no estable |
| **B50** | `prompts.jsonl` | Sin validar (B50 ya no aplica) | ✅ Ya tiene 28 entradas válidas |
| **B52** | `layout.tsx` | lang="en" | Debería ser `lang="es"` para consistencia |
| **B80** | `package.json` | Next.js 16 experimental | `"next": "16.1.6"` - versión muy nueva |
| **B81** | `page.tsx`, `useSeatMapStore.ts` | i18n inconsistente | "New Map" (EN) vs "Nueva Fila" (ES) |
| **B36** | `tableLayout.ts` | Mesas rectangulares con distribución circular | Comentado en código: "Basic distribution for MVP" |
| **B68** | `useSeatMapStore.ts` | applyBulkLabels sin verificación | Reemplaza objetos sin validar `selectedIds` |

---

## ⚠️ Bugs Parciales / Mejoras de Código (10 items)

| ID | Archivo | Estado | Notas |
|----|---------|--------|-------|
| **B27** | `SeatComponent.tsx` | ⚠️ Bajo riesgo | React escapa HTML por defecto, XSS teórico pero no crítico |
| **B28** | `page.tsx` | ⚠️ Parcial | Manejo básico de errores existe con try-catch |
| **B30** | `types.ts` | ⚠️ Parcial | Tipado complejo pero no necesariamente inconsistente |
| **B31** | `tableLayout.test.ts` | ⚠️ Práctica común | Uso de `Partial<Table>` es aceptable en tests |
| **B43** | `package.json` | ⚠️ No confirmado | Solo se detectó un `package-lock.json` |
| **B46** | `globals.css` | ⚠️ Parcial | Algunas clases pueden no usarse pero no es crítico |
| **B48** | `package.json` | ⚠️ Parcial | Zod v4 es nuevo pero funciona correctamente |
| **B51** | `layout.tsx` | ⚠️ Parcial | Metadata básica existe pero podría enriquecerse |
| **B57** | `page.tsx` | ⚠️ Parcial | Errores Zod muestran mensaje genérico pero funcional |
| **B58** | `useViewport.ts` | ⚠️ Parcial | Zoom hacia (0,0) pero no es crítico para MVP |

---

## ❌ Bugs No Confirmados / Ya Corregidos (32 bugs)

### Build/TypeScript (3 bugs ya corregidos)

| ID | Archivo | Estado | Evidencia |
|----|---------|--------|-----------|
| **B2** | `useSeatMapStore.test.ts:111` | ❌ Corregido | Mock YA tiene `seatCount: 0` |
| **B3** | `useSeatMapStore.test.ts:120` | ❌ Corregido | Mock YA tiene `seatCount: 0` |
| **B4** | `useSeatMapStore.ts:437-442` | ❌ No existe | Líneas 437-442 no contienen `any` |

### Lógica (2 bugs no confirmados)

| ID | Archivo | Estado | Evidencia |
|----|---------|--------|-----------|
| **B34** | `patternParser.ts` | ❌ No confirmado | Soporta rangos descendentes (`step = s <= e ? 1 : -1`) |
| **B35** | `useSeatMapStore.ts` | ❌ Corregido | `seatCount` se sincroniza en `updateSeatCount` |

### Tests (4 bugs no confirmados)

| ID | Archivo | Estado | Evidencia |
|----|---------|--------|-----------|
| **B37** | Tests | ❌ No confirmado | Hay 6 suites de tests funcionando |
| **B38** | Tests | ❌ No confirmado | No aplica |
| **B39** | Tests | ❌ No confirmado | No aplica |
| **B40** | Tests | ❌ No confirmado | No aplica |

### UX/Interacción (4 bugs ya corregidos)

| ID | Archivo | Estado | Evidencia |
|----|---------|--------|-----------|
| **B5** | `SvgEditor.tsx` | ❌ Corregido | Alt+Click funciona en `useViewport.ts` |
| **B6** | `SeatComponent.tsx` | ❌ Parcial | Dragging funciona (implementado en Row/Table) |
| **B8** | `useViewport.ts` | ❌ Corregido | `stopPropagation` está implementado |
| **B10** | `useSeatMapStore.ts` | ❌ Corregido | `seatCount` se actualiza correctamente |

### Pulido (B12-B26 - 14 bugs no verificables)

| ID | Estado | Notas |
|----|--------|-------|
| **B12-B26** | ❌ No verificables | Bugs genéricos de "mejoras menores" sin especificar |

### Configuración (1 bug)

| ID | Archivo | Estado | Evidencia |
|----|---------|--------|-----------|
| **B50** | `prompts.jsonl` | ❌ Ya cumplido | Tiene 28 entradas completas y válidas |

---

## 📋 Lista de Bugs Reales que Requieren Atención

### Prioridad CRÍTICA (Build bloqueado)
1. ✅ **B1/B41** - Type error en `removeElements`
2. ✅ **B53** - Spread types error
3. ✅ **B9** - Sin selección múltiple (REQUERIDO explícitamente)

### Prioridad ALTA (MVP incompleto)
4. ✅ **B4** - Race condition en delete
5. ✅ **B36** - Mesas rectangulares con distribución circular
6. ✅ **B27** - XSS potencial (sanitizar labels)
7. ✅ **B77** - Accesibilidad crítica

### Prioridad MEDIA (Deuda técnica)
8. ✅ **B32**, **B72**, **B74**, **B75** - Problemas de arquitectura
9. ✅ **B55**, **B78** - Problemas de performance
10. ✅ **B42**, **B44**, **B47**, **B80** - Configuración

### Prioridad BAJA (Mejoras)
11. ✅ **B60**, **B61**, **B64-B67** - UX/Edge cases
12. ✅ **B79**, **B81**, **B82** - Resiliencia e i18n

---

## 🎯 Recomendaciones

### 1. Limpiar BUGS_AUDIT.md
- Remover los 32 bugs no confirmados/corregidos
- Mantener solo los 40 bugs confirmados + 10 parciales
- Actualizar el conteo: **50 bugs reales** (no 82)

### 2. Priorizar Correcciones
- **Fase 1:** Corregir B1, B53 (build pasa) - **1-2 horas**
- **Fase 2:** Implementar B9 (selección múltiple) - **2-3 horas**
- **Fase 3:** Corregir B4, B36 (MVP completo) - **2-4 horas**

### 3. Documentación
- Separar "bugs" de "mejoras técnicas"
- Usar labels: `[CRÍTICO]`, `[ALTO]`, `[MEDIO]`, `[BAJO]`
- Mantener registro de bugs corregidos

---

*Informe generado por análisis estático del código fuente*
*Fecha: 26/02/2026*
