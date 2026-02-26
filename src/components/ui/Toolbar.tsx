// src/components/ui/Toolbar.tsx
"use client";

import React from "react";
import { useSeatMapStore } from "@/store";
import { LayoutGrid, Circle, Square, MousePointer2 } from "lucide-react";
import { clsx } from "clsx";

export const Toolbar: React.FC = () => {
  const { activeTool, setActiveTool } = useSeatMapStore();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        Add Elements
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTool("addRow")}
          aria-label="Select tool to add a new row of seats"
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 gap-2 group active:scale-95",
            activeTool === "addRow"
              ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md",
          )}
          title="Add a new row of seats"
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
            Row
          </span>
        </button>

        <button
          onClick={() => setActiveTool("addTable")}
          aria-label="Select tool to add a new table"
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 gap-2 group active:scale-95",
            activeTool === "addTable"
              ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md",
          )}
          title="Add a new table"
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
            Table
          </span>
        </button>

        <button
          onClick={() => setActiveTool("addArea")}
          aria-label="Select tool to add a new area"
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 gap-2 group active:scale-95",
            activeTool === "addArea"
              ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md",
          )}
          title="Add a new area"
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
            Area
          </span>
        </button>

        <button
          onClick={() => setActiveTool("select")}
          aria-label="Select tool to select and move elements"
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 gap-2 group active:scale-95",
            activeTool === "select"
              ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50 hover:shadow-md",
          )}
          title="Selection tool"
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
            Select
          </span>
        </button>
      </div>
    </div>
  );
};
