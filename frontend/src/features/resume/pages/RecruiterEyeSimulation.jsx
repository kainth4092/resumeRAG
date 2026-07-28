import Header from "../components/resumeAnalysis/Header";
import UploadCard from "../components/resumeAnalysis/UploadCard";
import SelectedResumeCard from "../components/resumeAnalysis/SelectedResumeCard";
import SavedResumeList from "../components/resumeAnalysis/SavedResumeList";
import ErrorAlert from "../components/resumeAnalysis/ErrorAlert";
import Analyzing from "../components/resumeAnalysis/Analyzing";

import EyeTrackingPreview from "../components/recruiter simulation/EyeTrackingPreview";
import RecruiterScoreCard from "../components/recruiter simulation/RecruiterScoreCard";
import HeatmapLegend from "../components/recruiter simulation/HeatmapLegend";
import EyeContactTimeline from "../components/recruiter simulation/EyeContactTimeline";
import RecruiterSuggestions from "../components/recruiter simulation/RecruiterSuggestions";

import { useRecruiterSimulation } from "../hooks/useRecruiterSimulation";

export default function RecruiterEyeSimulation() {
  const {
    fileRef,
    uploadedFile,
    uploading,
    uploadProgress,
    dragging,
    fileName,
    fileSize,
    selectedResume,
    resumesList,
    simulationResult,
    simulating,
    simulationStep,
    error,

    handleChooseFile,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSelectResume,
    runSimulation,
    setUploadedFile,
    setSelectedResume,
    setFileName,
    setError,
  } = useRecruiterSimulation();

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Header
          analysisResult={simulationResult}
          setAnalysisResult={() => {}}
          setSelectedResume={setSelectedResume}
          setUploadedFile={setUploadedFile}
          setFileName={setFileName}
        />

        <ErrorAlert error={error} setError={setError} />

        {!simulationResult && !simulating && (
          <div className="grid lg:grid-cols-3 gap-6">
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
                uploadedFile={uploadedFile}
                analyzing={simulating}
                runATSAnalysis={runSimulation}
              />
            </div>

            <SavedResumeList
              resumesList={resumesList}
              selectedResume={selectedResume}
              handleSelectResume={handleSelectResume}
            />
          </div>
        )}

        <Analyzing analyzing={simulating} analysisStep={simulationStep} />

        {simulationResult && !simulating && (
          <div className="space-y-6">
            <RecruiterScoreCard result={simulationResult} />

            <EyeTrackingPreview result={simulationResult} />

            <div className="grid lg:grid-cols-2 gap-6">
              <EyeContactTimeline result={simulationResult} />

              <HeatmapLegend />
            </div>

            <RecruiterSuggestions result={simulationResult} />
          </div>
        )}
      </div>
    </div>
  );
}
