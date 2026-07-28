import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function MissingSectionsCard({ analysisResult }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground border-b border-border pb-2.5 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          Missing Sections Detector
        </h3>

        {analysisResult.missing_sections?.length === 0 ? (
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={24} />
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              All Sections Present!
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Excellent completeness across analyzed categories.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {analysisResult.missing_sections?.map((sect, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold"
              >
                <AlertTriangle size={12} />
                {sect}
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
          ATS scanners search for specific headers. Adding missing sections
          boosts parsed scores by up to 25%.
        </p>
      </div>
    </div>
  );
}
