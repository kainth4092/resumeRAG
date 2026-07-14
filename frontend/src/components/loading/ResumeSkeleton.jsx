import { FileText, Sparkles, Plus, ArrowLeft, Eye, Edit2, Download, Printer, UploadCloud } from "lucide-react";

export default function ResumeSkeleton({ mode = "list" }) {
  if (mode === "analysis") {
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
                    <div className="h-10 bg-muted/50 border border-border rounded-xl w-full shimmer" />
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
                  <div className="w-full h-10 bg-primary/5 border border-primary/20 rounded-xl shimmer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "generator") {
    // Matches TailoredResult.jsx layout, padding, and spacing exactly.
    // Sits inside max-w-7xl mx-auto p-6 of the parent page.
    return (
      <div className="space-y-6 text-left animate-in fade-in duration-300">
        {/* Top action bar - matches TailoredResult.jsx action bar */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted shimmer rounded w-48" />
            <div className="h-3 bg-muted/60 shimmer rounded w-72" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-8 bg-muted/60 shimmer rounded-xl w-16" />
            <div className="h-8 bg-muted/60 shimmer rounded-xl w-16" />
            <div className="h-8 bg-muted/60 shimmer rounded-xl w-16" />
            <div className="h-8 bg-muted/80 shimmer rounded-xl w-28" />
          </div>
        </div>

        {/* Live Preview Container - matches TailoredResult.jsx preview container */}
        <div className="bg-muted/10 border border-border rounded-2xl p-5 overflow-y-auto max-h-[680px]">
          <div className="max-w-[620px] mx-auto shadow-md rounded-lg overflow-hidden bg-card border border-border p-10 space-y-6">
            {/* Centered Header Shimmer */}
            <div className="text-center space-y-2 pb-4 border-b border-border/40">
              <div className="h-6 bg-muted shimmer rounded w-48 mx-auto" />
              <div className="h-3 bg-muted shimmer rounded w-32 mx-auto" />
              <div className="h-2.5 bg-muted shimmer rounded w-80 mx-auto" />
              <div className="h-2.5 bg-muted shimmer rounded w-96 mx-auto" />
            </div>

            {/* PROFILE Section Shimmer */}
            <div className="space-y-2">
              <div className="h-3.5 bg-muted shimmer rounded w-20" />
              <div className="border-b border-border w-full" />
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 bg-muted shimmer rounded w-full" />
                <div className="h-2.5 bg-muted shimmer rounded w-[96%]" />
                <div className="h-2.5 bg-muted shimmer rounded w-[98%]" />
                <div className="h-2.5 bg-muted shimmer rounded w-[92%]" />
              </div>
            </div>

            {/* CORE TECHNICAL SKILLS Section Shimmer */}
            <div className="space-y-2">
              <div className="h-3.5 bg-muted shimmer rounded w-36" />
              <div className="border-b border-border w-full" />
              <div className="flex flex-wrap gap-2 pt-1.5">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-6 bg-muted/60 shimmer rounded-lg w-16"
                  />
                ))}
              </div>
            </div>

            {/* PROFESSIONAL EXPERIENCE Section Shimmer */}
            <div className="space-y-3">
              <div className="h-3.5 bg-muted shimmer rounded w-48" />
              <div className="border-b border-border w-full" />

              {/* Job 1 */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-baseline">
                  <div className="h-3.5 bg-muted shimmer rounded w-44" />
                  <div className="h-2.5 bg-muted shimmer rounded w-24" />
                </div>
                <div className="h-3 bg-muted shimmer rounded w-32" />
                <div className="space-y-1.5 pl-4 pt-0.5">
                  <div className="h-2.5 bg-muted shimmer rounded w-full" />
                  <div className="h-2.5 bg-muted shimmer rounded w-[94%]" />
                  <div className="h-2.5 bg-muted shimmer rounded w-[97%]" />
                </div>
              </div>

              {/* Job 2 */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-baseline">
                  <div className="h-3.5 bg-muted shimmer rounded w-40" />
                  <div className="h-2.5 bg-muted shimmer rounded w-24" />
                </div>
                <div className="h-3 bg-muted shimmer rounded w-28" />
                <div className="space-y-1.5 pl-4 pt-0.5">
                  <div className="h-2.5 bg-muted shimmer rounded w-full" />
                  <div className="h-2.5 bg-muted shimmer rounded w-[96%]" />
                </div>
              </div>
            </div>

            {/* EDUCATION Section Shimmer */}
            <div className="space-y-2.5">
              <div className="h-3.5 bg-muted shimmer rounded w-24" />
              <div className="border-b border-border w-full" />
              <div className="flex justify-between items-baseline pt-1">
                <div className="h-3 bg-muted shimmer rounded w-64" />
                <div className="h-2.5 bg-muted shimmer rounded w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom return button */}
        <div className="flex justify-start">
          <div className="h-8 bg-card border border-border rounded-xl w-44 shimmer" />
        </div>
      </div>
    );
  }

  if (mode === "builder") {
    // Matches ResumeEditor.jsx wrapper layout, padding, and spacing exactly.
    // Occupies the entire main page height.
    return (
      <div className="h-full flex flex-col bg-background overflow-hidden animate-in fade-in duration-300">
        {/* Top Header Bar - matches ResumeEditor.jsx header */}
        <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card/80 backdrop-blur-xl relative z-20">
          <button className="flex items-center gap-2 text-sm text-muted-foreground/60 transition-colors group cursor-default">
            <ArrowLeft size={15} />
            My Resumes
          </button>
          <span className="text-muted-foreground/40">/</span>
          <div className="h-4 bg-muted shimmer rounded w-32" />

          <div className="flex items-center gap-2 ml-auto">
            {/* Template dropdown select */}
            <div className="h-9 bg-card border border-border rounded-xl w-40 shimmer" />

            {/* Active tab edit/preview switcher */}
            <div className="flex items-center bg-muted/50 border border-border rounded-xl p-1 gap-0.5">
              <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-card text-foreground shadow-xs flex items-center gap-1 cursor-default">
                Edit
              </button>
              <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground/50 flex items-center gap-1 cursor-default">
                <Eye size={11} /> Preview
              </button>
            </div>

            {/* Actions button list */}
            <button className="flex items-center justify-center w-9 h-9 border border-border rounded-xl bg-card text-muted-foreground/50 cursor-default">
              <Printer size={14} />
            </button>
            <button className="flex items-center justify-center w-9 h-9 border border-border rounded-xl bg-card text-muted-foreground/50 cursor-default">
              <Download size={14} />
            </button>
            <button className="flex items-center justify-center w-9 h-9 border border-border rounded-xl bg-card text-muted-foreground/50 cursor-default">
              <Download size={14} />
            </button>
            <button className="flex items-center gap-1.5 h-9 px-4 bg-primary/20 text-primary rounded-xl text-xs font-semibold cursor-default">
              Save
            </button>
          </div>
        </div>

        {/* Main split layout - matches ResumeEditor.jsx split panel */}
        <div className="flex-1 overflow-hidden flex">
          {/* Editor Form Panel (Left) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 lg:max-w-2xl lg:border-r lg:border-border">
            {/* Personal Info Form Shimmer */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="h-5 bg-muted shimmer rounded w-36" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="h-3 bg-muted shimmer rounded w-16" />
                  <div className="h-9 bg-muted/60 shimmer rounded-xl w-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-muted shimmer rounded w-16" />
                  <div className="h-9 bg-muted/60 shimmer rounded-xl w-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-muted shimmer rounded w-24" />
                  <div className="h-9 bg-muted/60 shimmer rounded-xl w-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-muted shimmer rounded w-24" />
                  <div className="h-9 bg-muted/60 shimmer rounded-xl w-full" />
                </div>
              </div>
            </div>

            {/* Summary Form Shimmer */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="h-5 bg-muted shimmer rounded w-28" />
              <div className="h-20 bg-muted/60 shimmer rounded-xl w-full" />
            </div>

            {/* Skills Form Shimmer */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="h-5 bg-muted shimmer rounded w-24" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-7 bg-muted/60 shimmer rounded-lg w-20"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Panel (Right) - matches ResumeEditor.jsx preview block */}
          <div className="hidden lg:flex flex-1 flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
            <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-card/80 backdrop-blur-sm border-b border-border">
              <div className="h-4 bg-muted shimmer rounded w-12" />
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex justify-center">
              <div className="w-full max-w-[640px] bg-white dark:bg-slate-900 border border-black/10 shadow-(--shadow-lg) rounded-xl p-10 space-y-6 self-start">
                {/* Header info */}
                <div className="text-center space-y-2 pb-4 border-b border-border/40">
                  <div className="h-6 bg-muted shimmer rounded w-48 mx-auto" />
                  <div className="h-3 bg-muted shimmer rounded w-32 mx-auto" />
                  <div className="h-2.5 bg-muted shimmer rounded w-80 mx-auto" />
                  <div className="h-2.5 bg-muted shimmer rounded w-96 mx-auto" />
                </div>

                {/* Profile Section */}
                <div className="space-y-2">
                  <div className="h-3.5 bg-muted shimmer rounded w-20" />
                  <div className="border-b border-border w-full" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2.5 bg-muted shimmer rounded w-full" />
                    <div className="h-2.5 bg-muted shimmer rounded w-[96%]" />
                    <div className="h-2.5 bg-muted shimmer rounded w-[98%]" />
                  </div>
                </div>

                {/* Technical Skills */}
                <div className="space-y-2">
                  <div className="h-3.5 bg-muted shimmer rounded w-36" />
                  <div className="border-b border-border w-full" />
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="h-6 bg-muted/60 shimmer rounded-lg w-16"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resume list mode (MyResumes page) - matches MyResumes.jsx layout exactly
  return (
    <div className="h-full overflow-y-auto font-sans bg-background text-left animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm shrink-0">
              <FileText className="text-primary" size={20} />
            </div>
            <div className="text-left space-y-1.5">
              <h1 className="text-xl font-bold text-foreground">My Resumes</h1>
              <div className="h-3.5 bg-muted shimmer rounded w-64" />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary/20 text-primary rounded-xl text-sm font-semibold shrink-0 cursor-default">
            <Plus size={15} /> New Resume
          </button>
        </div>

        {/* Stats Cards Skeleton - matches StatsCards.jsx */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center justify-between shadow-xs"
            >
              <span className="text-xs text-muted-foreground">{i === 0 ? "Total" : "Active"}</span>
              <div className="h-4 bg-muted shimmer rounded w-6" />
            </div>
          ))}
        </div>

        {/* Search and Filters Skeleton - matches SearchFilter.jsx */}
        <div className="flex items-center gap-5 flex-wrap">
          <div className="relative flex-1 min-w-40 max-w-lg">
            <div className="w-full h-12 bg-input-background border border-border rounded-xl shimmer" />
          </div>
          <div className="h-12 bg-card border border-border rounded-xl w-24 shimmer" />
          <div className="h-12 bg-card border border-border rounded-xl w-50 shimmer" />
        </div>

        {/* Resume Table Skeleton - matches ResumeTable.jsx */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Resume", "Headline", "Status", "Updated", "Actions"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`py-3.5 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ${
                          i === 4
                            ? "text-right px-5"
                            : i === 0
                              ? "text-left px-5"
                              : "text-left px-4"
                        }`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    {/* Resume Column */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-muted shimmer shrink-0" />
                        <div className="w-8 h-8 rounded-xl bg-muted/60 shimmer shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-4 bg-muted shimmer rounded w-48" />
                          <div className="h-3 bg-muted/50 shimmer rounded w-16" />
                        </div>
                      </div>
                    </td>

                    {/* Headline Column */}
                    <td className="px-4 py-4">
                      <div className="h-4 bg-muted shimmer rounded w-44" />
                    </td>

                    {/* Status Column */}
                    <td className="px-4 py-4">
                      <div className="h-6 bg-muted/70 shimmer rounded-full w-16" />
                    </td>

                    {/* Updated Column */}
                    <td className="px-4 py-4">
                      <div className="h-4 bg-muted shimmer rounded w-28" />
                    </td>

                    {/* Actions Column */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-4 h-4 rounded bg-muted shimmer" />
                        <div className="w-4 h-4 rounded bg-muted shimmer" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
