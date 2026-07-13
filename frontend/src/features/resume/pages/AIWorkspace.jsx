import { useState, useEffect, useRef } from "react";
import { Shield, Target, X, AlertCircle, Sparkles } from "lucide-react";
import { useResumeAnalysis } from "../hooks/useResumeAnalysis";
import { useResumeGenerator } from "../hooks/useResumeGenerator";
import ResumeSelector from "../components/ai-workspace/ResumeSelector";
import GeneralAudit from "../components/ai-workspace/GeneralAudit";
import JobTailor from "../components/ai-workspace/JobTailor";
import TailoredResult from "../components/ai-workspace/TailoredResult";

export default function AIWorkspace() {
  const analysisState = useResumeAnalysis();
  const generatorState = useResumeGenerator();
  const [activeTab, setActiveTab] = useState("audit"); // "audit" or "tailor"
  const [localError, setLocalError] = useState("");

  const { resume: genResume, setResume, setUploaded } = generatorState;
  const { selectedResume, setSelectedResume } = analysisState;

  const prevSelectedResumeRef = useRef(selectedResume);
  const prevGenResumeRef = useRef(genResume);

  useEffect(() => {
    const prevSelected = prevSelectedResumeRef.current;
    const prevGen = prevGenResumeRef.current;

    const aid = selectedResume?.resume_id || selectedResume?.id;
    const gid = genResume?.resume_id || genResume?.id;
    const aver = selectedResume?.version;
    const gver = genResume?.version;

    const prevAid = prevSelected?.resume_id || prevSelected?.id;
    const prevGid = prevGen?.resume_id || prevGen?.id;
    const prevAver = prevSelected?.version;
    const prevGver = prevGen?.version;

    const selectedChanged = aid !== prevAid || aver !== prevAver || (!selectedResume !== !prevSelected);
    const genChanged = gid !== prevGid || gver !== prevGver || (!genResume !== !prevGen);

    if (selectedChanged && !genChanged) {
      if (aid !== gid || aver !== gver || (!selectedResume !== !genResume)) {
        setResume(selectedResume);
        setUploaded(!!selectedResume);
      }
    } else if (genChanged && !selectedChanged) {
      if (aid !== gid || aver !== gver || (!selectedResume !== !genResume)) {
        setSelectedResume(genResume);
      }
    } else if (aid !== gid || aver !== gver || (!selectedResume !== !genResume)) {
      if (selectedResume) {
        setResume(selectedResume);
        setUploaded(true);
      } else {
        setResume(null);
        setUploaded(false);
        setSelectedResume(null);
      }
    }

    prevSelectedResumeRef.current = selectedResume;
    prevGenResumeRef.current = genResume;
  }, [selectedResume, genResume, setResume, setSelectedResume, setUploaded]);

  const handleResetResume = () => {
    analysisState.setSelectedResume(null);
    analysisState.setUploadedFile(null);
    analysisState.setFileName("");
    analysisState.setFileSize("");
    analysisState.setAnalysisResult(null);

    generatorState.setResume(null);
    generatorState.setUploaded(false);
    generatorState.setAnalysis(null);
    generatorState.setGenerated(false);
    generatorState.setGeneratedResume(null);
  };

  const handleNavigateEditor = () => {
    const resumeId =
      generatorState.resume?.resume_id ||
      generatorState.resume?.id ||
      analysisState.selectedResume?.resume_id ||
      analysisState.selectedResume?.id;
    generatorState.navigate("/resume/editor", {
      state: {
        resume: {
          ...generatorState.generatedResume,
          id: resumeId,
          score: generatorState.analysis?.ats_score,
        },
      },
    });
  };

  const activeError =
    analysisState.error || generatorState.generatorError || localError;

  if (generatorState.generated && generatorState.generatedResume) {
    return (
      <div className="h-full overflow-y-auto bg-background text-left font-sans">
        <div className="max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in duration-200">
          <TailoredResult
            generatedResume={generatorState.generatedResume}
            saveMessage={generatorState.saveMessage}
            onBack={() => generatorState.setGenerated(false)}
            onNavigateEditor={handleNavigateEditor}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background text-left font-sans">
      <div className="max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                AI Resume Suite
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-xl">
                Upload your resume to audit general ATS compatibility, optimize
                sections with standalone AI tools, or tailor contents to a
                specific job description.
              </p>
            </div>
          </div>
        </div>

        {activeError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl flex items-center justify-between font-semibold animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{activeError}</span>
            </div>
            <button
              onClick={() => {
                analysisState.setError("");
                generatorState.setGeneratorError(null);
                setLocalError("");
              }}
              className="text-red-500 hover:text-red-600 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Part 1: Unified Resume Selector */}
        <ResumeSelector
          resumesList={analysisState.resumesList}
          selectedResume={analysisState.selectedResume}
          onSelectResume={analysisState.handleSelectResume}
          onUploadFile={analysisState.handleFileUpload}
          uploading={analysisState.uploading}
          uploadProgress={analysisState.uploadProgress}
          dragging={analysisState.dragging}
          onDragOver={analysisState.handleDragOver}
          onDragLeave={analysisState.handleDragLeave}
          onDrop={analysisState.handleDrop}
          onImportProfile={generatorState.handleImportProfile}
          importingProfile={generatorState.importingProfile}
          onReset={handleResetResume}
        />

        {/* Part 2: Actions Tabs & Workspace */}
        {analysisState.selectedResume && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Tabs Selector */}
            <div className="border-b border-border flex items-center gap-1.5 pb-px">
              <button
                onClick={() => setActiveTab("audit")}
                className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
                  activeTab === "audit"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield size={14} />
                General ATS Audit
              </button>

              <button
                onClick={() => setActiveTab("tailor")}
                className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
                  activeTab === "tailor"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Target size={14} />
                Job Description Tailoring
              </button>
            </div>

            {/* Tab Body */}
            {activeTab === "audit" ? (
              <GeneralAudit
                analysisResult={analysisState.analysisResult}
                analyzing={analysisState.analyzing}
                analysisStep={analysisState.analysisStep}
                onRunAnalysis={analysisState.runATSAnalysis}
                improvingSection={analysisState.improvingSection}
                setImprovingSection={analysisState.setImprovingSection}
                improvedText={analysisState.improvedText}
                setImprovedText={analysisState.setImprovedText}
                copiedSection={analysisState.copiedSection}
                customSectionContent={analysisState.customSectionContent}
                setCustomSectionContent={analysisState.setCustomSectionContent}
                triggerSectionImprovement={
                  analysisState.triggerSectionImprovement
                }
                copyToClipboard={analysisState.copyToClipboard}
                improving={analysisState.improving}
                error={analysisState.error}
              />
            ) : (
              <JobTailor
                jd={generatorState.jd}
                setJd={generatorState.setJd}
                analysis={generatorState.analysis}
                analyzing={generatorState.analyzing}
                onAnalyze={generatorState.handleAnalyze}
                onGenerate={generatorState.handleGenerate}
                generating={generatorState.generating}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
