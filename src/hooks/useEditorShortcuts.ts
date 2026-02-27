// src/hooks/useEditorShortcuts.ts
import { useEffect, useState } from "react";
import { useSeatMapStore } from "@/store";

export const useEditorShortcuts = () => {
  const [isAltPressed, setIsAltPressed] = useState(false);
  const { selectedIds, removeElements, setActiveTool } = useSeatMapStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") setIsAltPressed(true);

      // Delete selected elements
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedIds.length > 0
      ) {
        // Prevent accidental deletion if focus is in an input
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        ) {
          return;
        }
        removeElements(selectedIds);
      }

      // Escape to select tool
      if (e.key === "Escape") {
        setActiveTool("select");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setIsAltPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedIds, removeElements, setActiveTool]);

  return { isAltPressed };
};
