import {
  CheckCircle2,
  Download,
  Edit2,
  Printer,
  ArrowLeft,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import LivePreview from "../resume/editor/LivePreview";
import { downloadPDF, downloadDOCX, printResume } from "../../exporters";
import { fromApi } from "../../model/resumeModel";

export default function TailoredResult({
  generatedResume,
  saveMessage,
  onBack,
  onNavigateEditor,
  activeTemplate = "Professional",
}) {
  const previewData = fromApi(generatedResume);

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Top action bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Optimized Resume Preview
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Your ATS-optimized resume has been generated and auto-saved.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {saveMessage && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
              <CheckCircle2 size={11} /> {saveMessage}
            </span>
          )}

          <button
            onClick={() => printResume()}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-[10px] font-bold text-foreground bg-card hover:bg-muted transition-all cursor-pointer"
          >
            <Printer size={12} /> Print
          </button>

          <button
            onClick={() =>
              downloadPDF(
                previewData,
                `${previewData?.personal?.name || "Optimized"}_Resume.pdf`,
                activeTemplate,
              )
            }
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-[10px] font-bold text-foreground bg-card hover:bg-muted transition-all cursor-pointer"
          >
            <Download size={12} /> PDF
          </button>

          <button
            onClick={() =>
              downloadDOCX(
                previewData,
                `${previewData?.personal?.name || "Optimized"}_Resume.docx`,
                activeTemplate,
              )
            }
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-[10px] font-bold text-foreground bg-card hover:bg-muted transition-all cursor-pointer"
          >
            <Download size={12} /> DOCX
          </button>

          <button
            onClick={onNavigateEditor}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-[10px] font-bold active:scale-[0.98] transition-all cursor-pointer"
          >
            <Edit2 size={11} /> Edit in Builder
          </button>
        </div>
      </div>

      {/* Live Preview Container */}
      <div className="bg-muted/10 border border-border rounded-2xl p-5 overflow-y-auto max-h-[680px]">
        <div className="max-w-[620px] mx-auto shadow-md rounded-lg overflow-hidden bg-card border border-border">
          {previewData && (
            <LivePreview
              personal={previewData.personal}
              summary={{ text: previewData.summary }}
              skills={previewData.skillsList}
              experience={previewData.experience}
              education={previewData.education}
              projects={previewData.projects}
              color="#4F46E5"
              templateName={activeTemplate}
            />
          )}
        </div>
      </div>

      {/* Skill Gaps Identified (Outside Resume Document) */}
      {previewData?.skill_gaps && previewData.skill_gaps.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
            <Sparkles size={14} />
            <span>Target Skill Gaps Identified</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            These target skills from the job description are not currently evidenced in your source resume. They are not fabricated into your resume:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {previewData.skill_gaps.map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] border border-amber-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Roadmap Projects (Outside Resume Document) */}
      {previewData?.suggested_projects && previewData.suggested_projects.length > 0 && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
            <Lightbulb size={14} />
            <span>Suggested Portfolio Projects for Roadmap</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Recommended projects to build evidence for this role. These are roadmap suggestions and are never placed onto your resume:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {previewData.suggested_projects.map((proj, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-xl p-3 space-y-1.5"
              >
                <div className="font-semibold text-foreground text-xs">
                  {proj.title}
                </div>
                {proj.description && (
                  <p className="text-[11px] text-muted-foreground">
                    {proj.description}
                  </p>
                )}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies.map((t, ti) => (
                      <span
                        key={ti}
                        className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-foreground font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom return button */}
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors py-2 px-3 border border-border rounded-xl bg-card cursor-pointer"
        >
          <ArrowLeft size={12} /> Adjust Job Description or Resume
        </button>
      </div>
    </div>
  );
}

