// src/components/editor/elements/SeatComponent.tsx
import React from "react";
import { Seat } from "@/domain/types";

interface SeatComponentProps {
  seat: Seat;
  isSelected: boolean;
  onClick?: () => void;
}

export const SeatComponent: React.FC<SeatComponentProps> = ({
  seat,
  isSelected,
  onClick,
}) => {
  const isAvailable = seat.status === "available";

  return (
    <g
      className="cursor-pointer transition-all duration-200"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <circle
        cx={seat.cx}
        cy={seat.cy}
        r={10}
        fill={isSelected ? "#3b82f6" : isAvailable ? "#e2e8f0" : "#cbd5e1"}
        stroke={isSelected ? "#2563eb" : "#94a3b8"}
        strokeWidth={isSelected ? 2 : 1}
        className="transition-colors duration-200 hover:stroke-blue-400"
      />
      {seat.label && (
        <text
          x={seat.cx}
          y={seat.cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={6}
          fontWeight="bold"
          fill={isSelected ? "white" : "#64748b"}
          className="pointer-events-none select-none"
        >
          {seat.label}
        </text>
      )}
    </g>
  );
};
