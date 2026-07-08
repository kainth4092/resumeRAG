import { useState, useEffect, useRef } from "react";
import { getResumes, uploadResume } from "../services/resumeService";
import {
  analyzeResumeHealth,
  improveResumeSection,
  getResumeHealth,
} from "../services/generatorService";

import { useAuth } from "../../auth/context/AuthContext";

export function useResumeAnalysis() {
  const { user } = useAuth();

  const selectedResumeKey = user?.email
    ? `selected_resume_${user.email}`
    : "selected_resume";
  const uploadedFileKey = user?.email
    ? `uploaded_file_${user.email}`
    : "uploaded_file";
  const fileNameKey = user?.email ? `file_name_${user.email}` : "file_name";
  const fileSizeKey = user?.email ? `file_size_${user.email}` : "file_size";
  const analysisResultKey = user?.email
    ? `analysis_result_${user.email}`
    : "analysis_result";

  const [resumesList, setResumesList] = useState([]);

  const [selectedResume, setSelectedResume] = useState(() => {
    try {
      const saved = localStorage.getItem(selectedResumeKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [uploadedFile, setUploadedFile] = useState(() => {
    try {
      const saved = localStorage.getItem(uploadedFileKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const [fileName, setFileName] = useState(() => {
    return localStorage.getItem(fileNameKey) || "";
  });

  const [fileSize, setFileSize] = useState(() => {
    return localStorage.getItem(fileSizeKey) || "";
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");

  const [analysisResult, setAnalysisResult] = useState(() => {
    try {
      const saved = localStorage.getItem(analysisResultKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [error, setError] = useState("");
  const [improvingSection, setImprovingSection] = useState(null);
  const [improvedText, setImprovedText] = useState("");
  const [copiedSection, setCopiedSection] = useState(false);
  const [customSectionContent, setCustomSectionContent] = useState("");

  const fileRef = useRef(null);

  useEffect(() => {
    if (selectedResume) {
      localStorage.setItem(selectedResumeKey, JSON.stringify(selectedResume));
    } else {
      localStorage.removeItem(selectedResumeKey);
    }
  }, [selectedResume, selectedResumeKey]);

  useEffect(() => {
    if (uploadedFile) {
      localStorage.setItem(uploadedFileKey, JSON.stringify(uploadedFile));
    } else {
      localStorage.removeItem(uploadedFileKey);
    }
  }, [uploadedFile, uploadedFileKey]);

  useEffect(() => {
    localStorage.setItem(fileNameKey, fileName);
  }, [fileName, fileNameKey]);

  useEffect(() => {
    localStorage.setItem(fileSizeKey, fileSize);
  }, [fileSize, fileSizeKey]);

  useEffect(() => {
    if (analysisResult) {
      localStorage.setItem(analysisResultKey, JSON.stringify(analysisResult));
    } else {
      localStorage.removeItem(analysisResultKey);
    }
  }, [analysisResult, analysisResultKey]);

  // Invalidate cache if the resume has been updated/changed
  useEffect(() => {
    if (resumesList.length > 0 && selectedResume) {
      const freshResume = resumesList.find(
        (r) =>
          String(r.id) ===
          String(selectedResume.resume_id || selectedResume.id),
      );
      if (freshResume && freshResume.version !== selectedResume.version) {
        Promise.resolve().then(() => {
          setAnalysisResult(null);
          setSelectedResume(freshResume);
        });
      }
    }
  }, [resumesList, selectedResume]);

  useEffect(() => {
    getResumes()
      .then((data) => {
        if (Array.isArray(data)) {
          setResumesList(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch resumes:", err);
      });
  }, []);

  const handleChooseFile = (e) => {
    e.stopPropagation();
    fileRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(10);
      setError("");
      setSelectedResume(null);

      const formData = new FormData();
      formData.append("file", file);

      const interval = setInterval(() => {
        setUploadProgress((p) => (p < 90 ? p + 15 : p));
      }, 100);

      const response = await uploadResume(formData);
      clearInterval(interval);
      setUploadProgress(100);

      if (response.data) {
        const enrichedResume = {
          id: response.data.resume_id || response.data.id,
          resume_id: response.data.resume_id || response.data.id,
          title: file.name,
          original_filename: file.name,
          ...response.data,
        };
        setSelectedResume(enrichedResume);
        setUploadedFile(enrichedResume);
        setFileName(file.name);
        setFileSize((file.size / (1024 * 1024)).toFixed(2));

        try {
          const listRes = await getResumes();
          if (Array.isArray(listRes)) {
            setResumesList(listRes);
          }
        } catch (listErr) {
          console.error("Failed to refresh resumes list", listErr);
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError(
        err.response?.data?.detail ||
          "Upload failed. Please ensure the file is a valid PDF or DOCX.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSelectResume = async (resume) => {
    setSelectedResume(resume);
    setUploadedFile(null);
    setError("");
    setAnalysisResult(null);
    try {
      const response = await getResumeHealth(resume.resume_id || resume.id);
      if (response.data) {
        setAnalysisResult(response.data);
      }
    } catch {
      // Intentionally ignore missing report; the user can run analysis manually.
    }
  };

  const runATSAnalysis = async () => {
    if (!selectedResume) return;

    setAnalyzing(true);
    setError("");
    setAnalysisResult(null);

    const steps = [
      "Auditing resume format and structures...",
      "Analyzing grammar & sentence mechanics...",
      "Matching skills & extracting key phrases...",
      "Assessing experience quality & project metrics...",
      "Generating premium ATS scorecard...",
    ];

    let stepIdx = 0;
    setAnalysisStep(steps[stepIdx]);

    const interval = setInterval(() => {
      if (stepIdx < steps.length - 1) {
        stepIdx++;
        setAnalysisStep(steps[stepIdx]);
      }
    }, 2000);

    try {
      const resumeId = selectedResume.resume_id || selectedResume.id;
      const response = await analyzeResumeHealth({ resume_id: resumeId });
      setAnalysisResult(response.data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(
        err.response?.data?.detail ||
          "Health analysis failed. Please try again.",
      );
    } finally {
      clearInterval(interval);
      setAnalyzing(false);
    }
  };

  const triggerSectionImprovement = async (sectionName) => {
    if (!selectedResume) return;
    setImprovingSection(sectionName);
    setImprovedText("");
    setError("");

    try {
      const resumeId = selectedResume.resume_id || selectedResume.id;
      const response = await improveResumeSection({
        resume_id: resumeId,
        section_name: sectionName,
        content: customSectionContent || null,
      });
      setImprovedText(response.data.improved_text);
    } catch (err) {
      console.error("Section improvement failed:", err);
      setError("Failed to improve section with AI. Please try again.");
    }
  };

  const copyToClipboard = () => {
    if (!improvedText) return;
    navigator.clipboard.writeText(improvedText);
    setCopiedSection(true);
    setTimeout(() => setCopiedSection(false), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 80)
      return "text-emerald-500 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60)
      return "text-amber-500 stroke-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 stroke-red-500 bg-red-500/10 border-red-500/20";
  };

  const getScoreFillColor = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return {
    fileRef,
    resumesList,
    setResumesList,
    selectedResume,
    setSelectedResume,
    uploadedFile,
    setUploadedFile,
    uploading,
    setUploading,
    uploadProgress,
    setUploadProgress,
    dragging,
    setDragging,
    fileName,
    setFileName,
    fileSize,
    setFileSize,
    analyzing,
    setAnalyzing,
    analysisStep,
    setAnalysisStep,
    analysisResult,
    setAnalysisResult,
    error,
    setError,
    improvingSection,
    setImprovingSection,
    improvedText,
    setImprovedText,
    copiedSection,
    setCopiedSection,
    customSectionContent,
    setCustomSectionContent,
    handleChooseFile,
    handleFileInputChange,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSelectResume,
    runATSAnalysis,
    triggerSectionImprovement,
    copyToClipboard,
    getScoreColor,
    getScoreFillColor,
  };
}
