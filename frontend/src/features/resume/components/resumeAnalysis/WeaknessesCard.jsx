import { AlertCircle } from "lucide-react";

export default function WeaknessCard({ analysisResult }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-foreground border-b border-border pb-2.5 flex items-center gap-2 ">
        <AlertCircle size={16} />
        Areas for Improvement
      </h3>
      <ul className="space-y-2.5">
        {analysisResult.weaknesses?.map((weak, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 text-xs text-foreground font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
            <span>{weak}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
