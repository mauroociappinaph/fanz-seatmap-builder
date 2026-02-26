// src/components/editor/elements/RowComponent.tsx
import React from "react";
import { Row } from "@/domain/types";
import { SeatComponent } from "./SeatComponent";
import { useSeatMapStore } from "@/store";
import { useViewport } from "@/hooks/useViewport";

interface RowComponentProps {
  row: Row;
}

export const RowComponent: React.FC<RowComponentProps> = ({ row }) => {
  const { selectedIds, toggleSelection, startDragging, setActiveTool } =
    useSeatMapStore();
  const { screenToSVG } = useViewport();
  const isSelected = selectedIds.includes(row.id);

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el click llegue al fondo del SVG
    const svg = (e.currentTarget as SVGElement).ownerSVGElement;
    if (svg) {
      const pos = screenToSVG(e.clientX, e.clientY, svg);
      startDragging(row.id, pos);
      if (!isSelected) {
        toggleSelection(row.id);
      }
      setActiveTool("select");
    }
  };

  return (
    <g
      transform={`translate(${row.position.x}, ${row.position.y}) rotate(${row.rotation})`}
      onMouseDown={onMouseDown}
      className="group cursor-move"
    >
      {/* Visual bounding box for selection if needed */}
      {isSelected && (
        <rect
          x={-15}
          y={-15}
          width={row.seats.length * 25 + 10} // Simple heuristic
          height={30}
          fill="rgba(59, 130, 246, 0.05)"
          stroke="#3b82f6"
          strokeWidth={1}
          strokeDasharray="4 2"
          rx={4}
        />
      )}

      {row.seats.map((seat) => (
        <SeatComponent
          key={seat.id}
          seat={seat}
          isSelected={selectedIds.includes(seat.id)}
          onClick={() => toggleSelection(seat.id)}
        />
      ))}

      {/* Row Label */}
      <text
        x={-25}
        y={0}
        dominantBaseline="central"
        textAnchor="end"
        fontSize={10}
        fontWeight="bold"
        fill="#94a3b8"
        className="select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Row {row.label}
      </text>
    </g>
  );
};
