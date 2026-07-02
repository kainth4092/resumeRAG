import { FileText, Sparkles } from "lucide-react";

export default function SelectedResumeCard({
  selectedResume,
  runATSAnalysis,
  uploadedFile,
}) {
  return (
    <>
      {selectedResume && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-foreground">
                Ready:{" "}
                {selectedResume.title ||
                  selectedResume.name ||
                  "Uploaded Resume"}
              </p>
              <p className="text-xs text-muted-foreground">
                Format:{" "}
                {uploadedFile
                  ? "New Upload"
                  : `Saved Resume (${selectedResume.version || "v1"})`}
              </p>
            </div>
          </div>
          <button
            onClick={runATSAnalysis}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20 cursor-pointer"
          >
            <Sparkles size={16} /> Run ATS Health Analysis
          </button>
        </div>
      )}
    </>
  );
}
