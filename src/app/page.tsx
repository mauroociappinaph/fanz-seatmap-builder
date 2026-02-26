"use client";

// src/app/page.tsx
import { SvgEditor } from "@/components/editor";
import { Toolbar, Inspector } from "@/components/ui";
import { useSeatMapStore } from "@/store";
import { Toaster, toast } from "sonner";
import { useRef } from "react";
import { strings } from "@/lib/i18n/strings";

export default function Home() {
  const { selectedIds, removeElements, exportJSON, importJSON, newMap } =
    useSeatMapStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = () => {
    if (selectedIds.length === 0) return;

    // Capture current selection to avoid race conditions if selection changes while toast is visible
    const idsToDelete = [...selectedIds];

    toast.warning(
      strings.messages.deleteConfirm.replace(
        "{count}",
        idsToDelete.length.toString(),
      ),
      {
        description: strings.messages.deleteDesc,
        action: {
          label: strings.common.delete,
          onClick: () => {
            removeElements(idsToDelete);
            toast.success(strings.messages.deleteSuccess);
          },
        },
      },
    );
  };

  const handleExport = () => {
    const json = exportJSON();
    console.log(json);
    // Trigger download
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seatmap-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(strings.messages.exportSuccess);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 5MB (Bug B28)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(strings.messages.importLimitError);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        importJSON(json);
        toast.success(strings.messages.importSuccess);
      } catch (error) {
        console.error(error);
        toast.error(strings.messages.importError);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  const handleNewMap = () => {
    if (confirm(strings.messages.newMapConfirm)) {
      newMap();
      toast.success(strings.messages.newMapSuccess);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
      {/* SaaS Navbar */}
      <nav className="z-50 flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs italic">
                {strings.nav.title[0]}
              </span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-800">
              Fanz{" "}
              <span className="text-blue-600 font-semibold">
                {strings.nav.title}
              </span>
            </h1>
          </div>
          <div className="h-4 w-px bg-slate-300 mx-2" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            {strings.nav.editor}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNewMap}
            aria-label={strings.nav.newMap}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all duration-200 active:scale-95"
          >
            {strings.nav.newMap}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportClick}
              aria-label={strings.nav.import}
              className="px-4 py-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 text-xs font-semibold rounded shadow-sm hover:shadow transition-all duration-200 active:scale-95"
            >
              {strings.nav.import}
            </button>
            <button
              onClick={handleExport}
              aria-label={strings.nav.export}
              className="px-4 py-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 text-xs font-semibold rounded shadow-sm hover:shadow transition-all duration-200 active:scale-95"
            >
              {strings.nav.export}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Tools */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 gap-4 overflow-y-auto">
          <Toolbar />

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Actions
            </h3>
            <button
              onClick={handleDelete}
              disabled={selectedIds.length === 0}
              aria-label={strings.common.delete}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 hover:border-red-200 hover:shadow-sm disabled:opacity-40 disabled:grayscale disabled:pointer-events-none transition-all duration-200 active:scale-95 text-xs font-bold uppercase tracking-wider"
            >
              {strings.common.delete} Selected
            </button>
          </div>

          <div className="mt-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Atajos de teclado
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
              Ctrl+Click: Selección múltiple
              <br />
              Alt+Arrastrar: Mover cámara
            </p>
          </div>
        </aside>

        {/* Center Canvas */}
        <section className="flex-1 bg-slate-100 relative">
          <div className="absolute inset-0 bg-white">
            <SvgEditor />
          </div>
        </section>

        {/* Right Sidebar: Inspector */}
        <aside className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
          <Inspector />
        </aside>
      </div>

      <Toaster position="top-right" richColors />
    </main>
  );
}
