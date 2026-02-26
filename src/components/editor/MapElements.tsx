// src/components/editor/MapElements.tsx
import React from "react";
import { useSeatMapStore } from "@/store";
import { RowComponent, TableComponent, AreaComponent } from "./elements";

export const MapElements: React.FC = () => {
  const seatMap = useSeatMapStore((state) => state.seatMap);
  const elements = seatMap?.elements || [];

  // Sort elements to ensure correct Z-indexing in SVG
  // Areas should be at the bottom (rendered first)
  const sortedElements = [...elements].sort((a, b) => {
    const order = { area: 0, row: 1, table: 2 };
    return (order[a.type] || 0) - (order[b.type] || 0);
  });

  return (
    <g id="map-elements">
      {sortedElements.map((el) => {
        switch (el.type) {
          case "row":
            return <RowComponent key={el.id} row={el} />;
          case "table":
            return <TableComponent key={el.id} table={el} />;
          case "area":
            return <AreaComponent key={el.id} area={el} />;
          default:
            return null;
        }
      })}
    </g>
  );
};
