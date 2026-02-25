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

  // Debería ser dinámico basado en el contenedor
  const width = 1200;
  const height = 800;

  const vbWidth = width / viewport.zoom;
  const vbHeight = height / viewport.zoom;
  const viewBox = `${viewport.panX} ${viewport.panY} ${vbWidth} ${vbHeight}`;

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-crosshair block bg-[#020617]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Grid Pattern */}
          <pattern
            id="grid-minor"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id="grid-major"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <rect width="100" height="100" fill="url(#grid-minor)" />
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Technical Background */}
        <rect
          x={viewport.panX - 5000}
          y={viewport.panY - 5000}
          width={vbWidth + 10000}
          height={vbHeight + 10000}
          fill="url(#grid-major)"
        />

        {/* Origin Marker */}
        <g opacity="0.2">
          <line x1="-20" y1="0" x2="20" y2="0" stroke="white" strokeWidth="1" />
          <line x1="0" y1="-20" x2="0" y2="20" stroke="white" strokeWidth="1" />
        </g>

        <MapElements />
      </svg>

      {/* HUD Float Overlay */}
      <div className="absolute top-6 left-6 flex items-center gap-3 p-1 pl-4 glass-dark rounded-xl pointer-events-none">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-700 pr-3">
          Viewport
        </span>
        <div className="flex gap-4 pr-3">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase text-slate-600 font-bold tracking-tighter">
              Zoom
            </span>
            <span className="text-xs font-mono text-blue-400 leading-none">
              {(viewport.zoom * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase text-slate-600 font-bold tracking-tighter">
              Pos X
            </span>
            <span className="text-xs font-mono text-slate-300 leading-none">
              {viewport.panX.toFixed(0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase text-slate-600 font-bold tracking-tighter">
              Pos Y
            </span>
            <span className="text-xs font-mono text-slate-300 leading-none">
              {viewport.panY.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Axis Marker HUD */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="flex items-center gap-2 text-[9px] font-bold text-blue-500/50 tracking-widest bg-blue-500/5 px-2 py-1 rounded-md border border-blue-500/10 uppercase">
          <div className="w-1 h-3 bg-blue-500/40 rounded-full" />
          Active Coordinate System: Cartesiano SV v1
        </div>
      </div>
    </div>
  );
};
