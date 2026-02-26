import { useCallback, useRef } from "react";
import { useSeatMapStore } from "@/store";

export const useViewport = () => {
  const seatMap = useSeatMapStore((state) => state.seatMap);
  const updateViewport = useSeatMapStore((state) => state.updateViewport);

  // Safety fallback if viewport is missing (e.g. during hydration or bad import)
  const viewport = seatMap?.viewport || { zoom: 1, panX: 0, panY: 0 };

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

  const screenToSVG = useCallback(
    (clientX: number, clientY: number, svgElement: SVGSVGElement) => {
      const CTM = svgElement.getScreenCTM();
      if (!CTM) return { x: 0, y: 0 };

      // clientX/Y are screen relative. getScreenCTM gives us the matrix
      // to go from SVG space to screen space. We invert it to go the other way.
      const inverseCTM = CTM.inverse();
      const pt = svgElement.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;

      const svgPt = pt.matrixTransform(inverseCTM);
      return { x: svgPt.x, y: svgPt.y };
    },
    [],
  );

  return {
    viewport,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    screenToSVG,
  };
};
