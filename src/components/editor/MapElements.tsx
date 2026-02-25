// src/components/editor/MapElements.tsx
import React from "react";
import { useSeatMapStore } from "@/store";
// Próximamente importaremos componentes individuales de SVG aquí

export const MapElements: React.FC = () => {
  const { seatMap } = useSeatMapStore();

  return (
    <g id="map-elements">
      {seatMap.elements.map((el) => {
        // Por ahora, renderizamos placeholders o círculos para verificar el motor
        if (el.type === "row") {
          return (
            <g
              key={el.id}
              transform={`translate(${el.position.x}, ${el.position.y}) rotate(${el.rotation})`}
            >
              {el.seats.map((seat) => (
                <circle
                  key={seat.id}
                  cx={seat.cx}
                  cy={seat.cy}
                  r={10}
                  fill={seat.status === "available" ? "#4ade80" : "#94a3b8"}
                />
              ))}
              <text x={0} y={-10} fontSize={12} fill="#64748b">
                {el.label}
              </text>
            </g>
          );
        }
        return null;
      })}
    </g>
  );
};
