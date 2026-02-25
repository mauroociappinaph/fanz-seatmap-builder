// src/components/editor/MapElements.tsx
import React from "react";
import { useSeatMapStore } from "@/store";
import { RowComponent, TableComponent, AreaComponent } from "./elements";

export const MapElements: React.FC = () => {
  const { seatMap } = useSeatMapStore();

  return (
    <g id="map-elements">
      {seatMap.elements.map((el) => {
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
