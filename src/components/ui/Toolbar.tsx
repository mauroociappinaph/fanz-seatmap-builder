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
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all gap-2 group",
            activeTool === "addRow"
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-blue-500 hover:bg-blue-50",
          )}
          title="Add a new row of seats"
        >
          <div
            className={clsx(
              "p-2 rounded transition-colors",
              activeTool === "addRow"
                ? "bg-blue-100"
                : "bg-slate-100 group-hover:bg-blue-100",
            )}
          >
            <LayoutGrid
              className={clsx(
                "w-4 h-4 transition-colors",
                activeTool === "addRow"
                  ? "text-blue-500"
                  : "text-slate-400 group-hover:text-blue-500",
              )}
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-600">Row</span>
        </button>

        <button
          onClick={() => setActiveTool("addTable")}
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all gap-2 group",
            activeTool === "addTable"
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-blue-500 hover:bg-blue-50",
          )}
          title="Add a new table"
        >
          <div
            className={clsx(
              "p-2 rounded transition-colors",
              activeTool === "addTable"
                ? "bg-blue-100"
                : "bg-slate-100 group-hover:bg-blue-100",
            )}
          >
            <Circle
              className={clsx(
                "w-4 h-4 transition-colors",
                activeTool === "addTable"
                  ? "text-blue-500"
                  : "text-slate-400 group-hover:text-blue-500",
              )}
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-600">
            Table
          </span>
        </button>

        <button
          onClick={() => setActiveTool("addArea")}
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all gap-2 group",
            activeTool === "addArea"
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-blue-500 hover:bg-blue-50",
          )}
          title="Add a new area"
        >
          <div
            className={clsx(
              "p-2 rounded transition-colors",
              activeTool === "addArea"
                ? "bg-blue-100"
                : "bg-slate-100 group-hover:bg-blue-100",
            )}
          >
            <Square
              className={clsx(
                "w-4 h-4 transition-colors",
                activeTool === "addArea"
                  ? "text-blue-500"
                  : "text-slate-400 group-hover:text-blue-500",
              )}
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-600">Area</span>
        </button>

        <button
          onClick={() => setActiveTool("select")}
          className={clsx(
            "flex flex-col items-center justify-center p-3 border rounded-lg transition-all gap-2 group",
            activeTool === "select"
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-blue-500 hover:bg-blue-50",
          )}
          title="Selection tool"
        >
          <div
            className={clsx(
              "p-2 rounded transition-colors",
              activeTool === "select"
                ? "bg-blue-100"
                : "bg-slate-100 group-hover:bg-blue-100",
            )}
          >
            <MousePointer2
              className={clsx(
                "w-4 h-4 transition-colors",
                activeTool === "select"
                  ? "text-blue-500"
                  : "text-slate-400 group-hover:text-blue-500",
              )}
            />
          </div>
          <span className="text-[10px] font-semibold text-slate-600">
            Select
          </span>
        </button>
      </div>
    </div>
  );
};
