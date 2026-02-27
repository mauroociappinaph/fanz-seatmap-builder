"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 p-4">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
        <span className="text-white font-bold text-2xl italic">F</span>
      </div>
      <h2 className="text-3xl font-bold mb-2 text-slate-800">404</h2>
      <p className="text-slate-500 mb-8 max-w-md text-center font-medium">
        Ups! No pudimos encontrar la página que buscas en el mapa.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2"
      >
        Volver al Editor
      </Link>
    </div>
  );
}
