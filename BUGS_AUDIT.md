# 🐛 BUGS_AUDIT.md - Fanz SeatMap Builder

> **Actualizado:** 26/02/2026
> **Total de bugs confirmados:** 50 (40 críticos + 10 mejoras)
> **Estado:** Análisis verificado - Pendiente corrección

---

## 📊 Resumen Ejecutivo

| Fase | Bugs | Tiempo Est. | Prioridad | Estado |
|------|------|-------------|-----------|--------|
| 🔴 **Fase 1: Build & MVP Crítico** | 7 | 2-3 horas | CRÍTICA | ⏳ Pendiente |
| ⭐ **Fase 2: MVP Completo** | 10 | 3-4 horas | ALTA | ⏳ Pendiente |
| ✨ **Fase 3: Polish Profesional** | 33 | 1-2 días | MEDIA | ⏳ Pendiente |

**Bloqueante actual:** Build de producción falla (TypeScript errors)

---

## 🚨 FASE 1: "Build & MVP Crítico"

> **Objetivo:** Corregir bugs que bloquean el build y cumplir requisitos MVP críticos
> **Tiempo estimado:** 2-3 horas
> **Resultado esperado:** `npm run build` pasa ✅ + MVP funcional

### Bugs de Build (CRÍTICOS):

| ID | Archivo | Línea | Bug | Evidencia |
|----|---------|-------|-----|-----------|
| **B1/B41** | `useSeatMapStore.ts` | 88 | Type error en `removeElements` - unión de tipos incorrecta | `tsc`: Type 'Row \| Seat' not assignable to type 'Seat' |
| **B53** | `useSeatMapStore.ts` | 445 | Spread types error | `tsc`: Spread types may only be created from object types |

### Bugs MVP Requeridos:

| ID | Requisito | Bug | Impacto |
|----|-----------|-----|---------|
| **B9** | 📋.2 Selección múltiple | No hay Ctrl/Cmd+Click | **REQUERIDO explícitamente en REQUISITOS.md** |
| **B4** | 📋.2 Confirmación delete | Race condition en toast | Puede borrar elementos incorrectos |
| **B36** | 📋.2 Gestión de mesas | Mesas rectangulares usan distribución circular | Asientos mal posicionados |
| **B27** | Seguridad | XSS potencial en labels | Script injection posible |
| **B77** | Accesibilidad | Sin role="button", aria-label, ni tabIndex | Mapa invisible para lectores de pantalla |

### ✅ Checklist Fase 1:
- [ ] Corregir errores TypeScript (B1, B53)
- [ ] Implementar selección múltiple (Ctrl+Click)
- [ ] Corregir race condition en delete
- [ ] Implementar distribución rectangular correcta
- [ ] Sanitizar labels (prevenir XSS)
- [ ] Agregar atributos de accesibilidad básicos
- [ ] `npm test` pasa (23/23)
- [ ] `npx tsc --noEmit` sin errores
- [ ] `npm run build` compila exitosamente

---

## ⭐ FASE 2: "MVP Completo"

> **Objetivo:** Cumplir 100% de los requisitos de REQUISITOS.md
> **Tiempo estimado:** 3-4 horas
> **Resultado esperado:** Todas las funcionalidades MVP operativas

### Bugs Funcionales:

| ID | Archivo | Bug | Impacto |
|----|---------|-----|---------|
| **B29** | `useViewport.ts` | Sin debounce/throttle en zoom | Performance degradada |
| **B49** | `jest.config.ts` | Sin coverage threshold | Sin métricas de calidad |
| **B7** | `AreaComponent.tsx` | Sin transform (inconsistencia) | Áreas se comportan diferente a filas/mesas |
| **B56** | `useSeatMapStore.ts` | Dragging no se cancela al borrar | draggingId apunta a elemento eliminado |
| **B59** | `MapElements.tsx` | Trampa del Z-Index | Áreas cubren asientos, no se pueden seleccionar |
| **B60** | `useSeatMapStore.ts` | Floating Point Drift | Posiciones con decimales infinitos |
| **B61** | `patternParser.ts` | Patrones inválidos no dan error | `{1..Z}` genera etiqueta literal |
| **B64** | `Inspector.tsx` | Color picker sin debounce | Jank en UI |
| **B81** | `page.tsx`, `useSeatMapStore.ts` | i18n inconsistente | Mezcla Español/Inglés |
| **B82** | `SeatComponent.tsx` | Layout Bomb | Sin validación de longitud en labels |

### ✅ Checklist Fase 2:
- [ ] Implementar debounce/throttle
- [ ] Corregir inconsistencia de transform en áreas
- [ ] Cancelar dragging al borrar elemento
- [ ] Corregir Z-Index (áreas debajo de asientos)
- [ ] Normalizar posiciones (evitar floating point drift)
- [ ] Validar patrones de etiquetado
- [ ] Centralizar strings de i18n
- [ ] Validar longitud máxima de labels

