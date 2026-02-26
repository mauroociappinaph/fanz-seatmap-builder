// src/components/editor/SvgEditor.tsx
"use client";

import React from "react";
import { useViewport } from "@/hooks/useViewport";
import { useSeatMapStore } from "@/store";
import { MapElements } from "./MapElements";
import { clsx } from "clsx";

export const SvgEditor: React.FC = () => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [isAltPressed, setIsAltPressed] = React.useState(false);

  const {
    viewport,
    handleWheel,
    handleMouseDown: viewportMouseDown,
    handleMouseMove: viewportMouseMove,
    handleMouseUp: viewportMouseUp,
    screenToSVG,
    isPanning,
  } = useViewport();

  const {
    activeTool,
    addRow,
    addTable,
    addArea,
    handleDragMove,
    stopDragging,
    draggingId,
  } = useSeatMapStore();

  // Handle Alt key listeners for cursor feedback
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") setIsAltPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setIsAltPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Debería ser dinámico basado en el contenedor
  const width = 1200;
  const height = 800;

  const vbWidth = width / viewport.zoom;
  const vbHeight = height / viewport.zoom;
  const viewBox = `${viewport.panX} ${viewport.panY} ${vbWidth} ${vbHeight}`;

  // Determine cursor based on state
  const getCursorClass = () => {
    if (isPanning) return "cursor-grabbing";
    if (isAltPressed) return "cursor-grab";
    return "cursor-crosshair";
  };

  const onMouseDown = (e: React.MouseEvent) => {
    // Si hay una herramienta de creación activa, colocamos el elemento
    if (activeTool !== "select" && svgRef.current) {
      const pos = screenToSVG(e.clientX, e.clientY, svgRef.current);
      if (activeTool === "addRow") addRow(pos);
      if (activeTool === "addTable") addTable(pos);
      if (activeTool === "addArea") addArea(pos);
      return;
    }

    // Deselect if clicking on the background (the major grid rect or the svg itself)
    // only if no modifier keys are pressed
    if (
      (e.target === e.currentTarget ||
        (e.target as Element).id === "bg-grid") &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      useSeatMapStore.getState().setSelection([]);
    }

    viewportMouseDown(e);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (draggingId && svgRef.current) {
      const pos = screenToSVG(e.clientX, e.clientY, svgRef.current);
      handleDragMove(pos);
      return;
    }

    viewportMouseMove(e);
  };

  const onMouseUp = () => {
    if (draggingId) {
      stopDragging();
      return;
    }
    viewportMouseUp();
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#fefefe]">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={viewBox}
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        tabIndex={0}
        focusable="true"
        className={clsx(
          getCursorClass(),
          "block outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20",
        )}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle SaaS Grid */}
          <pattern
            id="grid-minor"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="20"
              y1="0"
              x2="0"
              y2="0"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="20"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="1"
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
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Infinite Background Grid */}
        <rect
          id="bg-grid"
          x={viewport.panX - 10000}
          y={viewport.panY - 10000}
          width={vbWidth + 20000}
          height={vbHeight + 20000}
          fill="url(#grid-major)"
        />

        {/* Axis Crosshair (very subtle) */}
        <g opacity="0.3">
          <line
            x1="-50"
            y1="0"
            x2="50"
            y2="0"
            stroke="#94a3b8"
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="-50"
            x2="0"
            y2="50"
            stroke="#94a3b8"
            strokeWidth="0.5"
          />
        </g>

        <MapElements />
      </svg>

      {/* SaaS Style Viewport Info */}
      <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-white/90 backdrop-blur border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            Position
          </span>
          <span className="text-xs font-mono text-slate-600">
            {viewport.panX.toFixed(0)}, {viewport.panY.toFixed(0)}
          </span>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            Zoom
          </span>
          <span className="text-xs font-mono text-blue-600 font-bold">
            {(viewport.zoom * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};
