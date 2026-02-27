// src/components/editor/elements/TableComponent.tsx
import React from "react";
import { Table } from "@/domain";
import { SeatComponent } from "./SeatComponent";
import { useSeatMapStore } from "@/store";
import { useViewport, useElementInteraction } from "@/hooks";
import { strings } from "@/lib";

interface TableComponentProps {
  table: Table;
}

const TableComponentBase: React.FC<TableComponentProps> = ({ table }) => {
  const { isSelected, onMouseDown } = useElementInteraction(table.id);
  const selectedIds = useSeatMapStore((state) => state.selectedIds);
  const selectElement = useSeatMapStore((state) => state.selectElement);

  return (
    <g
      transform={`translate(${table.position.x}, ${table.position.y}) rotate(${table.rotation})`}
      onMouseDown={onMouseDown}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectElement(table.id, e.ctrlKey || e.metaKey);
        }
      }}
      tabIndex={0}
      focusable="true"
      className="group cursor-move outline-none"
      role="group"
      aria-label={`${strings.elements.tableLabel} ${table.label}, ${table.shape} shape, ${table.seats.length} seats`}
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
          onClick={(isMulti) => selectElement(seat.id, isMulti)}
        />
      ))}
    </g>
  );
};

export const TableComponent = React.memo(TableComponentBase);
TableComponent.displayName = "TableComponent";