---

## ✨ FASE 3: "Polish Profesional"

> **Objetivo:** Mejoras, refactor, pulido - Production grade
> **Tiempo estimado:** 1-2 días (opcional)
> **Resultado esperado:** Código de calidad profesional

### 🏗️ Arquitectura (15 bugs):

| ID | Archivo | Bug | Prioridad |
|----|---------|-----|-----------|
| **B32** | `useSeatMapStore.ts` | Mezcla de responsabilidades (SRP) | Media |
| **B33** | `layout/index.ts` | Barrel vacío | Baja |
| **B54** | `domain/types.ts` | Table sin propiedad `capacity` | Media |
| **B55** | `SvgEditor.tsx` | Suscripción masiva al store | Media |
| **B68** | `useSeatMapStore.ts` | applyBulkLabels sin verificación | Baja |
| **B69** | `useSeatMapStore.ts` | Estructura anidada O(N*M) | Media |
| **B70** | `useSeatMapStore.ts` | Mezcla datos persistentes y UI state | Media |
| **B71** | `RowComponent.tsx`, `TableComponent.tsx` | Fuga de abstracción (ownerSVGElement) | Baja |
| **B72** | `useSeatMapStore.ts` | Fat Store | Media |
| **B73** | `useSeatMapStore.ts` | Dependencia Inversa (DIP) | Media |
| **B74** | `useSeatMapStore.ts` | Violación DRY en addRow/addTable/addArea | Media |
| **B75** | `MapElements.tsx` | Falta Strategy Pattern | Baja |
| **B78** | Todos los componentes | Sin React.memo | Media |
| **B79** | `page.tsx`, `layout.tsx` | Sin Error Boundaries | Media |
| **B80** | `package.json` | Dependencias experimentales (Next.js 16, React 19) | Baja |

### 🎨 UX/Performance (8 bugs):

| ID | Archivo | Bug | Prioridad |
|----|---------|-----|-----------|
| **B42** | `next.config.ts` | Config vacío | Baja |
| **B44** | `jest.config.ts` | Preset duplicado | Baja |
| **B45** | `tailwind.config.ts` | Tailwind v4 con sintaxis v3 | Baja |
| **B47** | `package.json` | React 19 experimental | Baja |
| **B52** | `layout.tsx` | lang="en" (debería ser "es") | Baja |
| **B65** | `SvgEditor.tsx` | Dimensiones fijas 1200x800 | Media |
| **B66** | `SeatComponent.tsx` | fontSize fijo 6px | Baja |
| **B67** | `AreaComponent.tsx` | Etiquetas en points[0] | Baja |

### 🛡️ Seguridad/Config (4 bugs):

| ID | Archivo | Bug | Prioridad |
|----|---------|-----|-----------|
| **B28** | `page.tsx` | Sin validación de tamaño de archivo | Media |
| **B46** | `globals.css` | Posibles clases sin usar | Baja |
| **B48** | `package.json` | Zod v4 nuevo | Baja |
| **B51** | `layout.tsx` | Metadata básica | Baja |

### ⚠️ Mejoras de UX (6 bugs parciales):

| ID | Archivo | Estado | Notas |
|----|---------|--------|-------|
| **B30** | `types.ts` | ⚠️ Parcial | Tipado complejo pero funcional |
| **B31** | `tableLayout.test.ts` | ⚠️ Práctica común | Uso de `Partial<Table>` aceptable |
| **B57** | `page.tsx` | ⚠️ Parcial | Errores Zod muestran mensaje genérico |
| **B58** | `useViewport.ts` | ⚠️ Parcial | Zoom hacia (0,0) no crítico |
| **B76** | `SvgEditor.tsx` | ⚠️ Parcial | Passive event listener warning |
| **B50** | `prompts.jsonl` | ✅ Cumplido | 28 entradas válidas |

### ✅ Checklist Fase 3:
- [ ] Refactor useSeatMapStore.ts (separar responsabilidades)
- [ ] Implementar Repository Pattern
- [ ] Agregar React.memo a componentes de elementos
- [ ] Implementar Error Boundaries
- [ ] Completar barrel exports
- [ ] Validar tamaño de archivos importados
- [ ] Hacer dimensiones del lienzo responsivas
- [ ] Todos los tests pasan con >80% coverage
- [ ] Lighthouse score >90
- [ ] Sin warnings de ESLint

---

## 📋 Tabla Completa de Bugs Confirmados

### 🔴 Críticos - Build Bloqueado (2)
| ID | Archivo | Línea | Bug |
|----|---------|-------|-----|
| B1/B41 | `useSeatMapStore.ts` | 88 | Type error en removeElements |
| B53 | `useSeatMapStore.ts` | 445 | Spread types error |

