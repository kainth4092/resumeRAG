import { Zap } from "lucide-react";

export function AuthLayout({ children, scrollable = false }) {
  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center px-4 py-12 relative ${
        scrollable
          ? "h-screen overflow-y-auto scroll-smooth"
          : "overflow-hidden"
      } bg-background transition-colors duration-200`}
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,70,229,0.1) 0%, var(--background) 60%)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Subtle decorative circles */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Auth card wrapper */}
      <div className="relative w-full max-w-[420px] z-10 flex flex-col my-auto">
        <div className="bg-card border border-border rounded-[24px] shadow-xl shadow-slate-900/5 dark:shadow-slate-950/40 p-8 transition-colors duration-200">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-[12px] bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              ResuPilot <span className="text-indigo-600">AI</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
