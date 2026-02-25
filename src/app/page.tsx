// src/app/page.tsx
import { SvgEditor } from "@/components/editor";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden">
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
          <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-all">
            Draft Map
          </button>
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-sm transition-all">
              Save as JSON
            </button>
            <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-sm transition-all">
              Publish
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Tools */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 gap-4 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Add Elements
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 group">
                <div className="p-2 bg-slate-100 rounded group-hover:bg-blue-100">
                  <div className="w-4 h-4 bg-slate-400 group-hover:bg-blue-500 rounded-sm" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">
                  Row
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 group">
                <div className="p-2 bg-slate-100 rounded group-hover:bg-blue-100">
                  <div className="w-4 h-4 rounded-full bg-slate-400 group-hover:bg-blue-500" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">
                  Table
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 group">
                <div className="p-2 bg-slate-100 rounded group-hover:bg-blue-100">
                  <div className="w-4 h-4 border-2 border-slate-400 group-hover:border-blue-500 rounded-sm" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">
                  Area
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 group">
                <div className="p-2 bg-slate-100 rounded group-hover:bg-blue-100">
                  <div className="w-4 h-4 bg-slate-400 group-hover:bg-blue-500 rounded-[2px] opacity-40 shrink-0" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">
                  Shapes
                </span>
              </button>
            </div>
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
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
              Properties
            </h3>
          </div>
          <div className="p-6 flex flex-col items-center justify-center text-center gap-4 mt-20">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
              No element selected
            </p>
          </div>
        </aside>
      </div>

      <Toaster position="top-right" richColors />
    </main>
  );
}
