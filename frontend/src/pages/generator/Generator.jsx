import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../../services/resumeService";
import { analyzeResume, generateResume } from "../../services/generatorService";
import Header from "../../components/generator/Header";
import ResumeUpload from "../../components/generator/ResumeUpload";
import { VERSIONS } from "../../data/generatorData";
import JobDescription from "../../components/generator/JobDescription";
import KeywordAnalysis from "../../components/generator/KeywordAnalysis";
import HeatMap from "../../components/generator/HeatMap";
import ATSScore from "../../components/generator/ATSScore";
import AISuggestions from "../../components/generator/AISuggestions";
import GenerateResume from "../../components/generator/GenerateResume";
import VersionHistory from "../../components/generator/VersionHistory";

export function ResumeGenerator() {
  const navigate = useNavigate();
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
  const [versions, setVersions] = useState(VERSIONS);
  const [generatorError, setGeneratorError] = useState(null);

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setGeneratorError(null);

      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadResume(formData);

      setResume(response.data);
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

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setGeneratorError(null);
      const response = await generateResume({
        resume_id: resume.resume_id,
        job_description: jd,
      });
      setGeneratedResume(response.data.resume);
      setGenerated(true);
    } catch (err) {
      console.error("Generation failed", err);
      setGeneratorError(err.response?.data?.detail || "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Header
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          generated={generated}
          generatedResume={generatedResume}
        />

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
            <KeywordAnalysis analysis={analysis} />
            <HeatMap analysis={analysis} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <ATSScore analysis={analysis} />
            <AISuggestions analysis={analysis} />
            <GenerateResume
              analysis={analysis}
              generating={generating}
              handleGenerate={handleGenerate}
              generated={generated}
            />
            {/* <VersionHistory
                            showHistory={showHistory}
                            versions={versions} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
