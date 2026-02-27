// src/components/ui/Toolbar.tsx
"use client";

import React from "react";
import { useSeatMapStore } from "@/store";
import {
  LayoutGrid,
  Circle,
  Square,
  MousePointer2,
  LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";
import { strings } from "@/lib";

interface ToolButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    aria-label={`${strings.toolbar.select} ${label}`}
    className={clsx(
      "flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 gap-2 group active:scale-95",
      isActive
        ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20"
        : "border-slate-200 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md",
    )}
    title={`${strings.toolbar.addElements} ${label}`}
  >
    <div
      className={clsx(
        "p-2 rounded-md transition-colors duration-200",
        isActive ? "bg-blue-100" : "bg-slate-100 group-hover:bg-blue-100",
      )}
    >
      <Icon
        className={clsx(
          "w-4 h-4 transition-colors duration-200",
          isActive
            ? "text-blue-600"
            : "text-slate-400 group-hover:text-blue-600",
        )}
      />
    </div>
    <span
      className={clsx(
        "text-[10px] font-semibold transition-colors duration-200",
        isActive
          ? "text-blue-700"
          : "text-slate-600 group-hover:text-slate-900",
      )}
    >
      {label}
    </span>
  </button>
);

export const Toolbar: React.FC = () => {
  const { activeTool, setActiveTool, creationConfig, updateCreationConfig } =
    useSeatMapStore();

  const TOOLS = [
    {
      tool: "addRow" as const,
      icon: LayoutGrid,
      label: strings.toolbar.row,
    },
    {
      tool: "addTable" as const,
      icon: Circle,
      label: strings.toolbar.table,
    },
    {
      tool: "addArea" as const,
      icon: Square,
      label: strings.toolbar.area,
    },
    {
      tool: "select" as const,
      icon: MousePointer2,
      label: strings.toolbar.select,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {strings.toolbar.addElements}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {TOOLS.map((t) => (
          <ToolButton
            key={t.tool}
            icon={t.icon}
            label={t.label}
            isActive={activeTool === t.tool}
            onClick={() => setActiveTool(t.tool)}
          />
        ))}
      </div>

      {/* Dynamic Tool Config */}
      {(activeTool === "addRow" || activeTool === "addTable") && (
        <div className="mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-tight">
              {activeTool === "addRow"
                ? strings.toolbar.settings.row
                : strings.toolbar.settings.table}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-semibold text-slate-500 ml-1">
              {strings.toolbar.settings.initialSeats}
            </span>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={
                  activeTool === "addRow"
                    ? creationConfig.rowSeats
                    : creationConfig.tableSeats
                }
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  if (activeTool === "addRow") {
                    updateCreationConfig({ rowSeats: val });
                  } else {
                    updateCreationConfig({ tableSeats: val });
                  }
                }}
                className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
              />
            </div>
            <p className="text-[8px] text-blue-400 italic px-1">
              {strings.toolbar.settings.help}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
