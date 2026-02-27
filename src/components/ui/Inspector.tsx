"use client";

import React from "react";
import { useSeatMapStore } from "@/store";
import { MapElement, Area, Position, Seat } from "@/domain";
import { Hash, Settings2, Trash2 } from "lucide-react";
import { strings } from "@/lib";

import {
  GeneralSection,
  LayoutSection,
  SpecificsSection,
  BulkLabelingSection,
} from "./inspector/index";

export const Inspector: React.FC = () => {
  const { seatMap, selectedIds, updateElement, moveElement, removeElements } =
    useSeatMapStore();

  // Helper to find element or seat by ID
  const findElementById = (id: string): MapElement | Seat | null => {
    if (!seatMap?.elements) return null;

    // Check root elements
    const rootEl = seatMap.elements.find((el) => el.id === id);
    if (rootEl) return rootEl;

    // Check nested seats in rows and tables
    for (const el of seatMap.elements) {
      if ((el.type === "row" || el.type === "table") && el.seats) {
        const seat = el.seats.find((s) => s.id === id);
        if (seat) return seat;
      }
    }
    return null;
  };

  const selectedElement = findElementById(selectedIds[0]);

  const [localColor, setLocalColor] = React.useState<string>("");

  // Use stable dependencies for hooks
  const elementId = selectedElement?.id;
  const elementType = selectedElement?.type;
  const elementColor =
    selectedElement && selectedElement.type === "area"
      ? selectedElement.color
      : undefined;

  // Sync local color when selection changes
  React.useEffect(() => {
    if (elementType === "area") {
      setLocalColor(elementColor || "#3b82f6");
    }
  }, [elementId, elementType, elementColor, selectedElement]);

  // Debounced update for color
  React.useEffect(() => {
    if (elementType !== "area" || !localColor || !elementId) return;
    if (localColor === elementColor) return;

    const timer = setTimeout(() => {
      updateElement(elementId, { color: localColor } as Partial<Area>);
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [
    localColor,
    elementId,
    elementType,
    elementColor,
    selectedElement,
    updateElement,
  ]);

  if (!selectedElement) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center gap-4 mt-20">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 border border-slate-100">
          <Settings2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {strings.inspector.noSelection}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 max-w-[150px]">
            {strings.inspector.noSelectionDesc}
          </p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<MapElement | Seat>) => {
    updateElement(selectedElement.id, updates as Partial<MapElement>);
  };

  const handleMove = (field: "x" | "y", value: number) => {
    if (!("position" in selectedElement)) return;
    const newPos: Position = {
      ...selectedElement.position,
      [field]: value,
    };
    moveElement(selectedElement.id, newPos);
  };

  // Get localized type name
  const getLocalizedType = (type: string) => {
    switch (type) {
      case "row":
        return strings.elements.rowLabel;
      case "table":
        return strings.elements.tableLabel;
      case "area":
        return strings.elements.areaLabel;
      case "seat":
        return strings.elements.seatLabel;
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
            <Hash className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
            {getLocalizedType(selectedElement.type)}{" "}
            {selectedElement.type === "seat"
              ? `(${strings.inspector.label}: ${selectedElement.label})`
              : ""}
          </span>
        </div>
        <button
          onClick={() => removeElements([selectedElement.id])}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title={strings.common.delete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <BulkLabelingSection />

        <GeneralSection element={selectedElement} onUpdate={handleUpdate} />

        <LayoutSection
          element={selectedElement}
          onUpdate={handleUpdate}
          onMove={handleMove}
        />

        <SpecificsSection
          element={selectedElement}
          onUpdate={handleUpdate}
          localColor={localColor}
          setLocalColor={setLocalColor}
        />
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-100">
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-widest px-1">
          <span>
            {seatMap.elements.length}{" "}
            {seatMap.elements.length === 1 ? "elemento" : "elementos"}
          </span>
          <span className="text-blue-500">Auto-guardado activo</span>
        </div>
      </div>
    </div>
  );
};
