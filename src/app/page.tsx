import { SvgEditor } from "@/components/editor";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#020617] text-slate-200">
      {/* Premium Navbar */}
      <nav className="z-50 flex items-center justify-between px-8 py-4 glass-dark border-b border-slate-800/50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xs italic">F</span>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Fanz <span className="text-blue-500 font-medium">SeatMap</span>{" "}
            <span className="text-slate-500 font-light">Builder</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              v0.1.0-alpha
            </span>
          </div>
          <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg border border-slate-700 transition-all">
            Docs
          </button>
          <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-lg shadow-blue-600/20 transition-all">
            Export JSON
          </button>
        </div>
      </nav>

      {/* Hero / Stage Area */}
      <div className="flex-1 flex flex-col p-6 lg:p-10 gap-6">
        <div className="relative w-full flex-1 rounded-3xl overflow-hidden border border-slate-800/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] bg-slate-900">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-indigo-500/5 blur-[100px] pointer-events-none" />

          <SvgEditor />
        </div>

        {/* Footer / Info Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 tracking-tight">
          <div className="flex items-center gap-8 text-[11px] font-medium text-slate-500 uppercase tracking-[0.15em]">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-5 h-5 rounded border border-slate-800 bg-slate-900/50">
                M
              </span>
              <span>Middle Mouse to Pan</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900/50">
                ALT
              </span>
              <span>+ Click to Pan</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-5 h-5 rounded border border-slate-800 bg-slate-900/50">
                S
              </span>
              <span>Scroll to Zoom</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span>Precision: SVG v1.1</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            <span>Mode: Advanced Layout</span>
          </div>
        </div>
      </div>

      <Toaster position="top-right" richColors theme="dark" />
    </main>
  );
}
