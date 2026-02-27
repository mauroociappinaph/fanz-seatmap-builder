// src/hooks/useElementInteraction.ts
import React from "react";
import { useSeatMapStore } from "@/store";
import { useViewport } from "./useViewport";

export const useElementInteraction = (elementId: string) => {
  const isSelected = useSeatMapStore((state) =>
    state.selectedIds.includes(elementId),
  );
  const selectElement = useSeatMapStore((state) => state.selectElement);
  const startDragging = useSeatMapStore((state) => state.startDragging);
  const setActiveTool = useSeatMapStore((state) => state.setActiveTool);

  const { screenToSVG } = useViewport();

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const svg = (e.currentTarget as SVGElement).ownerSVGElement;
    if (svg) {
      const pos = screenToSVG(e.clientX, e.clientY, svg);
      const isMulti = e.ctrlKey || e.metaKey;

      if (isMulti || !isSelected) {
        selectElement(elementId, isMulti);
      }

      startDragging(elementId, pos);
      setActiveTool("select");
    }
  };

  return {
    isSelected,
    onMouseDown,
  };
};
