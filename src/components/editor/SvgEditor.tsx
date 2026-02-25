// src/components/editor/SvgEditor.tsx
"use client";

import React from "react";
import { useViewport } from "@/hooks/useViewport";
import { MapElements } from "./MapElements";

export const SvgEditor: React.FC = () => {
  const {
    viewport,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useViewport();

  const width = 800; // Temporal - Debería ser responsivo
  const height = 600;

  // Calculamos el viewBox basado en pan y zoom
  const vbWidth = width / viewport.zoom;
  const vbHeight = height / viewport.zoom;
  const viewBox = `${viewport.panX} ${viewport.panY} ${vbWidth} ${vbHeight}`;

  return (
    <div className="w-full h-full overflow-hidden bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-crosshair block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        {/* Grilla de fondo */}
        <rect
          x={viewport.panX}
          y={viewport.panY}
          width={vbWidth}
          height={vbHeight}
          fill="url(#grid)"
        />

        <MapElements />
      </svg>

      {/* HUD de Información Temporal */}
      <div className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-xs rounded shadow border">
        Zoom: {viewport.zoom.toFixed(2)}x | Pan: {viewport.panX.toFixed(0)},{" "}
        {viewport.panY.toFixed(0)}
      </div>
    </div>
  );
};
