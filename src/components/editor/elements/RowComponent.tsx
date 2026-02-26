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
  const isSelected = useSeatMapStore((state) =>
    state.selectedIds.includes(row.id),
  );
  const selectElement = useSeatMapStore((state) => state.selectElement);
  const startDragging = useSeatMapStore((state) => state.startDragging);
  const setActiveTool = useSeatMapStore((state) => state.setActiveTool);
  const selectedIds = useSeatMapStore((state) => state.selectedIds);

  const { screenToSVG } = useViewport();

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el click llegue al fondo del SVG
    const svg = (e.currentTarget as SVGElement).ownerSVGElement;
    if (svg) {
      const pos = screenToSVG(e.clientX, e.clientY, svg);
      const isMulti = e.ctrlKey || e.metaKey;

      if (isMulti || !isSelected) {
        selectElement(row.id, isMulti);
      }

      startDragging(row.id, pos);
      setActiveTool("select");
    }
  };

  return (
    <g
      transform={`translate(${row.position.x}, ${row.position.y}) rotate(${row.rotation})`}
      onMouseDown={onMouseDown}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectElement(row.id, e.ctrlKey || e.metaKey);
        }
      }}
      tabIndex={0}
      className="group cursor-move outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      role="group"
      aria-label={`Row ${row.label}, ${row.seats.length} seats`}
    >
      {/* Visual bounding box for selection if needed */}
      {isSelected && (
        <rect
          x={-15}
          y={-15}
          width={Math.max(40, row.seats.length * row.seatSpacing + 10)}
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
          onClick={(isMulti) => selectElement(seat.id, isMulti)}
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
