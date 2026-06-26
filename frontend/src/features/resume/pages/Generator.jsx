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
import GenerateResume from "../components/generator/GenerateResume";
import LivePreview from "../components/resume/editor/LivePreview";
import { downloadPDF } from "../utils/exporter";
import { CheckCircle2, AlertCircle, Loader2, Download, Edit2, Printer } from "lucide-react";
import TemplateGallery from "../components/generator/TemplateGallery";
import { TEMPLATE_REGISTRY } from "../components/resume/templates";


export function ResumeGenerator() {
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
  const [showHistory, setShowHistory] = useState(false);
  const [generatorError, setGeneratorError] = useState(null);

  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState("Professional");
  const [activeTemplate, setActiveTemplate] = useState("Professional");

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
        score: analysis?.ats_score || 85,
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

  const handleOpenGallery = () => setShowTemplateGallery(true);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Header
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          generated={generated}
          generatedResume={generatedResume}
          analysis={analysis}
          resumeId={resume?.resume_id}
        />

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
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl flex items-center justify-between font-semibold">
            <span>{generatorError}</span>
            <button onClick={() => setGeneratorError(null)} className="text-red-500 hover:text-red-600 font-bold ml-4">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 space-y-4">
            {!generated ? (
              <>
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
              </>
            ) : (
              generatedResume && (
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-(--shadow-sm) animate-in fade-in-0 duration-300">
                  <div className="flex items-center justify-between border-b border-border pb-3.5 flex-wrap gap-3">
                    <div>
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

                  <div className="bg-muted/10 border border-border rounded-xl p-4 overflow-y-auto max-h-[500px]">
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
                </div>
              )
            )}
            <KeywordAnalysis analysis={analysis} />
            <HeatMap analysis={analysis} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <ATSScore analysis={analysis} />
            <AISuggestions analysis={analysis} />
            <GenerateResume
              analysis={analysis}
              generating={generating}
              handleGenerate={handleOpenGallery}
              generated={generated}
            />
            {/* <VersionHistory
                            showHistory={showHistory}
                            versions={versions} /> */}
          </div>
        </div>
      </div>

      {/* Template Selection Gallery Overlay Modal */}
      <TemplateGallery
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        selectedTemplate={selectedTemplateName}
        onSelect={setSelectedTemplateName}
        onConfirm={() => {
          setShowTemplateGallery(false);
          handleGenerate(selectedTemplateName);
        }}
        generating={generating}
      />
    </div>
  );
}

