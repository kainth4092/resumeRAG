import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../services/resumeService";
import { analyzeResume, generateResume } from "../services/generatorService";
import { interviewService } from "../../interview/services/interviewService";
import { estimatePageCount } from "../../../utils/resumeUtils";
import { useAuth } from "../../auth/context/AuthContext";

export function useResumeGenerator() {
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

  const [resumeState, setResumeState] = useState("idle");
  const [interviewState, setInterviewState] = useState("idle");
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
      setGeneratorError(err.response?.data?.detail || "Upload failed. Please ensure the file is a valid PDF or DOCX.");
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
        pages: estimatePageCount(r),
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

  return {
    navigate,
    user,
    resume,
    setResume,
    uploaded,
    setUploaded,
    uploading,
    setUploading,
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
    setGenerating,
    generated,
    setGenerated,
    generatedResume,
    setGeneratedResume,
    generatorError,
    setGeneratorError,
    selectedTemplateName,
    setSelectedTemplateName,
    activeTemplate,
    setActiveTemplate,
    hoveredTemplate,
    setHoveredTemplate,
    mobilePreviewTemplate,
    setMobilePreviewTemplate,
    resumeState,
    interviewState,
    interviewSessionId,
    currentInterviewStep,
    saveMessage,
    handleUpload,
    handleDrop,
    handleAnalyze,
    handleGenerate,
    handleSwitchTemplate,
  };
}
