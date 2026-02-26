// src/components/ui/inspector/BulkLabelingSection.tsx
import React from "react";
import { Hash } from "lucide-react";
import { useSeatMapStore } from "@/store";
import { strings } from "@/lib/i18n/strings";

export const BulkLabelingSection: React.FC = () => {
  const applyBulkLabels = useSeatMapStore((state) => state.applyBulkLabels);

  return (
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
                applyBulkLabels(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById(
                "bulk-label-pattern",
              ) as HTMLInputElement;
              if (input) {
                applyBulkLabels(input.value);
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
  );
};
