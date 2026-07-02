import { CheckCircle2 } from "lucide-react";

export default function StrengthsCard({ analysisResult }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-foreground border-b border-border pb-2.5 flex items-center gap-2 ">
        <CheckCircle2 size={16} />
        Strengths
      </h3>
      <ul className="space-y-2.5">
        {analysisResult.strengths?.map((str, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 text-xs text-foreground font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
            <span>{str}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
