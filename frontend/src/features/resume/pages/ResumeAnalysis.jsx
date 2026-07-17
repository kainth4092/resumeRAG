import { useResumeAnalysis } from "../hooks/useResumeAnalysis";
import Header from "../components/resume analysis/Header";
import ErrorAlert from "../components/resume analysis/ErrorAlert";
import UploadCard from "../components/resume analysis/UploadCard";
import SelectedResumeCard from "../components/resume analysis/SelectedResumeCard";
import SavedResumeList from "../components/resume analysis/SavedResumeList";
import AnalysisLoading from "../components/resume analysis/AnalysisLoading";
import ATSScoreCards from "../components/resume analysis/ATSScoreCards";
import WeaknessCard from "../components/resume analysis/WeaknessesCard";
import AISectionImprover from "../components/resume analysis/AISectionImprover";
import SectionMenu from "../components/resume analysis/SectionMenu";
import ImprovedTextPanel from "../components/resume analysis/ImprovedTextPanel";
import MissingSectionsCard from "../components/resume analysis/MissingSectionsCard";
import ProgressScore from "../components/resume analysis/ProgressScore";
import Analyzing from "../components/resume analysis/Analyzing";
import QuickSummary from "../components/resume analysis/QuickSummary";
import StrengthsCard from "../components/resume analysis/StrengthsCard";

export default function ResumeAnalysis() {
  const {
    fileRef,
    resumesList,
    selectedResume,
    setSelectedResume,
    uploadedFile,
    setUploadedFile,
    uploading,
    uploadProgress,
    dragging,
    fileName,
    setFileName,
    fileSize,
    analyzing,
    analysisStep,
    analysisResult,
    setAnalysisResult,
    error,
    setError,
    improvingSection,
    setImprovingSection,
    improvedText,
    setImprovedText,
    copiedSection,
    customSectionContent,
    setCustomSectionContent,
    handleChooseFile,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSelectResume,
    runATSAnalysis,
    triggerSectionImprovement,
    copyToClipboard,
    getScoreColor,
    getScoreFillColor,
  } = useResumeAnalysis();

  return (
    <div className="h-full overflow-y-auto bg-background text-left font-sans">
      <div className="max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in-0 duration-200">
        <Header
          analysisResult={analysisResult}
          setAnalysisResult={setAnalysisResult}
          setSelectedResume={setSelectedResume}
          setUploadedFile={setUploadedFile}
          setFileName={setFileName}
        />

        <ErrorAlert error={error} setError={setError} />

        {!analysisResult && !analyzing && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <UploadCard
                uploadedFile={uploadedFile}
                uploading={uploading}
                handleChooseFile={handleChooseFile}
                handleFileInputChange={handleFileInputChange}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                dragging={dragging}
                fileRef={fileRef}
                fileName={fileName}
                fileSize={fileSize}
                uploadProgress={uploadProgress}
                setUploadedFile={setUploadedFile}
                setSelectedResume={setSelectedResume}
                setFileName={setFileName}
              />

              <SelectedResumeCard
                selectedResume={selectedResume}
                runATSAnalysis={runATSAnalysis}
                uploadedFile={uploadedFile}
                analyzing={analyzing}
              />
            </div>

            <SavedResumeList
              resumesList={resumesList}
              selectedResume={selectedResume}
              handleSelectResume={handleSelectResume}
            />
          </div>
        )}

        <Analyzing analyzing={analyzing} analysisStep={analysisStep} />

        {analysisResult && !analyzing && (
          <div className="space-y-6 animate-in fade-in-0 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ATSScoreCards
                analysisResult={analysisResult}
                getScoreColor={getScoreColor}
              />

              <AnalysisLoading
                analysisResult={analysisResult}
                getScoreColor={getScoreColor}
              />

              <QuickSummary analysisResult={analysisResult} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ProgressScore
                analysisResult={analysisResult}
                getScoreFillColor={getScoreFillColor}
              />

              <MissingSectionsCard analysisResult={analysisResult} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StrengthsCard analysisResult={analysisResult} />
              <WeaknessCard analysisResult={analysisResult} />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
              <AISectionImprover />

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <SectionMenu
                  improvingSection={improvingSection}
                  setImprovingSection={setImprovingSection}
                  setImprovedText={setImprovedText}
                  setCustomSectionContent={setCustomSectionContent}
                  setError={setError}
                />

                <ImprovedTextPanel
                  improvingSection={improvingSection}
                  improvedText={improvedText}
                  copyToClipboard={copyToClipboard}
                  setCustomSectionContent={setCustomSectionContent}
                  customSectionContent={customSectionContent}
                  copiedSection={copiedSection}
                  triggerSectionImprovement={triggerSectionImprovement}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
