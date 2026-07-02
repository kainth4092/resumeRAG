import { Sparkles } from "lucide-react";

export default function Analyzing({ analyzing, analysisStep }) {
  return (
    <>
      {analyzing && (
        <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-xs max-w-2xl mx-auto animate-pulse">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="absolute text-primary" size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-md font-bold text-foreground">
              Analyzing Resume Health Score
            </h3>
            <p className="text-sm text-primary font-semibold">{analysisStep}</p>
          </div>
          <div className="w-full max-w-xs bg-muted h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full animate-loading-bar" />
          </div>
        </div>
      )}
    </>
  );
}
