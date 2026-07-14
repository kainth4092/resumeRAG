import { Sparkles, UploadCloud, FileText, ArrowLeft, Eye, Printer, Download } from "lucide-react";

export default function AIResumeSuiteShimmer({ mode = "analysis" }) {
  if (mode === "generator") {
    // Matches TailoredResult.jsx layout, padding, and spacing exactly.
    // Sits inside max-w-7xl mx-auto p-6 of the parent page.
    return (
      <div className="space-y-6 text-left animate-in fade-in duration-300">
        {/* Top action bar - matches TailoredResult.jsx action bar */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted shimmer rounded w-48 animate-pulse" />
            <div className="h-3 bg-muted/60 shimmer rounded w-72 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-8 bg-muted/60 shimmer rounded-xl w-16 animate-pulse" />
            <div className="h-8 bg-muted/60 shimmer rounded-xl w-16 animate-pulse" />
            <div className="h-8 bg-muted/60 shimmer rounded-xl w-16 animate-pulse" />
            <div className="h-8 bg-muted/80 shimmer rounded-xl w-28 animate-pulse" />
          </div>
        </div>

        {/* Live Preview Container - matches TailoredResult.jsx preview container */}
        <div className="bg-muted/10 border border-border rounded-2xl p-5 overflow-y-auto max-h-[680px]">
          <div className="max-w-[620px] mx-auto shadow-md rounded-lg overflow-hidden bg-card border border-border p-10 space-y-6">
            {/* Centered Header Shimmer */}
            <div className="text-center space-y-2 pb-4 border-b border-border/40">
              <div className="h-6 bg-muted shimmer rounded w-48 mx-auto animate-pulse" />
              <div className="h-3 bg-muted shimmer rounded w-32 mx-auto animate-pulse" />
              <div className="h-2.5 bg-muted shimmer rounded w-80 mx-auto animate-pulse" />
              <div className="h-2.5 bg-muted shimmer rounded w-96 mx-auto animate-pulse" />
            </div>

            {/* PROFILE Section Shimmer */}
            <div className="space-y-2">
              <div className="h-3.5 bg-muted shimmer rounded w-20 animate-pulse" />
              <div className="border-b border-border w-full" />
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 bg-muted shimmer rounded w-full animate-pulse" />
                <div className="h-2.5 bg-muted shimmer rounded w-[96%] animate-pulse" />
                <div className="h-2.5 bg-muted shimmer rounded w-[98%] animate-pulse" />
                <div className="h-2.5 bg-muted shimmer rounded w-[92%] animate-pulse" />
              </div>
            </div>

            {/* CORE TECHNICAL SKILLS Section Shimmer */}
            <div className="space-y-2">
              <div className="h-3.5 bg-muted shimmer rounded w-36 animate-pulse" />
              <div className="border-b border-border w-full" />
              <div className="flex flex-wrap gap-2 pt-1.5">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-6 bg-muted/60 shimmer rounded-lg w-16 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* PROFESSIONAL EXPERIENCE Section Shimmer */}
            <div className="space-y-3">
              <div className="h-3.5 bg-muted shimmer rounded w-48 animate-pulse" />
              <div className="border-b border-border w-full" />

              {/* Job 1 */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-baseline">
                  <div className="h-3.5 bg-muted shimmer rounded w-44 animate-pulse" />
                  <div className="h-2.5 bg-muted shimmer rounded w-24 animate-pulse" />
                </div>
                <div className="h-3 bg-muted shimmer rounded w-32 animate-pulse" />
                <div className="space-y-1.5 pl-4 pt-0.5">
                  <div className="h-2.5 bg-muted shimmer rounded w-full animate-pulse" />
                  <div className="h-2.5 bg-muted shimmer rounded w-[94%] animate-pulse" />
                  <div className="h-2.5 bg-muted shimmer rounded w-[97%] animate-pulse" />
                </div>
              </div>

              {/* Job 2 */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-baseline">
                  <div className="h-3.5 bg-muted shimmer rounded w-40 animate-pulse" />
                  <div className="h-2.5 bg-muted shimmer rounded w-24 animate-pulse" />
                </div>
                <div className="h-3 bg-muted shimmer rounded w-28 animate-pulse" />
                <div className="space-y-1.5 pl-4 pt-0.5">
                  <div className="h-2.5 bg-muted shimmer rounded w-full animate-pulse" />
                  <div className="h-2.5 bg-muted shimmer rounded w-[96%] animate-pulse" />
                </div>
              </div>
            </div>

            {/* EDUCATION Section Shimmer */}
            <div className="space-y-2.5">
              <div className="h-3.5 bg-muted shimmer rounded w-24 animate-pulse" />
              <div className="border-b border-border w-full" />
              <div className="flex justify-between items-baseline pt-1">
                <div className="h-3 bg-muted shimmer rounded w-64 animate-pulse" />
                <div className="h-2.5 bg-muted shimmer rounded w-16 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom return button */}
        <div className="flex justify-start">
          <div className="h-8 bg-card border border-border rounded-xl w-44 shimmer animate-pulse" />
        </div>
      </div>
    );
  }

  // default mode: "analysis"
  // Matches AIWorkspace.jsx (AI Resume Suite dashboard initial view) exactly.
  return (
    <div className="h-full overflow-y-auto bg-background text-left font-sans animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section - Matches AIWorkspace.jsx header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="text-primary" size={20} />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground">
                AI Resume Suite
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-xl">
                Upload your resume to audit general ATS compatibility, optimize
                sections with standalone AI tools, or tailor contents to a
                specific job description.
              </p>
            </div>
          </div>
        </div>

        {/* Selector Section - Matches ResumeSelector.jsx wrapper */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left side: Upload Box Shimmer */}
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center flex flex-col items-center justify-center bg-muted/20">
                <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center mb-3">
                  <UploadCloud size={20} className="text-primary/40" />
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  Upload your resume
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                  Drag and drop, or <span className="text-primary/60 font-bold">browse</span>
                </p>
                <p className="text-[9px] text-muted-foreground/80 mt-0.5">
                  PDF or DOCX (max. 5MB)
                </p>
              </div>

              {/* Right side: Selector & Profile Actions */}
              <div className="flex flex-col justify-between gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Select a saved resume
                  </label>
                  {/* Mock Dropdown box */}
                  <div className="h-10 bg-muted/50 border border-border rounded-xl w-full shimmer animate-pulse" />
                </div>

                {/* Or divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Or
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                {/* Import Profile button */}
                <div className="w-full h-10 bg-primary/5 border border-primary/20 rounded-xl shimmer animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
