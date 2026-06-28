import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../services/resumeService";
import { analyzeResume, generateResume } from "../services/generatorService";
import { interviewService } from "../../interview/services/interviewService";
import Header from "../components/generator/Header";
import { useAuth } from "../../../context/AuthContext";
import ResumeUpload from "../components/generator/ResumeUpload";
import JobDescription from "../components/generator/JobDescription";
import KeywordAnalysis from "../components/generator/KeywordAnalysis";
import HeatMap from "../components/generator/HeatMap";
import ATSScore from "../components/generator/ATSScore";
import AISuggestions from "../components/generator/AISuggestions";
import LivePreview from "../components/resume/editor/LivePreview";
import TemplateThumbnail from "../components/resume/templates/TemplateThumbnail";
import { MOCK_RESUME } from "./templatesData";
import { downloadPDF } from "../utils/exporter";
import { CheckCircle2, AlertCircle, Loader2, Download, Edit2, Printer, ArrowLeft, Zap, Info, Eye, X } from "lucide-react";
import { TEMPLATE_REGISTRY } from "../components/resume/templates";

export function ResumeGenerator({ onBack }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const lastResumeIdKey = user?.email ? `last_resume_id_${user.email}` : "last_resume_id";
  const lastJobDescKey = user?.email ? `last_job_description_${user.email}` : "last_job_description";

  const [resume, setResume] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [jd, setJd] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [generatorError, setGeneratorError] = useState(null);

  const [selectedTemplateName, setSelectedTemplateName] = useState("Professional");
  const [activeTemplate, setActiveTemplate] = useState("Professional");

  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [mobilePreviewTemplate, setMobilePreviewTemplate] = useState(null);

  const [resumeState, setResumeState] = useState("idle"); // idle | generating | completed | failed
  const [interviewState, setInterviewState] = useState("idle"); // idle | queued | generating | completed | failed
  const [interviewSessionId, setInterviewSessionId] = useState(null);
  const [currentInterviewStep, setCurrentInterviewStep] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setGeneratorError(null);

      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadResume(formData);

      setResume(response.data);
      if (response.data?.resume_id) {
        localStorage.setItem(lastResumeIdKey, response.data.resume_id);
      }
      setUploaded(true);
      setAnalysis(null);
      setFileName(file.name);
      setUploadProgress(100);
      setFileSize((file.size / (1024 * 1024)).toFixed(2));
    } catch (err) {
      console.error("Upload failed", err);
      setGeneratorError(err.response?.data?.detail || "Upload failed. Please ensure the file is a valid PDF.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];

    if (file) {
      handleUpload(file);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setGeneratorError(null);
      localStorage.setItem(lastJobDescKey, jd);
      if (resume?.resume_id) {
        localStorage.setItem(lastResumeIdKey, resume.resume_id);
      }
      const response = await analyzeResume({
        resume_id: resume.resume_id,
        job_description: jd,
      });
      setAnalysis(response.data);
    } catch (err) {
      console.error("Analysis failed", err);
      setGeneratorError(err.response?.data?.detail || "Analysis failed. Please check your job description and try again.");
    } finally {
      setAnalyzing(false);
    }
  };

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
        typeof s === "string" ? { id: idx, name: s, level: 80 } : s
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
        tech: proj.tech || (Array.isArray(proj.technologies) ? proj.technologies.join(" · ") : proj.technologies || ""),
        url: proj.url || proj.github || proj.live || "",
        desc: proj.desc || (Array.isArray(proj.description) ? proj.description.join("\n") : proj.description || ""),
      })),
    };
  };

  const runBackgroundInterviewGeneration = async (resumeId, jobDesc) => {
    setInterviewState("queued");
    const steps = [
      "Preparing Interview Questions...",
      "Matching Resume Skills...",
      "Generating Questions...",
      "Organizing Categories..."
    ];
    let currentStepIdx = 0;
    setCurrentInterviewStep(steps[currentStepIdx]);
    setInterviewState("generating");

    const interval = setInterval(() => {
      if (currentStepIdx < steps.length - 1) {
        currentStepIdx += 1;
        setCurrentInterviewStep(steps[currentStepIdx]);
      }
    }, 2500);

    try {
      const interviewResponse = await interviewService.generateInterview({
        resume_id: parseInt(resumeId, 10) || resumeId,
        job_description: jobDesc,
      });

      clearInterval(interval);
      if (interviewResponse?.data?.session?.id) {
        setCurrentInterviewStep("Interview Ready");
        setInterviewSessionId(interviewResponse.data.session.id);
        setInterviewState("completed");
      } else {
        setInterviewState("failed");
      }
    } catch (err) {
      clearInterval(interval);
      console.error("Background interview generation failed", err);
      setInterviewState("failed");
    }
  };

  const handleGenerate = async (templateName = "Professional") => {
    try {
      setResumeState("generating");
      setGenerating(true);
      setGeneratorError(null);
      setSaveMessage("");
      localStorage.setItem(lastJobDescKey, jd);
      if (resume?.resume_id) {
        localStorage.setItem(lastResumeIdKey, resume.resume_id);
      }

      let currentAnalysis = analysis;
      if (!currentAnalysis) {
        setAnalyzing(true);
        const analyzeResponse = await analyzeResume({
          resume_id: resume.resume_id,
          job_description: jd,
        });
        currentAnalysis = analyzeResponse.data;
        setAnalysis(currentAnalysis);
        setAnalyzing(false);
      }

      const response = await generateResume({
        resume_id: resume.resume_id,
        job_description: jd,
      });
      const r = response.data.resume;
      setGeneratedResume(r);
      setGenerated(true);
      setResumeState("completed");
      setActiveTemplate(templateName);

      // Auto-save generated resume
      const resumesKey = user?.email ? `saved_resumes_${user.email}` : "saved_resumes";
      const resumeId = resume?.resume_id || Date.now().toString();
      const resumeEntry = {
        id: parseInt(resumeId, 10) || resumeId,
        title: r.personal_info?.name ? `${r.personal_info.name}'s Resume` : "Optimized Resume",
        score: currentAnalysis?.ats_score || 85,
        status: "Active",
        updatedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        template: templateName,
        color: "#7C3AED",
        starred: false,
        version: "v1",
        pages: 1,
        resume: r,
        jobDescription: jd,
      };

      const savedList = JSON.parse(localStorage.getItem(resumesKey) || "[]");
      savedList.forEach((item) => {
        item.status = "Inactive";
      });
      const existingIdx = savedList.findIndex((item) => String(item.id) === String(resumeId));
      if (existingIdx >= 0) {
        savedList[existingIdx] = resumeEntry;
      } else {
        savedList.push(resumeEntry);
      }
      localStorage.setItem(resumesKey, JSON.stringify(savedList));
      setSaveMessage("Resume saved automatically!");

      // Start non-blocking background interview generation
      runBackgroundInterviewGeneration(resume.resume_id, jd);

    } catch (err) {
      console.error("Generation failed", err);
      setResumeState("failed");
      setAnalyzing(false);
      setGeneratorError(err.response?.data?.detail || "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSwitchTemplate = (newTemplate) => {
    setActiveTemplate(newTemplate);
    const resumesKey = user?.email ? `saved_resumes_${user.email}` : "saved_resumes";
    const resumeId = resume?.resume_id || localStorage.getItem(lastResumeIdKey);
    if (!resumeId) return;

    const savedList = JSON.parse(localStorage.getItem(resumesKey) || "[]");
    const updated = savedList.map((item) => {
      if (String(item.id) === String(resumeId)) {
        return { ...item, template: newTemplate };
      }
      return item;
    });
    localStorage.setItem(resumesKey, JSON.stringify(updated));
    setSaveMessage("Template switched!");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const canGenerate = uploaded && !!jd && !!selectedTemplateName;

  const wizardSteps = [
    { number: 1, label: "Upload Resume", active: uploaded },
    { number: 2, label: "Paste Job description", active: !!jd },
    { number: 3, label: "Choose Template", active: !!selectedTemplateName },
    { number: 4, label: "Generate optimized version", active: generated },
  ];

  const activePreviewTemplate = hoveredTemplate || selectedTemplateName;

  return (
    <div className="h-full overflow-y-auto bg-background font-sans text-left">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Header onBack={onBack} />

        {/* Wizard Steps Header */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 overflow-x-auto shrink-0 shadow-(--shadow-xs)">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            {wizardSteps.map((s, idx) => (
              <div key={s.number} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                  s.active || generated
                    ? "bg-primary text-white"
                    : idx === 3 && generating
                      ? "bg-primary/20 text-primary animate-pulse"
                      : "bg-muted text-muted-foreground border border-border"
                }`}>
                  {s.number}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${s.active || generated ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {idx < wizardSteps.length - 1 && (
                  <div className={`w-12 h-0.5 rounded-full hidden md:block shrink-0 ${s.active && wizardSteps[idx+1].active ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {interviewState !== "idle" && (
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${interviewState === "completed"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
            : interviewState === "failed"
              ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
              : "bg-primary/5 border-primary/10 text-primary"
            }`}>
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
                  {interviewState !== "completed" && interviewState !== "failed" && (
                    <p className="text-xs opacity-80 mt-0.5">{currentInterviewStep}</p>
                  )}
                </div>
              </div>
              {interviewState === "completed" && (
                <button
                  onClick={() => navigate("/interview", { state: { sessionId: interviewSessionId } })}
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
            <button onClick={() => setGeneratorError(null)} className="text-red-500 hover:text-red-600 font-bold ml-4">
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

            {/* Step 3: Choose Resume Template Inline (Split layout with Hover Preview) */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-(--shadow-xs)">
              <div>
                <h3 className="text-sm font-bold text-foreground">Choose Resume Template</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Select a layout optimization. Hover over any design to see a full layout preview instantly.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                {/* Left Area: Templates list */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.values(TEMPLATE_REGISTRY).map((tpl) => {
                    const isSelected = selectedTemplateName === tpl.name;
                    return (
                      <div
                        key={tpl.name}
                        onClick={() => setSelectedTemplateName(tpl.name)}
                        onMouseEnter={() => setHoveredTemplate(tpl.name)}
                        onMouseLeave={() => setHoveredTemplate(null)}
                        className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01] ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/45 shadow-sm"
                            : "border-border bg-card hover:border-primary/20 hover:bg-muted/10"
                        }`}
                      >
                        {/* Mobile Preview Action Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobilePreviewTemplate(tpl.name);
                          }}
                          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-xl bg-white/95 border border-border opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-sm text-muted-foreground hover:text-foreground z-10 hover:scale-110 active:scale-95"
                          title="Open Preview Dialog"
                        >
                          <Eye size={12} />
                        </button>

                        <div className="space-y-3">
                          <div
                            className={`h-24 w-full rounded-xl bg-linear-to-br ${tpl.thumbnailColor} opacity-90 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between relative overflow-hidden`}
                          >
                            <div className="w-full h-full flex gap-1 bg-white/10 rounded-sm p-1">
                              <div className="w-1/3 bg-white/20 rounded-xs h-full" />
                              <div className="w-2/3 flex flex-col gap-1">
                                <div className="h-2 bg-white/30 rounded-xs w-3/4" />
                                <div className="h-1 bg-white/20 rounded-xs w-full" />
                                <div className="h-1 bg-white/20 rounded-xs w-2/3" />
                              </div>
                            </div>

                            {isSelected && (
                              <div className="absolute bottom-2 right-2 w-5.5 h-5.5 rounded-full bg-white text-primary flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
                                <CheckCircle2 size={13} className="stroke-3 text-primary" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-1.5 justify-between">
                              <h4 className="font-bold text-xs text-foreground">{tpl.name}</h4>
                              {tpl.atsBadge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                  ATS Friendly
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                              {tpl.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/60 flex items-start gap-1.5 text-[9px] text-muted-foreground text-left">
                          <Info size={10} className="mt-0.5 text-primary shrink-0" />
                          <span>
                            <strong className="text-foreground font-semibold">Recommended: </strong>
                            {tpl.recommended}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Area: Instant Desktop Hover Preview Panel */}
                <div className="lg:col-span-2 hidden lg:block sticky top-6 self-start bg-muted/20 border border-border rounded-2xl p-4 text-center space-y-3">
                  <div className="text-left border-b border-border pb-2.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      Instant Design Preview
                    </span>
                    <h4 className="font-bold text-sm text-foreground mt-1.5">
                      {activePreviewTemplate} Layout
                    </h4>
                    <p className="text-[10.5px] text-muted-foreground leading-relaxed mt-0.5">
                      {TEMPLATE_REGISTRY[activePreviewTemplate]?.description}
                    </p>
                  </div>

                  <div className="bg-[#fafafa] border border-border/70 rounded-xl p-3 flex items-center justify-center shadow-inner h-[380px] overflow-hidden relative">
                    <div className="w-[250px] h-[356px] shadow-lg rounded-md overflow-hidden bg-card border border-border/80">
                      <TemplateThumbnail
                        TemplateComponent={TEMPLATE_REGISTRY[activePreviewTemplate].component}
                        scale={250 / 794}
                        resume={MOCK_RESUME}
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 justify-center">
                    <Info size={10} className="text-primary" />
                    Hover other designs to compare immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4: Generate Resume Action */}
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-(--shadow-xs) space-y-4">
              {!canGenerate && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
                  ⚠️ Please complete Step 1 (Upload Resume) and Step 2 (Paste Job Description) to enable generation.
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
                  {["Analyzing and extracting keyword gaps...", "Restructuring bullet points with action verbs...", "Aligning details with ATS formatting parameters..."].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Loader2 size={11} className="animate-spin text-primary shrink-0" />
                      {step}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Steps 5 & 6: Generated Results with Side-by-side Live Preview and Analytics */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start animate-in fade-in-0 duration-300">
            <div className="lg:col-span-3 space-y-4">
              {generatedResume && (
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-(--shadow-sm)">
                  <div className="flex items-center justify-between border-b border-border pb-3.5 flex-wrap gap-3">
                    <div className="text-left">
                      <h3 className="text-md font-bold text-foreground">Optimized Resume Preview</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Preview and print/download your tailored resume</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {saveMessage && (
                        <span className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                          <CheckCircle2 size={12} /> {saveMessage}
                        </span>
                      )}

                      <select
                        value={activeTemplate}
                        onChange={(e) => handleSwitchTemplate(e.target.value)}
                        className="h-8 px-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted transition-all"
                      >
                        {Object.keys(TEMPLATE_REGISTRY).map((name) => (
                          <option key={name} value={name}>
                            Template: {name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
                        title="Print / Save as PDF from browser"
                      >
                        <Printer size={12} /> Print
                      </button>
                      <button
                        onClick={() => downloadPDF(generatedResume, `${generatedResume.personal_info?.name || "Optimized"}_Resume.pdf`)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
                      >
                        <Download size={12} /> PDF
                      </button>
                      <button
                        onClick={() => navigate("/resume/editor", { state: { resume: { ...generatedResume, id: resume?.resume_id, score: analysis?.ats_score } } })}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    </div>
                  </div>

                  <div className="bg-muted/10 border border-border rounded-xl p-4 overflow-y-auto max-h-[600px]">
                    <div className="max-w-[500px] mx-auto shadow-md rounded-lg overflow-hidden bg-card border border-border">
                      <LivePreview
                        personal={normalizeResumeForPreview(generatedResume).personal_info}
                        summary={normalizeResumeForPreview(generatedResume).summary}
                        skills={normalizeResumeForPreview(generatedResume).skills}
                        experience={normalizeResumeForPreview(generatedResume).experience}
                        education={normalizeResumeForPreview(generatedResume).education}
                        projects={normalizeResumeForPreview(generatedResume).projects}
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

            <div className="lg:col-span-2 space-y-4">
              <ATSScore analysis={analysis} />
              <AISuggestions analysis={analysis} />
              <KeywordAnalysis analysis={analysis} />
              <HeatMap analysis={analysis} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Tablet Preview Overlay Modal */}
      {mobilePreviewTemplate && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setMobilePreviewTemplate(null)}
          />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-(--shadow-xl) overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-200 max-h-[85vh]">
            <div className="px-5 py-4 border-b border-border bg-card flex items-center justify-between shrink-0">
              <div className="text-left">
                <h3 className="text-sm font-bold text-foreground">
                  Template Preview: {mobilePreviewTemplate}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
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
                  TemplateComponent={TEMPLATE_REGISTRY[mobilePreviewTemplate]?.component}
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
