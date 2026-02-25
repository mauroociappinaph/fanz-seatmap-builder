// src/components/editor/elements/AreaComponent.tsx
import React from "react";
import { Area } from "@/domain/types";
import { useSeatMapStore } from "@/store";

interface AreaComponentProps {
  area: Area;
}

export const AreaComponent: React.FC<AreaComponentProps> = ({ area }) => {
  const { selectedIds, toggleSelection } = useSeatMapStore();
  const isSelected = selectedIds.includes(area.id);

  // Convert points array to SVG polygon string
  const pointsString = area.points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <g
      className="group"
      onClick={(e) => {
        e.stopPropagation();
        toggleSelection(area.id);
      }}
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
