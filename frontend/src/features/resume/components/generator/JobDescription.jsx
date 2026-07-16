import { AlertCircle, CheckCircle2, Loader2, Zap } from "lucide-react";

const MIN_JD_CHARS = 50;
const MIN_JD_WORDS = 10;

export default function JobDescription({
  jd,
  setJd,
  uploaded,
  handleAnalyze,
  analyzing,
}) {
  const cleanedJd = jd.trim().replace(/\s+/g, " ");
  const wordCount = cleanedJd
    ? cleanedJd.split(/\s+/).filter(Boolean).length
    : 0;

  const charCount = cleanedJd.length;

  const isEmpty = charCount === 0;
  const isTooShort =
    !isEmpty && (charCount < MIN_JD_CHARS || wordCount < MIN_JD_WORDS);

  const isValid =
    uploaded && charCount >= MIN_JD_CHARS && wordCount >= MIN_JD_WORDS;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-foreground mb-4">Job Description</h3>
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        disabled={analyzing}
        placeholder="Paste the full job description here — include requirements, responsibilities, and company info for the best match..."
        className={`w-full min-h-44 rounded-xl border bg-card p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none font-medium transition-colors ${
          isTooShort
            ? "border-destructive focus:border-destructive"
            : "border-border focus:border-primary"
        }`}
      />

      <div className="mt-2 flex items-start justify-between gap-4">
        <div className="min-h-5">
          {isTooShort && (
            <p className="tetx-xs text-destructive flex items-center gap-1.5">
              <AlertCircle size={12} />
              Add more details about the role, responsibilities, or required
              skills.
            </p>
          )}
          {isValid && (
            <p className="text-xs text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 size={12} />
              Job description is ready for analysis.
            </p>
          )}
        </div>
        <p
          className={`text-[11px] shrink-0 ${
            isTooShort ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {wordCount}/{MIN_JD_WORDS} words · {charCount}/{MIN_JD_CHARS}{" "}
          characters
        </p>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!isValid || analyzing}
        className="mt-4 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {analyzing ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Analyzing...
          </>
        ) : (
          <>
            <Zap size={14} /> Analyze Resume
          </>
        )}
      </button>
    </div>
  );
}
