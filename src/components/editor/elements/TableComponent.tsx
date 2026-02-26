// src/components/editor/elements/TableComponent.tsx
import React from "react";
import { Table } from "@/domain/types";
import { SeatComponent } from "./SeatComponent";
import { useSeatMapStore } from "@/store";
import { useViewport } from "@/hooks/useViewport";

interface TableComponentProps {
  table: Table;
}

export const TableComponent: React.FC<TableComponentProps> = ({ table }) => {
  const isSelected = useSeatMapStore((state) =>
    state.selectedIds.includes(table.id),
  );
  const selectedIds = useSeatMapStore((state) => state.selectedIds);
  const toggleSelection = useSeatMapStore((state) => state.toggleSelection);
  const startDragging = useSeatMapStore((state) => state.startDragging);
  const setActiveTool = useSeatMapStore((state) => state.setActiveTool);

  const { screenToSVG } = useViewport();

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const svg = (e.currentTarget as SVGElement).ownerSVGElement;
    if (svg) {
      const pos = screenToSVG(e.clientX, e.clientY, svg);
      startDragging(table.id, pos);
      if (!isSelected) {
        toggleSelection(table.id);
      }
      setActiveTool("select");
    }
  };

  return (
    <g
      transform={`translate(${table.position.x}, ${table.position.y}) rotate(${table.rotation})`}
      onMouseDown={onMouseDown}
      className="group cursor-move"
    >
      {/* Table Surface */}
      {table.shape === "round" ? (
        <circle
          cx={0}
          cy={0}
          r={table.width / 2}
          fill="white"
          stroke={isSelected ? "#3b82f6" : "#cbd5e1"}
          strokeWidth={isSelected ? 3 : 2}
          className="transition-all"
        />
      ) : (
        <rect
          x={-table.width / 2}
          y={-table.height / 2}
          width={table.width}
          height={table.height}
          fill="white"
          stroke={isSelected ? "#3b82f6" : "#cbd5e1"}
          strokeWidth={isSelected ? 3 : 2}
          rx={8}
          className="transition-all"
        />
      )}

      {/* Table Label */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        fill="#475569"
        className="pointer-events-none select-none"
      >
        {table.label}
      </text>

      {/* Table Seats */}
      {table.seats.map((seat) => (
        <SeatComponent
          key={seat.id}
          seat={seat}
          isSelected={selectedIds.includes(seat.id)}
          onClick={() => toggleSelection(seat.id)}
        />
      ))}
    </g>
  );
};
