// src/components/editor/elements/AreaComponent.tsx
import React from "react";
import { Area } from "@/domain/types";
import { useSeatMapStore } from "@/store";
import { useViewport } from "@/hooks/useViewport";

interface AreaComponentProps {
  area: Area;
}

export const AreaComponent: React.FC<AreaComponentProps> = ({ area }) => {
  const isSelected = useSeatMapStore((state) =>
    state.selectedIds.includes(area.id),
  );
  const selectElement = useSeatMapStore((state) => state.selectElement);
  const startDragging = useSeatMapStore((state) => state.startDragging);
  const setActiveTool = useSeatMapStore((state) => state.setActiveTool);

  const { screenToSVG } = useViewport();

  // Convert points array to SVG polygon string
  const pointsString = area.points.map((p) => `${p.x},${p.y}`).join(" ");

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const svg = (e.currentTarget as SVGElement).ownerSVGElement;
    if (svg) {
      const pos = screenToSVG(e.clientX, e.clientY, svg);
      const isMulti = e.ctrlKey || e.metaKey;

      if (isMulti || !isSelected) {
        selectElement(area.id, isMulti);
      }

      startDragging(area.id, pos);
      setActiveTool("select");
    }
  };

  return (
    <g
      onMouseDown={onMouseDown}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectElement(area.id, e.ctrlKey || e.metaKey);
        }
      }}
      tabIndex={0}
      focusable="true"
      className="group cursor-move outline-none"
      role="region"
      aria-label={`Area ${area.label}`}
    >
      <polygon
        points={pointsString}
        fill={area.color || "rgba(59, 130, 246, 0.1)"}
        stroke={isSelected ? "#3b82f6" : area.color || "#94a3b8"}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray={isSelected ? "none" : "5 5"}
        className="transition-all cursor-pointer hover:fill-opacity-20"
        style={{ fillOpacity: isSelected ? 0.3 : 0.1 }}
      />

      {/* Area Label (at the first point or center) */}
      <text
        x={area.points[0]?.x || 0}
        y={(area.points[0]?.y || 0) - 10}
        fontSize={14}
        fontWeight="bold"
        fill={isSelected ? "#2563eb" : "#64748b"}
        className="select-none pointer-events-none"
      >
        {area.label}
      </text>
    </g>
  );
};
