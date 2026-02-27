// src/components/editor/elements/RowComponent.tsx
import React from "react";
import { Row } from "@/domain";
import { SeatComponent } from "./SeatComponent";
import { useSeatMapStore } from "@/store";
import { useElementInteraction } from "@/hooks";
import { strings } from "@/lib";

interface RowComponentProps {
  row: Row;
}

const RowComponentBase: React.FC<RowComponentProps> = ({ row }) => {
  const { isSelected, onMouseDown } = useElementInteraction(row.id);
  const selectElement = useSeatMapStore((state) => state.selectElement);
  const selectedIds = useSeatMapStore((state) => state.selectedIds);

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
      focusable="true"
      className="group cursor-move outline-none"
      role="group"
      aria-label={`${strings.elements.rowLabel} ${row.label}, ${row.seats.length} seats`}
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
        {strings.elements.rowLabel} {row.label}
      </text>
    </g>
  );
};

export const RowComponent = React.memo(RowComponentBase);
RowComponent.displayName = "RowComponent";
