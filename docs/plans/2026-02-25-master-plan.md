# Fanz SeatMapBuilder - Plan Maestro de Implementación (V4.4 - SVG Nativo)

> **Para Claude:** SUB-SKILL REQUERIDA: Usar superpowers:executing-plans para implementar este plan tarea por tarea.
> **AI TRACKING:** Actualizar `prompts.jsonl` después de completar cada tarea siguiendo esta estructura obligatoria:
> `{ "timestamp": "ISO-8601", "tool/model": "string", "purpose": "string", "prompt": "string", "response_summary": "string", "notes": "string" }`

**Objetivo:** Construir un editor de mapas de asientos interactivo de grado de producción utilizando SVG nativo para los gráficos, aplicando SRP, DRY, Archivos Barrel, usando Jest para pruebas, incorporando etiquetado detallado por patrones, registro de interacciones de IA, un modelo de dominio concreto y un flujo de trabajo robusto de Git/GitHub.

---

### Fase 1: Infraestructura, Blindaje y Dominio Core (Día 1-2)

#### Tarea 0: Andamiaje del Proyecto y Estándares de Ingeniería
- **Objetivo:** Inicializar el proyecto Next.js con TypeScript, Jest, Husky, GitHub Actions y estándares de código forzados.
- [x] Inicializar Next.js 14 App con TypeScript (`npx create-next-app@latest . --ts --eslint --app --src-dir --import-alias "@/*"`).
- [x] Instalar dependencias: `zustand`, `lucide-react`, `sonner`, `clsx`, `tailwind-merge`.
- [x] Configurar **Jest** y React Testing Library.
- [x] Configurar **Husky** y `lint-staged` en `package.json`.
- [x] Implementar **Barrel Files** (`index.ts`) en los directorios iniciales de `src/`.
- [x] Crear `.github/workflows/ci.yml`.
- [x] Crear `prompts.jsonl` y registrar los prompts iniciales de configuración.

#### Tarea 0.5: Repositorio Git y Estrategia de Ramas
- **Objetivo:** Configurar el repositorio Git local y definir la estrategia de ramas.
- [x] Inicializar repositorio Git local (`git init`).
- [x] Configurar Git para usar Conventional Commits.
- [x] Definir estrategia de ramas de características (ej: `feat/task-description`).

#### Tarea 1: Modelo de Dominio y Estado Global (Enfoque SRP y DRY)
- **Objetivo:** Implementar el store de Zustand basado en los tipos `SeatMap` y `EditorState` definidos en `SPEC.md`.
- [x] Crear `src/store/useSeatMapStore.ts` usando el patrón de Acciones Inmutables.
- [x] Escribir pruebas unitarias en Jest para todas las acciones del store.

#### Tarea 2: Servicios de Persistencia
- **Objetivo:** Implementar importación/exportación JSON confiable sin pérdida de datos.
- [x] Implementar `src/services/persistence/jsonMapper.ts` con validación de esquema.
- [x] Escribir pruebas Jest para asegurar la integridad de los datos en el ciclo de exportación/importación.

---

### Fase 2: Motor Gráfico SVG y Elementos Visuales (Día 3-5)

#### Tarea 3: Motor de Etiquetado por Lotes (TDD OBLIGATORIO)
- **Objetivo:** Implementar un etiquetado robusto basado en patrones para filas, asientos, áreas y mesas.
- [x] Escribir pruebas Jest para patrones: `A{1..10}`, `{A..Z}{1..5}`, `Sector {n}`, `Table {A..C}-{1..4}`.
- [x] Implementar `src/services/labeling/patternParser.ts` basado en los casos de prueba.
- [x] Integrar el parser en el store para actualizaciones masivas.

#### Tarea 4: Canvas SVG y Viewport (Pan/Zoom)
- **Objetivo:** Proporcionar un área de dibujo suave y navegable para el mapa de asientos usando SVG nativo.
- [x] Crear `src/components/editor/SvgEditor.tsx` con lógica de Pan/Zoom usando `viewBox` y escuchadores de eventos.
- [x] Implementar `src/components/editor/MapElements.tsx` para orquestar el renderizado de elementos SVG.
- [x] Asegurar desacoplamiento total del estado de la UI a través del store.

#### Tarea 5: Renderizado de Elementos Visuales SVG
- **Objetivo:** Renderizar todos los elementos del dominio con precisión usando componentes SVG nativos.
- [ ] Implementar componentes SVG para `Row`, `Seat`, `Area`, `Table` según los tipos de `SPEC.md`.
- [ ] Asegurar que las etiquetas obligatorias sean visibles e interactivas al pasar el mouse o seleccionar.

---

### Fase 3: Interacción, Gestión y Lógica de Negocio (Día 6-8)

#### Tarea 6: Gestión de Elementos y Confirmación de Eliminación
- **Objetivo:** Permitir a los usuarios crear, seleccionar y eliminar elementos con confirmación.
- [ ] Implementar `src/components/ui/Toolbar.tsx` para la creación de elementos.
- [ ] Implementar `src/components/editor/SelectionManager.tsx` para la selección de nodos SVG.
- [ ] Crear `src/components/ui/ConfirmDeleteModal.tsx` (Componente Atómico).

#### Tarea 7: Panel de Inspector y Propiedades
- **Objetivo:** Permitir la edición de propiedades de los elementos como etiquetas y dimensiones.
- [ ] Crear `src/components/ui/Inspector.tsx` para mostrar y editar las propiedades de los elementos seleccionados.

#### Tarea 8: Flujo de Colocación de Elementos y Drag to Move
- **Objetivo:** Implementar la interacción principal para posicionar elementos en el canvas.
- [ ] Implementar la lógica para colocar nuevos elementos en el canvas.
- [ ] Implementar la funcionalidad de arrastrar y soltar para mover los elementos seleccionados.

---

### Fase 4: Pulido Final, Flujo Git y Auditoría (Día 9-10)

#### Tarea 9: Refinamiento de UI/UX (Benchmarking Seats.io)
- **Objetivo:** Lograr una calidad visual de alta fidelidad y una UX intuitiva.
- [ ] Aplicar estilo profesional (ej: Dark Glassmorphism).
- [ ] Pulir transiciones, estados hover y comportamiento responsivo.

#### Tarea 10: Flujo Git, Entrega y Auditoría de IA
- **Objetivo:** Finalizar código, realizar commits, crear PR, fusionar y preparar todos los entregables.
- [ ] **Tarea 10.1: Crear Pull Request.**
- [ ] **Tarea 10.2: Atender Feedback de CI.**
- [ ] **Tarea 10.3: Fusionar PR en `main`.**
- [ ] **Tarea 10.4: Finalizar Entregables.**
    - Consolidar todas las interacciones de IA en `prompts.jsonl`.
    - Auditar `README.md` contra la implementación final.
    - Ejecutar pruebas E2E finales.
    - Commit final y Push a GitHub.
    - Ejecutar `npm run build` para verificación final.
