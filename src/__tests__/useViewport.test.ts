// src/__tests__/useViewport.test.ts
import { renderHook, act } from "@testing-library/react";
import { useViewport } from "@/hooks/useViewport";
import { useSeatMapStore } from "@/store";
import React from "react";

describe("useViewport hook", () => {
  beforeEach(() => {
    useSeatMapStore.getState().newMap();
    // Mock RAF to be synchronous for tests
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useViewport());
    expect(result.current.viewport.zoom).toBe(1);
    expect(result.current.viewport.panX).toBe(0);
    expect(result.current.viewport.panY).toBe(0);
  });

  it("should update zoom on wheel event", () => {
    const { result } = renderHook(() => useViewport());

    act(() => {
      // Simulate wheel down (zoom out)
      const event = {
        deltaY: 100,
        preventDefault: jest.fn(),
      } as unknown as React.WheelEvent<SVGSVGElement>;
      result.current.handleWheel(event);
    });

    expect(result.current.viewport.zoom).toBeLessThan(1);
  });

  it("should update pan on mouse movement while panning", () => {
    const { result } = renderHook(() => useViewport());

    act(() => {
      // Start panning (middle mouse)
      result.current.handleMouseDown({
        button: 1,
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent<SVGSVGElement>);

      // Move mouse
      result.current.handleMouseMove({
        clientX: 150,
        clientY: 150,
      } as unknown as React.MouseEvent<SVGSVGElement>);
    });

    // dx = 50, dy = 50. panX should decrease by dx (moving viewport opposite to mouse)
    expect(result.current.viewport.panX).toBe(-50);
    expect(result.current.viewport.panY).toBe(-50);
  });

  it("should stop panning on mouse up", () => {
    const { result } = renderHook(() => useViewport());

    act(() => {
      result.current.handleMouseDown({
        button: 1,
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent<SVGSVGElement>);
      result.current.handleMouseUp();
      result.current.handleMouseMove({
        clientX: 150,
        clientY: 150,
      } as unknown as React.MouseEvent<SVGSVGElement>);
    });

    expect(result.current.viewport.panX).toBe(0);
  });
});