### 🔴 MVP Requeridos (5)
| ID | Archivo | Bug |
|----|---------|-----|
| B9 | Global | Sin selección múltiple Ctrl/Cmd+Click |
| B4 | `page.tsx` | Race condition en delete |
| B36 | `tableLayout.ts` | Mesas rectangulares con distribución circular |
| B27 | `SeatComponent.tsx` | XSS potencial en labels |
| B77 | Componentes SVG | Sin accesibilidad (a11y) |

### 🟠 Funcionales - MVP (10)
| ID | Archivo | Bug |
|----|---------|-----|
| B29 | `useViewport.ts` | Sin debounce/throttle |
| B49 | `jest.config.ts` | Sin coverage threshold |
| B7 | `AreaComponent.tsx` | Sin transform |
| B56 | `useSeatMapStore.ts` | Dragging no se cancela al borrar |
| B59 | `MapElements.tsx` | Trampa del Z-Index |
| B60 | `useSeatMapStore.ts` | Floating Point Drift |
| B61 | `patternParser.ts` | Patrones inválidos no dan error |
| B64 | `Inspector.tsx` | Color picker sin debounce |
| B81 | `page.tsx` | i18n inconsistente |
| B82 | `SeatComponent.tsx` | Layout Bomb |

### 🟡 Arquitectura (15)
| ID | Archivo | Bug |
|----|---------|-----|
| B32 | `useSeatMapStore.ts` | Mezcla de responsabilidades |
| B33 | `layout/index.ts` | Barrel vacío |
| B54 | `domain/types.ts` | Table sin capacity |
| B55 | `SvgEditor.tsx` | Suscripción masiva al store |
| B68 | `useSeatMapStore.ts` | applyBulkLabels sin verificación |
| B69 | `useSeatMapStore.ts` | Estructura anidada O(N*M) |
| B70 | `useSeatMapStore.ts` | Mezcla datos persistentes y UI state |
| B71 | `RowComponent.tsx`, `TableComponent.tsx` | Fuga de abstracción |
| B72 | `useSeatMapStore.ts` | Fat Store |
| B73 | `useSeatMapStore.ts` | Dependencia Inversa (DIP) |
| B74 | `useSeatMapStore.ts` | Violación DRY |
| B75 | `MapElements.tsx` | Falta Strategy Pattern |
| B78 | Todos los componentes | Sin React.memo |
| B79 | `page.tsx`, `layout.tsx` | Sin Error Boundaries |
| B80 | `package.json` | Dependencias experimentales |

### 🟢 Config/UX (12)
| ID | Archivo | Bug |
|----|---------|-----|
| B42 | `next.config.ts` | Config vacío |
| B44 | `jest.config.ts` | Preset duplicado |
| B45 | `tailwind.config.ts` | Tailwind v4 con sintaxis v3 |
| B47 | `package.json` | React 19 experimental |
| B52 | `layout.tsx` | lang="en" |
| B65 | `SvgEditor.tsx` | Dimensiones fijas 1200x800 |
| B66 | `SeatComponent.tsx` | fontSize fijo 6px |
| B67 | `AreaComponent.tsx` | Etiquetas en points[0] |
| B28 | `page.tsx` | Sin validación de tamaño de archivo |
| B46 | `globals.css` | Posibles clases sin usar |
| B48 | `package.json` | Zod v4 nuevo |
| B51 | `layout.tsx` | Metadata básica |

### ⚠️ Parciales/Mejoras (6)
| ID | Archivo | Estado |
|----|---------|--------|
| B30 | `types.ts` | Tipado complejo |
| B31 | `tableLayout.test.ts` | Cast aceptable |
| B57 | `page.tsx` | Errores genéricos |
| B58 | `useViewport.ts` | Zoom hacia (0,0) |
| B76 | `SvgEditor.tsx` | Passive event warning |
| B50 | `prompts.jsonl` | ✅ Cumplido |

---

## 🎯 Decisión Recomendada

### Si tenés **poco tiempo** (1-2 días):
> **Fase 1 + Fase 2** → MVP entregable funcional

### Si tenés **tiempo suficiente** (3-5 días):
> **Fase 1 + Fase 2 + Fase 3 críticos** → Producto pulido

### Si el **plazo es ajustado** (horas):
> **Solo Fase 1** → Build pasa, funcionalidades básicas operativas

---

## 🚀 Próximo Paso Recomendado

**Toggle a ACT MODE** y corregir los bugs de Fase 1 (2-3 horas de trabajo).

Con eso el proyecto estará:
- ✅ Build pasando
- ✅ Tests pasando
- ✅ MVP funcional
- ✅ Listo para deploy

---

*Última actualización: 26/02/2026*
*Basado en verificación de código fuente*
*Para bugs de runtime: ejecutar `npm run dev` y testear manualmente*
