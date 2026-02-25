import { useCallback, useRef } from "react";
import { useSeatMapStore } from "@/store";

export const useViewport = () => {
  const { viewport } = useSeatMapStore((state) => state.seatMap);
  const updateViewport = useSeatMapStore((state) => state.updateViewport);

  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.001;
      const minZoom = 0.1;
      const maxZoom = 5;

      const newZoom = Math.min(
        maxZoom,
        Math.max(minZoom, viewport.zoom - e.deltaY * zoomSpeed),
      );
      updateViewport({ zoom: newZoom });
    },
    [viewport.zoom, updateViewport],
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanning.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning.current) return;

      const dx = (e.clientX - lastMousePos.current.x) / viewport.zoom;
      const dy = (e.clientY - lastMousePos.current.y) / viewport.zoom;

      updateViewport({
        panX: viewport.panX - dx,
        panY: viewport.panY - dy,
      });

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    },
    [viewport.zoom, viewport.panX, viewport.panY, updateViewport],
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  return {
    viewport,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
