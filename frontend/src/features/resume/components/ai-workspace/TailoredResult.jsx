import {
  CheckCircle2,
  Download,
  Edit2,
  Printer,
  ArrowLeft,
} from "lucide-react";
import LivePreview from "../resume/editor/LivePreview";
import { downloadPDF, downloadDOCX, printResume } from "../../exporters";

export default function TailoredResult({
  generatedResume,
  saveMessage,
  onBack,
  onNavigateEditor,
  activeTemplate = "Professional",
}) {
  const normalizeResumeForPreview = (r) => {
    if (!r) return null;
    return {
      personal_info: {
        name: r.personal_info?.name || "",
        title: r.headline || r.personal_info?.title || "",
        email: r.personal_info?.email || "",
        phone: r.personal_info?.phone || "",
        location: r.personal_info?.location || "",
        linkedin: r.personal_info?.linkedin || "",
        github: r.personal_info?.github || "",
        website: r.personal_info?.website || "",
      },
      headline: r.headline || "",
      summary: { text: r.summary || "" },
      skills: (r.skills || []).map((s, idx) =>
        typeof s === "string" ? { id: idx, name: s, level: 80 } : s,
      ),
      experience: (r.experience || []).map((exp, idx) => ({
        id: exp.id || idx,
        role: exp.role || "",
        company: exp.company || "",
        location: exp.location || "",
        startMonth: exp.startMonth || "01",
        startYear: exp.startYear || exp.start_year || "2021",
        endMonth: exp.endMonth || "12",
        endYear: exp.endYear || exp.end_year || "present",
        current: exp.current || exp.endYear === "present" || false,
        bullets: exp.bullets || exp.description || [""],
      })),
      education: (r.education || []).map((edu, idx) => ({
        id: edu.id || idx,
        degree: edu.degree || "",
        school: edu.school || edu.institution || "",
        location: edu.location || "",
        startYear: edu.startYear || edu.start_year || "2015",
        endYear: edu.endYear || edu.end_year || "2019",
        gpa: edu.gpa || "",
        honors: edu.honors || "",
      })),
      projects: (r.projects || []).map((proj, idx) => ({
        id: proj.id || idx,
        name: proj.name || proj.title || "",
        tech:
          proj.tech ||
          (Array.isArray(proj.technologies)
            ? proj.technologies.join(" · ")
            : proj.technologies || ""),
        url: proj.url || proj.github || proj.live || "",
        desc:
          proj.desc ||
          (Array.isArray(proj.description)
            ? proj.description.join("\n")
            : proj.description || ""),
      })),
    };
  };

  const previewData = normalizeResumeForPreview(generatedResume);

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
                generatedResume,
                `${generatedResume.personal_info?.name || "Optimized"}_Resume.pdf`,
              )
            }
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-[10px] font-bold text-foreground bg-card hover:bg-muted transition-all cursor-pointer"
          >
            <Download size={12} /> PDF
          </button>

          <button
            onClick={() =>
              downloadDOCX(
                generatedResume,
                `${generatedResume.personal_info?.name || "Optimized"}_Resume.docx`,
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
              personal={previewData.personal_info}
              summary={previewData.summary}
              skills={previewData.skills}
              experience={previewData.experience}
              education={previewData.education}
              projects={previewData.projects}
              color="#4F46E5"
              templateName={activeTemplate}
            />
          )}
        </div>
      </div>

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
