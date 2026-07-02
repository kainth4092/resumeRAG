import { TrendingUp } from "lucide-react";
import { getScoreUtils } from "../../utils/scoreUtils";

export default function ProgressScore({ analysisResult, getScoreFillColor }) {
  const scoreUtils = getScoreUtils(analysisResult);

  return (
    <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
      <h3 className="text-sm font-bold text-foreground border-b border-border pb-2.5 flex items-center gap-2">
        <TrendingUp size={16} className="text-primary" />
        Scorecard Breakdown
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {scoreUtils.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground flex items-center gap-2">
                  <Icon size={14} className="text-muted-foreground shrink-0" />
                  {item.label}
                </span>
                <span
                  className={`font-bold ${
                    item.score >= 80
                      ? "text-emerald-500"
                      : item.score >= 60
                        ? "text-amber-500"
                        : "text-red-500"
                  }`}
                >
                  {item.score}/100
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getScoreFillColor ? getScoreFillColor(item.score) : ""}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
