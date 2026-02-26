// src/components/ui/Toolbar.tsx
"use client";

import React from "react";
import { useSeatMapStore } from "@/store";
import { LayoutGrid, Circle, Square, MousePointer2 } from "lucide-react";
import { clsx } from "clsx";
import { strings } from "@/lib/i18n/strings";

export const Toolbar: React.FC = () => {
  const { activeTool, setActiveTool, creationConfig, updateCreationConfig } =
    useSeatMapStore();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {strings.toolbar.addElements}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTool("addRow")}
          aria-label={`${strings.toolbar.select} ${strings.toolbar.row}`}
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 gap-2 group active:scale-95",
            activeTool === "addRow"
              ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md",
          )}
          title={`${strings.toolbar.addElements} ${strings.toolbar.row}`}
        >
          <div
            className={clsx(
              "p-2 rounded-md transition-colors duration-200",
              activeTool === "addRow"
                ? "bg-blue-100"
                : "bg-slate-100 group-hover:bg-blue-100",
            )}
          >
            <LayoutGrid
              className={clsx(
                "w-4 h-4 transition-colors duration-200",
                activeTool === "addRow"
                  ? "text-blue-600"
                  : "text-slate-400 group-hover:text-blue-600",
              )}
            />
          </div>
          <span
            className={clsx(
              "text-[10px] font-semibold transition-colors duration-200",
              activeTool === "addRow"
                ? "text-blue-700"
                : "text-slate-600 group-hover:text-slate-900",
            )}
          >
            {strings.toolbar.row}
          </span>
        </button>

        <button
          onClick={() => setActiveTool("addTable")}
          aria-label={`${strings.toolbar.select} ${strings.toolbar.table}`}
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 gap-2 group active:scale-95",
            activeTool === "addTable"
              ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md",
          )}
          title={`${strings.toolbar.addElements} ${strings.toolbar.table}`}
        >
          <div
            className={clsx(
              "p-2 rounded-md transition-colors duration-200",
              activeTool === "addTable"
                ? "bg-blue-100"
                : "bg-slate-100 group-hover:bg-blue-100",
            )}
          >
            <Circle
              className={clsx(
                "w-4 h-4 transition-colors duration-200",
                activeTool === "addTable"
                  ? "text-blue-600"
                  : "text-slate-400 group-hover:text-blue-600",
              )}
            />
          </div>
          <span
            className={clsx(
              "text-[10px] font-semibold transition-colors duration-200",
              activeTool === "addTable"
                ? "text-blue-700"
                : "text-slate-600 group-hover:text-slate-900",
            )}
          >
            {strings.toolbar.table}
          </span>
        </button>

        <button
          onClick={() => setActiveTool("addArea")}
          aria-label={`${strings.toolbar.select} ${strings.toolbar.area}`}
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 gap-2 group active:scale-95",
            activeTool === "addArea"
              ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md",
          )}
          title={`${strings.toolbar.addElements} ${strings.toolbar.area}`}
        >
          <div
            className={clsx(
              "p-2 rounded-md transition-colors duration-200",
              activeTool === "addArea"
                ? "bg-blue-100"
                : "bg-slate-100 group-hover:bg-blue-100",
            )}
          >
            <Square
              className={clsx(
                "w-4 h-4 transition-colors duration-200",
                activeTool === "addArea"
                  ? "text-blue-600"
                  : "text-slate-400 group-hover:text-blue-600",
              )}
            />
          </div>
          <span
            className={clsx(
              "text-[10px] font-semibold transition-colors duration-200",
              activeTool === "addArea"
                ? "text-blue-700"
                : "text-slate-600 group-hover:text-slate-900",
            )}
          >
            {strings.toolbar.area}
          </span>
        </button>

        <button
          onClick={() => setActiveTool("select")}
          aria-label={strings.toolbar.select}
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 gap-2 group active:scale-95",
            activeTool === "select"
              ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md",
          )}
          title={strings.toolbar.select}
        >
          <div
            className={clsx(
              "p-2 rounded-md transition-colors duration-200",
              activeTool === "select"
                ? "bg-blue-100"
                : "bg-slate-100 group-hover:bg-blue-100",
            )}
          >
            <MousePointer2
              className={clsx(
                "w-4 h-4 transition-colors duration-200",
                activeTool === "select"
                  ? "text-blue-600"
                  : "text-slate-400 group-hover:text-blue-600",
              )}
            />
          </div>
          <span
            className={clsx(
              "text-[10px] font-semibold transition-colors duration-200",
              activeTool === "select"
                ? "text-blue-700"
                : "text-slate-600 group-hover:text-slate-900",
            )}
          >
            {strings.toolbar.select}
          </span>
        </button>
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
