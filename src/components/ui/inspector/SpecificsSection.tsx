// src/components/ui/inspector/SpecificsSection.tsx
import React from "react";
import { Settings2 } from "lucide-react";
import { MapElement, Seat, Row, Table } from "@/domain";
import { strings } from "@/lib";
import { useSeatMapStore } from "@/store";

interface SpecificsSectionProps {
  element: MapElement | Seat;
  onUpdate: (updates: Partial<MapElement | Seat>) => void;
  localColor: string;
  setLocalColor: (color: string) => void;
}

export const SpecificsSection: React.FC<SpecificsSectionProps> = ({
  element,
  onUpdate,
  localColor,
  setLocalColor,
}) => {
  const updateSeatCount = useSeatMapStore((state) => state.updateSeatCount);

  // Helper to get localized type name
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
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Settings2 className="w-3 h-3" /> {strings.inspector.general}{" "}
        {getLocalizedType(element.type)}
      </label>

      {element.type === "row" && (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500 ml-1">
              {strings.inspector.capacity}
            </span>
            <input
              type="number"
              min="1"
              value={(element as Row).seats.length}
              onChange={(e) =>
                updateSeatCount(element.id, Number(e.target.value))
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
              value={(element as Row).seatSpacing}
              onChange={(e) =>
                onUpdate({ seatSpacing: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
            />
          </div>
        </>
      )}

      {element.type === "table" && (
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500 ml-1">
              {strings.inspector.capacity}
            </span>
            <input
              type="number"
              min="1"
              value={(element as Table).seats.length}
              onChange={(e) =>
                onUpdate({ capacity: Number(e.target.value) } as Partial<Table>)
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500 ml-1">
              {strings.inspector.shape}
            </span>
            <select
              value={(element as Table).shape}
              onChange={(e) =>
                onUpdate({ shape: e.target.value as "round" | "rectangular" })
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
                {(element as Table).shape === "round"
                  ? strings.inspector.diameter
                  : strings.inspector.width}
              </span>
              <input
                type="number"
                value={(element as Table).width}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
              />
            </div>
            {(element as Table).shape === "rectangular" && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500 ml-1">
                  {strings.inspector.height}
                </span>
                <input
                  type="number"
                  value={(element as Table).height}
                  onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {element.type === "area" && (
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

      {element.type === "seat" && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-slate-500 ml-1">
            {strings.inspector.status}
          </span>
          <select
            value={element.status}
            onChange={(e) =>
              onUpdate({ status: e.target.value as Seat["status"] })
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
  );
};
