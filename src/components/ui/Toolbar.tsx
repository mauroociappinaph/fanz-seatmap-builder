// src/components/ui/Toolbar.tsx
"use client";

import React from "react";
import { useSeatMapStore } from "@/store";
import { LayoutGrid, Circle, Square, MousePointer2 } from "lucide-react";

export const Toolbar: React.FC = () => {
  const { addRow, addTable, addArea } = useSeatMapStore();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        Add Elements
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={addRow}
          className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 group"
          title="Add a new row of seats"
        >
          <div className="p-2 bg-slate-100 rounded group-hover:bg-blue-100 transition-colors">
            <LayoutGrid className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <span className="text-[10px] font-semibold text-slate-600">Row</span>
        </button>

        <button
          onClick={addTable}
          className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 group"
          title="Add a new table"
        >
          <div className="p-2 bg-slate-100 rounded group-hover:bg-blue-100 transition-colors">
            <Circle className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <span className="text-[10px] font-semibold text-slate-600">
            Table
          </span>
        </button>

        <button
          onClick={addArea}
          className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 group"
          title="Add a new area"
        >
          <div className="p-2 bg-slate-100 rounded group-hover:bg-blue-100 transition-colors">
            <Square className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <span className="text-[10px] font-semibold text-slate-600">Area</span>
        </button>

        <button
          className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg opacity-50 cursor-not-allowed gap-2"
          disabled
        >
          <div className="p-2 bg-slate-100 rounded">
            <MousePointer2 className="w-4 h-4 text-slate-300" />
          </div>
          <span className="text-[10px] font-semibold text-slate-400">
            Select
          </span>
        </button>
      </div>
    </div>
  );
};
