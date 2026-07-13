import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  uploadResume,
  importProfileToResume,
  updateResume,
} from "../services/resumeService";
import { analyzeResume, generateResume } from "../services/generatorService";
import { interviewService } from "../../interview/services/interviewService";
import { estimatePageCount } from "../../../utils/resumeUtils";
import { useAuth } from "../../auth/context/AuthContext";

export function useResumeGenerator() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const lastResumeIdKey = user?.email
    ? `last_resume_id_${user.email}`
    : "last_resume_id";
  const lastJobDescKey = user?.email
    ? `last_job_description_${user.email}`
    : "last_job_description";

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
  const [importingProfile, setImportingProfile] = useState(false);

  const [selectedTemplateName, setSelectedTemplateName] =
    useState("Professional");
  const [activeTemplate, setActiveTemplate] = useState("Professional");

  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [mobilePreviewTemplate, setMobilePreviewTemplate] = useState(null);

  const [resumeState, setResumeState] = useState("idle");
  const [interviewState, setInterviewState] = useState("idle");
  const [interviewSessionId, setInterviewSessionId] = useState(null);
  const [currentInterviewStep, setCurrentInterviewStep] = useState("");

  useEffect(() => {
    if (resume) {
      const lastVersionKey = `resume_version_${user?.email || "default"}`;
      const lastVersion = localStorage.getItem(lastVersionKey);
      if (lastVersion && lastVersion !== resume.version) {
        Promise.resolve().then(() => {
          setAnalysis(null);
          setGenerated(false);
          setGeneratedResume(null);
        });
      }
      localStorage.setItem(lastVersionKey, resume.version || "v1");
    } else {
      localStorage.removeItem(`resume_version_${user?.email || "default"}`);
    }
  }, [resume, user]);
  const [saveMessage, setSaveMessage] = useState("");

  const handleImportProfile = async () => {
    try {
      setImportingProfile(true);
      setGeneratorError(null);

      const response = await importProfileToResume();
      if (response.data) {
        const enrichedResume = {
          id: response.data.resume_id || response.data.id,
          resume_id: response.data.resume_id || response.data.id,
          title: "Imported Profile",
          original_filename: "profile_import.txt",
          ...response.data,
        };
        setResume(enrichedResume);
        if (enrichedResume.resume_id) {
          localStorage.setItem(lastResumeIdKey, enrichedResume.resume_id);
        }
      }
      setUploaded(true);
      setAnalysis(null);
      setFileName("Profile Import");
      setFileSize("0.05");
      setUploadProgress(100);
    } catch (err) {
      console.error("Import profile failed", err);

      if (err.code === "ECONNABORTED") {
        setGeneratorError(
          "The server took too long to respond. Please try again in a moment.",
        );
      } else if (!err.response) {
        setGeneratorError(
          "Unable to connect to the server. Please check your internet connection and try again.",
        );
      } else {
        const detail = err.response?.data?.detail;

        setGeneratorError(
          typeof detail === "string"
            ? detail
            : "Failed to import your profile. Please make sure your profile contains enough information.",
        );
      }
    } finally {
      setImportingProfile(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setGeneratorError(null);

      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadResume(formData);

      if (response.data) {
        const enrichedResume = {
          id: response.data.resume_id || response.data.id,
          resume_id: response.data.resume_id || response.data.id,
          title: file.name,
          original_filename: file.name,
          ...response.data,
        };
        setResume(enrichedResume);
        if (enrichedResume.resume_id) {
          localStorage.setItem(lastResumeIdKey, enrichedResume.resume_id);
        }
      }
      setUploaded(true);
      setAnalysis(null);
      setFileName(file.name);
      setUploadProgress(100);
      setFileSize((file.size / (1024 * 1024)).toFixed(2));
    } catch (err) {
      console.error("Upload failed", err);

      if (err.code === "ECONNABORTED") {
        setGeneratorError(
          "The upload timed out because the server took too long to respond. Please try again.",
        );
      } else if (!err.response) {
        setGeneratorError(
          "Unable to connect to the server. Please check your connection and try again.",
        );
      } else {
        const detail = err.response?.data?.detail;

        setGeneratorError(
          typeof detail === "string"
            ? detail
            : "Upload failed. Please use a valid PDF or DOCX file.",
        );
      }
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
    if (!resume || resume.parsing_status === "pending" || resume.parsing_status === "processing") return;
    try {
      setAnalyzing(true);
      setGeneratorError(null);
      localStorage.setItem(lastJobDescKey, jd);
      const resumeId = resume.resume_id || resume.id;
      if (resumeId) {
        localStorage.setItem(lastResumeIdKey, resumeId);
      }
      const response = await analyzeResume({
        resume_id: resumeId,
        job_description: jd,
      });
      setAnalysis(response.data);
    } catch (err) {
      console.error("Analysis failed", err);
      setGeneratorError(
        err.response?.data?.detail ||
          "Analysis failed. Please check your job description and try again.",
      );
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
      "Organizing Categories...",
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
    if (!resume || resume.parsing_status === "pending" || resume.parsing_status === "processing") return;
    const resolvedTemplateName =
      typeof templateName === "string" && templateName.trim()
        ? templateName
        : "Professional";
    try {
      setResumeState("generating");
      setGenerating(true);
      setGeneratorError(null);
      setSaveMessage("");
      localStorage.setItem(lastJobDescKey, jd);
      const requestResumeId = resume.resume_id || resume.id;
      if (requestResumeId) {
        localStorage.setItem(lastResumeIdKey, requestResumeId);
      }

      let currentAnalysis = analysis;
      if (!currentAnalysis) {
        setAnalyzing(true);
        const analyzeResponse = await analyzeResume({
          resume_id: requestResumeId,
          job_description: jd,
        });
        currentAnalysis = analyzeResponse.data;
        setAnalysis(currentAnalysis);
        setAnalyzing(false);
      }

      const response = await generateResume({
        resume_id: requestResumeId,
        job_description: jd,
      });
      const r = {
        ...response.data.resume,
        id:
          response.data.resume_id || requestResumeId || Date.now().toString(),
        resume_id:
          response.data.resume_id || requestResumeId || Date.now().toString(),
      };
      setGeneratedResume(r);
      setGenerated(true);
      setResumeState("completed");
      setActiveTemplate(resolvedTemplateName);

      const resumesKey = user?.email
        ? `saved_resumes_${user.email}`
        : "saved_resumes";

      const resumeId = r.id;

      const resumeEntry = {
        id: parseInt(resumeId, 10) || resumeId,
        title: r.personal_info?.name
          ? `${r.personal_info.name}'s Resume`
          : "Optimized Resume",
        score: currentAnalysis?.ats_score || 85,
        status: "Active",
        updatedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        template: resolvedTemplateName,
        color: "#4F46E5",
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

      const existingIdx = savedList.findIndex(
        (item) => String(item.id) === String(resumeId),
      );
      if (existingIdx >= 0) {
        savedList[existingIdx] = resumeEntry;
      } else {
        savedList.push(resumeEntry);
      }
      localStorage.setItem(resumesKey, JSON.stringify(savedList));
      setSaveMessage("Resume saved automatically!");
      runBackgroundInterviewGeneration(resumeId, jd);
    } catch (err) {
      console.error("Generation failed", err);
      setResumeState("failed");
      setAnalyzing(false);
      setGeneratorError(
        err.response?.data?.detail || "Generation failed. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSwitchTemplate = (newTemplate) => {
    setActiveTemplate(newTemplate);
    const resumesKey = user?.email
      ? `saved_resumes_${user.email}`
      : "saved_resumes";
    const resumeId = resume?.resume_id || resume?.id || localStorage.getItem(lastResumeIdKey);
    if (!resumeId) return;

    const savedList = JSON.parse(localStorage.getItem(resumesKey) || "[]");
    const updated = savedList.map((item) => {
      if (String(item.id) === String(resumeId)) {
        return { ...item, template: newTemplate };
      }
      return item;
    });
    localStorage.setItem(resumesKey, JSON.stringify(updated));

    const numericId = parseInt(resumeId, 10);
    if (!isNaN(numericId)) {
      updateResume(numericId, { template: newTemplate }).catch((err) =>
        console.error("Failed to sync template change to backend:", err),
      );
    }

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
    importingProfile,
    handleImportProfile,
  };
}
