"use client";

import { useState, useEffect, RefObject } from "react";

interface Size {
  width: number;
  height: number;
}

/**
 * Hook to track the size of a DOM element using ResizeObserver.
 * Useful for making SVG viewboxes responsive to their container.
 */
export const useResizeObserver = (
  elementRef: RefObject<HTMLElement | null>,
): Size => {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Initial size
    setSize({
      width: element.clientWidth,
      height: element.clientHeight,
    });

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;

      const entry = entries[0];
      const { width, height } = entry.contentRect;

      setSize({
        width: Math.floor(width),
        height: Math.floor(height),
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef]);

  return size;
};
