// src/components/ui/Inspector.tsx
"use client";

import React from "react";
import { useSeatMapStore } from "@/store";
import { MapElement, Row, Table, Area, Position, Seat } from "@/domain/types";
import { Type, Move, RotateCw, Settings2, Trash2, Hash } from "lucide-react";

import { strings } from "@/lib/i18n/strings";

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
  }, [elementId, elementType, elementColor]);

  // Debounced update for color
  React.useEffect(() => {
    if (elementType !== "area" || !localColor || !elementId) return;
    if (localColor === elementColor) return;

    const timer = setTimeout(() => {
      updateElement(elementId, { color: localColor } as Partial<Area>);
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [localColor, elementId, elementType, elementColor, updateElement]);

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
        {/* Section: Bulk Labeling (Visible when 1+ elements selected) */}
        <div className="space-y-4 pb-4 border-b border-slate-100">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Hash className="w-3 h-3" /> {strings.inspector.bulkLabeling}
          </label>
          <div className="flex flex-col gap-2">
            <p className="text-[9px] text-slate-400 font-medium leading-tight">
              {strings.inspector.bulkLabelingDesc}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. A{1..10}"
                id="bulk-label-pattern"
                maxLength={100}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const input = e.currentTarget;
                    useSeatMapStore.getState().applyBulkLabels(input.value);
                    input.value = "";
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById(
                    "bulk-label-pattern",
                  ) as HTMLInputElement;
                  if (input) {
                    useSeatMapStore.getState().applyBulkLabels(input.value);
                    input.value = "";
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                {strings.inspector.apply}
              </button>
            </div>
          </div>
        </div>

        {/* Section: General */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Type className="w-3 h-3" /> {strings.inspector.general}
          </label>
          <div className="grid gap-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-slate-500 ml-1">
                {strings.inspector.label}
              </span>
              <input
                type="text"
                value={selectedElement.label}
                maxLength={selectedElement.type === "seat" ? 10 : 50}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Section: Layout */}
        {"position" in selectedElement && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Move className="w-3 h-3" /> {strings.inspector.layout}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500 ml-1">
                  {strings.inspector.position} X
                </span>
                <input
                  type="number"
                  value={selectedElement.position.x}
                  onChange={(e) => handleMove("x", Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500 ml-1">
                  {strings.inspector.position} Y
                </span>
                <input
                  type="number"
                  value={selectedElement.position.y}
                  onChange={(e) => handleMove("y", Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            {"rotation" in selectedElement && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500 ml-1 flex items-center gap-2">
                  <RotateCw className="w-3 h-3" /> {strings.inspector.rotation}
                </span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={selectedElement.rotation}
                  onChange={(e) =>
                    handleUpdate({ rotation: Number(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                />
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-[9px] text-slate-400">0°</span>
                  <span className="text-[9px] font-bold text-blue-600">
                    {selectedElement.rotation}°
                  </span>
                  <span className="text-[9px] text-slate-400">360°</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section: Type Specific */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Settings2 className="w-3 h-3" />{" "}
            {getLocalizedType(selectedElement.type)}
          </label>

          {selectedElement.type === "row" && (
            <>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500 ml-1">
                  {strings.inspector.capacity}
                </span>
                <input
                  type="number"
                  min="1"
                  value={(selectedElement as Row).seats.length}
                  onChange={(e) =>
                    useSeatMapStore
                      .getState()
                      .updateSeatCount(
                        selectedElement.id,
                        Number(e.target.value),
                      )
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500 ml-1">
                  {strings.inspector.spacing}
                </span>
                <input
                  type="number"
                  value={(selectedElement as Row).seatSpacing}
                  onChange={(e) =>
                    handleUpdate({ seatSpacing: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                />
              </div>
            </>
          )}

          {selectedElement.type === "table" && (
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500 ml-1">
                  {strings.inspector.capacity}
                </span>
                <input
                  type="number"
                  min="1"
                  value={(selectedElement as Table).seats.length}
                  onChange={(e) =>
                    handleUpdate({
                      capacity: Number(e.target.value),
                    } as Partial<Table>)
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500 ml-1">
                  {strings.inspector.shape}
                </span>
                <select
                  value={(selectedElement as Table).shape}
                  onChange={(e) =>
                    handleUpdate({
                      shape: e.target.value as "round" | "rectangular",
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                >
                  <option value="round">
                    {strings.inspector.shapeOptions.round}
                  </option>
                  <option value="rectangular">
                    {strings.inspector.shapeOptions.rectangular}
                  </option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 ml-1">
                    {(selectedElement as Table).shape === "round"
                      ? strings.inspector.diameter
                      : strings.inspector.width}
                  </span>
                  <input
                    type="number"
                    value={(selectedElement as Table).width}
                    onChange={(e) =>
                      handleUpdate({ width: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                {(selectedElement as Table).shape === "rectangular" && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 ml-1">
                      {strings.inspector.height}
                    </span>
                    <input
                      type="number"
                      value={(selectedElement as Table).height}
                      onChange={(e) =>
                        handleUpdate({ height: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedElement.type === "area" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-slate-500 ml-1">
                {strings.inspector.fillColor}
              </span>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={localColor || "#3b82f6"}
                  onChange={(e) => setLocalColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0 overflow-hidden"
                />
                <input
                  type="text"
                  value={localColor || "rgba(59, 130, 246, 0.2)"}
                  onChange={(e) => setLocalColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                />
              </div>
            </div>
          )}

          {selectedElement.type === "seat" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-slate-500 ml-1">
                {strings.inspector.status}
              </span>
              <select
                value={selectedElement.status}
                onChange={(e) =>
                  handleUpdate({
                    status: e.target.value as Seat["status"],
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
              >
                <option value="available">
                  {strings.inspector.statusOptions.available}
                </option>
                <option value="selected">
                  {strings.inspector.statusOptions.selected}
                </option>
                <option value="blocked">
                  {strings.inspector.statusOptions.blocked}
                </option>
                <option value="occupied">
                  {strings.inspector.statusOptions.occupied}
                </option>
              </select>
            </div>
          )}
        </div>
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
