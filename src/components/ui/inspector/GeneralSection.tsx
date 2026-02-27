// src/components/ui/inspector/GeneralSection.tsx
import React from "react";
import { Type } from "lucide-react";
import { MapElement, Seat, MAX_LABEL_LENGTHS } from "@/domain";
import { strings } from "@/lib";

interface GeneralSectionProps {
  element: MapElement | Seat;
  onUpdate: (updates: Partial<MapElement | Seat>) => void;
}

export const GeneralSection: React.FC<GeneralSectionProps> = ({
  element,
  onUpdate,
}) => {
  return (
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
            value={element.label}
            maxLength={
              element.type === "seat"
                ? MAX_LABEL_LENGTHS.seat
                : MAX_LABEL_LENGTHS.row
            }
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
          />
        </div>
      </div>
    </div>
  );
};
