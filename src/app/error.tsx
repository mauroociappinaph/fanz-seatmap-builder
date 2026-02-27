"use client";

import React, { useEffect } from "react";
import { strings } from "@/lib";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Runtime error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] h-full w-full p-6 text-center animate-in fade-in duration-500">
      <div className="bg-red-50 p-8 rounded-2xl border border-red-100 max-w-md shadow-sm">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {strings.common.error || "Algo salió mal"}
        </h2>
        <p className="text-slate-500 mb-8 max-w-sm">
          {error.message || strings.messages.genericError}
          <br />
          <span className="text-[10px] mt-2 block opacity-50">
            Tip: If the editor failed to load, try refreshing your browser or
            clearing local storage if the map data is corrupted.
          </span>
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => reset()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
          >
            {strings.common.redo || "Reintentar"}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-semibold transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    </div>
  );
}
