// src/components/ui/inspector/LayoutSection.tsx
import React from "react";
import { Move, RotateCw } from "lucide-react";
import { MapElement, Seat } from "@/domain/types";
import { strings } from "@/lib/i18n/strings";

interface LayoutSectionProps {
  element: MapElement | Seat;
  onUpdate: (updates: Partial<MapElement | Seat>) => void;
  onMove: (field: "x" | "y", value: number) => void;
}

export const LayoutSection: React.FC<LayoutSectionProps> = ({
  element,
  onUpdate,
  onMove,
}) => {
  if (!("position" in element)) return null;

  return (
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
            value={element.position.x}
            onChange={(e) => onMove("x", Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-slate-500 ml-1">
            {strings.inspector.position} Y
          </span>
          <input
            type="number"
            value={element.position.y}
            onChange={(e) => onMove("y", Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
          />
        </div>
      </div>

      {"rotation" in element && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-slate-500 ml-1 flex items-center gap-2">
            <RotateCw className="w-3 h-3" /> {strings.inspector.rotation}
          </span>
          <input
            type="range"
            min="0"
            max="360"
            value={element.rotation}
            onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
          />
          <div className="flex justify-between mt-1 px-1">
            <span className="text-[9px] text-slate-400">0°</span>
            <span className="text-[9px] font-bold text-blue-600">
              {element.rotation}°
            </span>
            <span className="text-[9px] text-slate-400">360°</span>
          </div>
        </div>
      )}
    </div>
  );
};
