# Prueba Técnica: SeatMapBuilder (Fanz)

## 🎯 Objetivo Principal

Desarrollar un **editor visual interactivo** para diseñar mapas de asientos. El editor debe permitir crear y editar filas, asientos, áreas y mesas de forma intuitiva y eficiente. Se recomienda explorar **Seats.io** como referencia de UX/UI para comprender la experiencia deseada.

---

## 🚀 Stack Tecnológico Propuesto

*   **Framework:** React + TypeScript + Next.js (v14+)
*   **Gestión de Estado:** Zustand
*   **Gráficos:** SVG (integrado nativamente con React)
*   **Backend:** Opcional (Node-express-prisma). Se priorizará una solución **frontend-only** para el MVP, gestionando el estado en memoria y persistiendo vía JSON.
*   **Librerías Adicionales:** Se podrán utilizar librerías JS que aporten valor y cumplan los estándares.

---

## 📋 Requerimientos MVP

### 📋.1 Visualización
*   El mapa debe mostrar filas, asientos, áreas y mesas de forma clara y navegable.

### 📋.2 Gestión de Filas y Asientos
*   **Creación:** Capacidad para crear una o múltiples filas, con cantidad de asientos configurable por fila.
*   **Selección:** Soporte para seleccionar filas y asientos de forma individual o múltiple.
*   **Acciones sobre Selección:**
    *   Etiquetar elementos seleccionados.
    *   Eliminar elementos seleccionados (con **confirmación explícita** antes de borrar).

### 📋.3 Etiquetado de Elementos
*   **Obligatoriedad:** Todos los elementos (filas, asientos individuales, áreas, mesas y asientos por mesa) deben tener una etiqueta obligatoria.
*   **Etiquetado Rápido:** Soporte para aplicar etiquetas por lotes o mediante patrones definidos (ej: `Platea 1...N`, `A1...A10`).

### 📋.4 Flujo de Sesión y Persistencia
*   **Acción "Nuevo Mapa":** Debe existir una opción clara para resetear el estado de la aplicación a una sesión vacía.
*   **Importación/Exportación:** Permitir importar y exportar el mapa de asientos en formato **JSON** sin pérdida de datos.

---

## 📜 Reglas Fundamentales

*   **Backend Opcional:** El estado del mapa se gestionará principalmente en memoria (frontend). La persistencia vía JSON es suficiente para el MVP.
*   **Uso de IA Obligatorio:** Es requisito indispensable el uso de una herramienta de IA (como Cursor o similar) durante el desarrollo.

---

## 📦 Entregables

*   **Repositorio Público:** En GitHub (`github.com/mauroociappinaph/fanz-seatmap-builder`), con `npm run dev` funcionando.
*   **Documentación:**
    *   `README.md`: Instrucciones detalladas de setup, decisiones técnicas clave, esquema de datos y supuestos asumidos.
    *   `SPEC.md`: Documento técnico detallando la arquitectura y el modelo de datos.
*   **Registro de IA (`prompts.jsonl`):** Archivo que documente todas las interacciones significativas con la IA, incluyendo: `timestamp`, `tool/model`, `purpose`, `prompt`, `response_summary`, `notes`.

---

## ⏳ Plazo

**10 días corridos** desde la recepción de esta prueba.
