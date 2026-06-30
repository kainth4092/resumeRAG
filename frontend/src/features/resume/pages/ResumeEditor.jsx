import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  Download,
  Edit2,
  CheckCircle2,
  Loader2,
  Printer,
  FileText,
} from "lucide-react";

import PersonalEditor from "../components/resume/editor/PersonalEditor";
import SummaryEditor from "../components/resume/editor/SummaryEditor";
import ExperienceEditor from "../components/resume/editor/ExperienceEditor";
import EducationEditor from "../components/resume/editor/EducationEditor";
import SkillsEditor from "../components/resume/editor/SkillsEditor";
import ProjectsEditor from "../components/resume/editor/ProjectsEditor";
import LivePreview from "../components/resume/editor/LivePreview";
import { downloadPDF, downloadDOCX, printResume } from "../exporters";
import { useResumeEditor } from "../hooks/useResumeEditor";

export default function ResumeEditor() {
  const {
    navigate,
    resumeName,
    saving,
    saved,
    activeTab,
    setActiveTab,
    activeTemplate,
    setActiveTemplate,
    personal,
    setPersonal,
    summary,
    setSummary,
    skills,
    setSkills,
    experience,
    setExperience,
    education,
    setEducation,
    projects,
    setProjects,
    handleSave,
  } = useResumeEditor();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card/80 backdrop-blur-xl">
        <button
          onClick={() => navigate("/resumes")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          My Resumes
        </button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-semibold text-foreground truncate max-w-xs">
          {resumeName}
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={activeTemplate}
            onChange={(e) => setActiveTemplate(e.target.value)}
            className="h-9 px-2.5 rounded-xl border border-border text-xs bg-card font-semibold cursor-pointer"
          >
            {["Professional", "ATS", "Minimal", "Corporate"].map((name) => (
              <option key={name} value={name}>
                {name} Template
              </option>
            ))}
          </select>

          <div className="flex items-center bg-muted/50 border border-border rounded-xl p-1 gap-0.5">
            {["edit", "preview"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${activeTab === t
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t === "preview" ? (
                  <>
                    <Eye size={11} className="inline mr-1" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit2 size={11} className="inline mr-1" />
                    Edit
                  </>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-70 cursor-pointer ${saved
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20"
              }`}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saved ? (
              <CheckCircle2 size={14} />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>

          <button
            onClick={() => printResume()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Print Resume"
          >
            <Printer size={14} />
          </button>

          <button
            onClick={() => downloadPDF({
              personal_info: personal,
              headline: personal.title,
              summary: summary.text,
              skills,
              experience,
              education,
              projects,
            }, `${resumeName}.pdf`)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Download PDF"
          >
            <Download size={14} />
          </button>

          <button
            onClick={() => downloadDOCX({
              personal_info: personal,
              headline: personal.title,
              summary: summary.text,
              skills,
              experience,
              education,
              projects,
            }, `${resumeName}.docx`, activeTemplate)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Download DOCX"
          >
            <FileText size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {activeTab === "edit" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 lg:max-w-2xl lg:border-r lg:border-border">
            <PersonalEditor personal={personal} onChange={setPersonal} />
            <SummaryEditor summary={summary} onChange={setSummary} />
            <SkillsEditor skills={skills} onChange={setSkills} />
            <ProjectsEditor projects={projects} onChange={setProjects} />
            <EducationEditor education={education} onChange={setEducation} />
          </div>
        )}

        <div
          className={`${activeTab === "edit" ? "hidden lg:flex" : "flex"
            } flex-1 flex-col overflow-hidden bg-gray-100 dark:bg-gray-900`}
        >
          <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-card/80 backdrop-blur-sm border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Live Preview
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                Live
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 printable-area">
            <div className="max-w-[640px] mx-auto shadow-(--shadow-lg) rounded-xl overflow-hidden border border-black/10">
              <LivePreview
                personal={personal}
                summary={summary}
                skills={skills}
                experience={experience}
                education={education}
                projects={projects}
                templateName={activeTemplate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
