import { ArrowLeft } from "lucide-react";

export default function Header({
  analysisResult,
  setAnalysisResult,
  setSelectedResume,
  setUploadedFile,
  setFileName,
}) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          Resume ATS Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Audit resume quality, formatting, structures, and missing sections
          completely independent of any Job Description.
        </p>
      </div>
      {analysisResult && (
        <button
          onClick={() => {
            setAnalysisResult(null);
            setSelectedResume(null);
            setUploadedFile(null);
            setFileName("");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer bg-card"
        >
          <ArrowLeft size={14} /> Analyze Another
        </button>
      )}
    </div>
  );
}
