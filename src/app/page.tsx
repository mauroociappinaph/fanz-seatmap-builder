"use client";

// src/app/page.tsx
import { SvgEditor } from "@/components/editor";
import { Toolbar, Inspector } from "@/components/ui";
import { useSeatMapStore } from "@/store";
import { Toaster, toast } from "sonner";
import { useRef } from "react";

export default function Home() {
  const { selectedIds, removeElements, exportJSON, importJSON, newMap } =
    useSeatMapStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = () => {
    if (selectedIds.length === 0) return;

    // Capture current selection to avoid race conditions if selection changes while toast is visible
    const idsToDelete = [...selectedIds];

    toast.warning(`¿Eliminar ${idsToDelete.length} elementos?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: () => {
          removeElements(idsToDelete);
          toast.success("Elementos eliminados");
        },
      },
    });
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
    toast.success("Mapa exportado y descargado");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        importJSON(json);
        toast.success("Mapa importado correctamente");
      } catch (error) {
        console.error(error);
        toast.error("Error al importar el mapa: JSON inválido");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  const handleNewMap = () => {
    if (confirm("¿Estás seguro? Se perderán los cambios no guardados.")) {
      newMap();
      toast.success("Nuevo mapa creado");
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
              <span className="text-white font-bold text-xs italic">F</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-800">
              Fanz <span className="text-blue-600 font-semibold">SeatMap</span>
            </h1>
          </div>
          <div className="h-4 w-px bg-slate-300 mx-2" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            Editor
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNewMap}
            aria-label="Create a new empty seat map"
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all duration-200 active:scale-95"
          >
            New Map
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportClick}
              aria-label="Import seat map from JSON file"
              className="px-4 py-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 text-xs font-semibold rounded shadow-sm hover:shadow transition-all duration-200 active:scale-95"
            >
              Import JSON
            </button>
            <button
              onClick={handleExport}
              aria-label="Export seat map to JSON file"
              className="px-4 py-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 text-xs font-semibold rounded shadow-sm hover:shadow transition-all duration-200 active:scale-95"
            >
              Export JSON
            </button>
            <button
              aria-label="Publish current seat map"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
            >
              Publish
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
              aria-label={`Delete ${selectedIds.length} selected elements`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 hover:border-red-200 hover:shadow-sm disabled:opacity-40 disabled:grayscale disabled:pointer-events-none transition-all duration-200 active:scale-95 text-xs font-bold uppercase tracking-wider"
            >
              Delete Selected
            </button>
          </div>

          <div className="mt-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Editor Help
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
              Click elements to select. <br />
              Drag with middle mouse to move camera.
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
