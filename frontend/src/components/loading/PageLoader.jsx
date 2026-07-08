export default function PageLoader() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden"
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Decorative background glow circles */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-500/5 dark:bg-teal-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center space-y-6 z-10">
        {/* Pulsing premium logo icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 w-16 h-16 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-2xl blur-xl animate-pulse" />
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-indigo-600 to-teal-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-extrabold text-xl tracking-tight">
            RP
          </div>
        </div>

        {/* Shimmering brand and text */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            ResuPilot AI
          </h2>
          <div className="flex items-center gap-1.5 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
