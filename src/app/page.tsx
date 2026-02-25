import { SvgEditor } from "@/components/editor";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-12 bg-[#0f172a] text-slate-200">
      <div className="z-10 w-full max-w-6xl items-center justify-between font-mono text-sm lg:flex mb-12">
        <h1 className="text-3xl font-bold text-white tracking-tighter">
          Fanz <span className="text-blue-500">SeatMap</span> Builder
        </h1>
        <div className="flex gap-4 items-center opacity-70">
          <span className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
            v0.1.0-alpha
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-6xl h-[75vh] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
        <SvgEditor />
      </div>

      <div className="w-full max-w-6xl mt-8 flex justify-between items-center text-slate-500">
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700 shadow-sm">
              Middel Mouse
            </kbd>
            <span>Pan</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700 shadow-sm">
              Alt + Click
            </kbd>
            <span>Pan</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700 shadow-sm">
              Scroll
            </kbd>
            <span>Zoom</span>
          </div>
        </div>
        <p className="text-xs uppercase tracking-widest font-bold opacity-30">
          SVG Native Graphics Engine
        </p>
      </div>

      <Toaster position="top-right" richColors theme="dark" />
    </main>
  );
}
