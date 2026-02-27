export default function Loading() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 animate-pulse">
      {/* Navbar Skeleton */}
      <div className="h-16 bg-white border-b border-slate-200" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar Skeleton */}
        <div className="w-64 bg-white border-r border-slate-200 p-6 space-y-6">
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Center Canvas Skeleton */}
        <div className="flex-1 bg-slate-100 flex items-center justify-center p-12">
          <div className="w-full h-full bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl" />
        </div>

        {/* Right Inspector Skeleton */}
        <div className="w-72 bg-white border-l border-slate-200 p-6 space-y-6">
          <div className="h-6 bg-slate-100 rounded w-2/3 mx-auto" />
          <div className="h-32 bg-slate-100 rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-10 bg-slate-100 rounded-lg" />
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-10 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
