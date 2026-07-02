import Header from "../components/generator/Header";
import ResumeUpload from "../components/generator/ResumeUpload";
import JobDescription from "../components/generator/JobDescription";
import KeywordAnalysis from "../components/generator/KeywordAnalysis";
import HeatMap from "../components/generator/HeatMap";
import ATSScore from "../components/generator/ATSScore";
import AISuggestions from "../components/generator/AISuggestions";
import LivePreview from "../components/resume/editor/LivePreview";
import TemplateSelector from "../components/generator/TemplateSelector";
import { downloadPDF, downloadDOCX, printResume } from "../exporters";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Edit2,
  Printer,
  ArrowLeft,
  Zap,
  X,
} from "lucide-react";
import { TEMPLATE_REGISTRY } from "../components/resume/templates";
import { useResumeGenerator } from "../hooks/useResumeGenerator";
import Select from "../components/resume/dashboard/Select";
import TemplateThumbnail from "../components/resume/templates/TemplateThumbnail";
import { MOCK_RESUME } from "./templatesData";

export function ResumeGenerator({ onBack }) {
  const {
    navigate,
    resume,
    uploaded,
    setUploaded,
    uploading,
    uploadProgress,
    dragging,
    setDragging,
    fileName,
    fileSize,
    jd,
    setJd,
    analysis,
    setAnalysis,
    analyzing,
    generating,
    generated,
    setGenerated,
    generatedResume,
    generatorError,
    setGeneratorError,
    selectedTemplateName,
    setSelectedTemplateName,
    activeTemplate,
    hoveredTemplate,
    setHoveredTemplate,
    mobilePreviewTemplate,
    setMobilePreviewTemplate,
    interviewState,
    interviewSessionId,
    currentInterviewStep,
    saveMessage,
    handleUpload,
    handleDrop,
    handleAnalyze,
    handleGenerate,
    handleSwitchTemplate,
  } = useResumeGenerator();

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

  const canGenerate = uploaded && !!jd && !!selectedTemplateName;

  let currentStepIdx = 0;
  if (generated) {
    currentStepIdx = 4;
  } else if (generating) {
    currentStepIdx = 3;
  } else if (selectedTemplateName && uploaded && jd) {
    currentStepIdx = 3;
  } else if (analysis) {
    currentStepIdx = 2;
  } else if (uploaded && jd) {
    currentStepIdx = 1;
  } else if (uploaded) {
    currentStepIdx = 1;
  } else {
    currentStepIdx = 0;
  }

  const stepperSteps = [
    { number: 1, label: "Upload Resume" },
    { number: 2, label: "Analyze Resume" },
    { number: 3, label: "Select Template" },
    { number: 4, label: "Generate Resume" },
    { number: 5, label: "Preview Resume" },
  ];

  const templateSelectOpts = Object.keys(TEMPLATE_REGISTRY).map((name) => ({
    value: name,
    label: name,
  }));

  return (
    <div className="h-full overflow-y-auto bg-background font-sans text-left">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Header onBack={onBack} />

        {/* Real Dynamic Stepper */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 overflow-x-auto shrink-0 shadow-(--shadow-xs)">
          <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
            {stepperSteps.map((s, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isActive = idx === currentStepIdx;
              return (
                <div key={s.number} className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={14} className="stroke-3" />
                    ) : (
                      s.number
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      isCompleted || isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                  {idx < stepperSteps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 rounded-full hidden md:block shrink-0 ${
                        isCompleted ? "bg-emerald-500" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {interviewState !== "idle" && (
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 ${
              interviewState === "completed"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : interviewState === "failed"
                  ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                  : "bg-primary/5 border-primary/10 text-primary"
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {interviewState === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : interviewState === "failed" ? (
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                  <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold">
                    {interviewState === "completed"
                      ? "Your personalized interview is ready."
                      : interviewState === "failed"
                        ? "Interview generation failed."
                        : "Your personalized interview questions are being prepared in the background."}
                  </p>
                  {interviewState !== "completed" &&
                    interviewState !== "failed" && (
                      <p className="text-xs opacity-80 mt-0.5">
                        {currentInterviewStep}
                      </p>
                    )}
                </div>
              </div>
              {interviewState === "completed" && (
                <button
                  onClick={() =>
                    navigate("/interview", {
                      state: { sessionId: interviewSessionId },
                    })
                  }
                  className="flex items-center gap-1.5 h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Start Interview
                </button>
              )}
            </div>
          </div>
        )}

        {generatorError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl flex items-center justify-between font-semibold animate-in fade-in-0 duration-200">
            <span>{generatorError}</span>
            <button
              onClick={() => setGeneratorError(null)}
              className="text-red-500 hover:text-red-600 font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {!generated ? (
          <div className="space-y-6 animate-in fade-in-0 duration-300">
            {/* Step 1 & 2 Inputs Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <ResumeUpload
                uploaded={uploaded}
                uploading={uploading}
                setUploaded={setUploaded}
                dragging={dragging}
                fileName={fileName}
                fileSize={fileSize}
                setDragging={setDragging}
                setAnalysis={setAnalysis}
                uploadProgress={uploadProgress}
                handleUpload={handleUpload}
                handleDrop={handleDrop}
                generated={generated}
                setGenerated={setGenerated}
                generating={generating}
              />
              <JobDescription
                jd={jd}
                setJd={setJd}
                uploaded={uploaded}
                analyzing={analyzing}
                handleAnalyze={handleAnalyze}
              />
            </div>

            {analysis && (
              <div className="space-y-6 animate-in fade-in-0 duration-300">
                <div className="border-b border-border pb-2.5 text-left">
                  <h3 className="text-sm font-bold text-foreground">
                    Current Resume Analysis
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Below is the ATS score and feedback for your uploaded resume
                    against the target job description.
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <ATSScore analysis={analysis} />
                  <AISuggestions analysis={analysis} />
                  <KeywordAnalysis analysis={analysis} />
                  <HeatMap analysis={analysis} />
                </div>
              </div>
            )}

            {/* Modular TemplateSelector */}
            <TemplateSelector
              selectedTemplateName={selectedTemplateName}
              setSelectedTemplateName={setSelectedTemplateName}
              hoveredTemplate={hoveredTemplate}
              setHoveredTemplate={setHoveredTemplate}
              setMobilePreviewTemplate={setMobilePreviewTemplate}
            />

            {/* Step 4: Generate Resume Action */}
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-(--shadow-xs) space-y-4">
              {!canGenerate && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
                  Please complete Step 1 (Upload Resume) and Step 2 (Paste Job
                  Description) to enable generation.
                </p>
              )}

              <button
                onClick={() => handleGenerate(selectedTemplateName)}
                disabled={!canGenerate || generating}
                className="w-full max-w-md flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Generating Tailored Resume...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>Generate ATS-Optimized Resume</span>
                  </>
                )}
              </button>

              {generating && (
                <div className="w-full max-w-sm space-y-2 text-left animate-pulse">
                  {[
                    "Analyzing and extracting keyword gaps...",
                    "Restructuring bullet points with action verbs...",
                    "Aligning details with ATS formatting parameters...",
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 text-xs text-muted-foreground"
                    >
                      <Loader2
                        size={11}
                        className="animate-spin text-primary shrink-0"
                      />
                      {step}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Steps 5 & 6: Generated Results with centered full-width Live Preview, hiding analysis */
          <div className="max-w-4xl mx-auto animate-in fade-in-0 duration-300">
            {generatedResume && (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-(--shadow-sm)">
                <div className="flex items-center justify-between border-b border-border pb-3.5 flex-wrap gap-3">
                  <div className="text-left">
                    <h3 className="text-md font-bold text-foreground">
                      Optimized Resume Preview
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Preview and print/download your tailored resume
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {saveMessage && (
                      <span className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> {saveMessage}
                      </span>
                    )}

                    <div className="w-40">
                      <Select
                        options={templateSelectOpts}
                        value={activeTemplate}
                        onChange={(val) => handleSwitchTemplate(val)}
                        size="sm"
                      />
                    </div>

                    <button
                      onClick={() => printResume()}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
                      title="Print / Save as PDF from browser"
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
                      className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
                      title="Download PDF"
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
                      className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
                      title="Download DOCX"
                    >
                      <Download size={12} /> DOCX
                    </button>
                    <button
                      onClick={() =>
                        navigate("/resume/editor", {
                          state: {
                            resume: {
                              ...generatedResume,
                              id: resume?.resume_id,
                              score: analysis?.ats_score,
                            },
                          },
                        })
                      }
                      className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  </div>
                </div>

                <div className="bg-muted/10 border border-border rounded-xl p-4 overflow-y-auto max-h-[750px]">
                  <div className="max-w-[650px] mx-auto shadow-md rounded-lg overflow-hidden bg-card border border-border">
                    <LivePreview
                      personal={
                        normalizeResumeForPreview(generatedResume).personal_info
                      }
                      summary={
                        normalizeResumeForPreview(generatedResume).summary
                      }
                      skills={normalizeResumeForPreview(generatedResume).skills}
                      experience={
                        normalizeResumeForPreview(generatedResume).experience
                      }
                      education={
                        normalizeResumeForPreview(generatedResume).education
                      }
                      projects={
                        normalizeResumeForPreview(generatedResume).projects
                      }
                      color="#7C3AED"
                      templateName={activeTemplate}
                    />
                  </div>
                </div>

                <div className="flex justify-start">
                  <button
                    onClick={() => setGenerated(false)}
                    className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-2 px-3 border border-border rounded-xl bg-card cursor-pointer"
                  >
                    <ArrowLeft size={12} /> Edit Inputs & Re-Generate
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {mobilePreviewTemplate && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setMobilePreviewTemplate(null)}
          />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-(--shadow-xl) overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-200 max-h-[85vh]">
            <div className="px-5 py-4 border-b border-border bg-card flex items-center justify-between shrink-0">
              <div className="text-left">
                <h3 className="text-md font-bold text-foreground">
                  Template Preview: {mobilePreviewTemplate}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {TEMPLATE_REGISTRY[mobilePreviewTemplate]?.description}
                </p>
              </div>
              <button
                onClick={() => setMobilePreviewTemplate(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-muted/10 flex justify-center items-center min-h-[350px]">
              <div className="w-[280px] h-[396px] shadow-md rounded-lg overflow-hidden border border-border bg-card">
                <TemplateThumbnail
                  TemplateComponent={
                    TEMPLATE_REGISTRY[mobilePreviewTemplate]?.component
                  }
                  scale={280 / 794}
                  resume={MOCK_RESUME}
                />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-border bg-card flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setMobilePreviewTemplate(null)}
                className="h-9 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedTemplateName(mobilePreviewTemplate);
                  setMobilePreviewTemplate(null);
                }}
                className="h-9 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-primary/20"
              >
                Select Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
