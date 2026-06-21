import { useState } from "react";
import { useLocation } from "react-router-dom";
import ResumeEditorForm from "../../components/resume/editor/ResumeEditorForm";
import ResumeTemplate from "../../components/resume/ResumeTemplate";
import ResumeToolbar from "../../components/resume/editor/ResumeToolbar";

export default function ResumeEditor() {
  const { state } = useLocation();
  const [resume, setResume] = useState(state?.resume);
  const [saveStatus, setSaveStatus] = useState("idle");

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await new Promise((r) => setTimeout(r, 800));
      const savedList = JSON.parse(
        localStorage.getItem("saved_resumes") || "[]",
      );

      const resumeId = resume.id || resume.resume_id || Date.now();
      const existingIdx = savedList.findIndex((item) => item.id === resumeId);

      const resumeEntry = {
        id: resumeId,
        title: resume.personal_info?.name
          ? `${resume.personal_info.name}'s Resume`
          : "Untitled Resume",
        resume: resume,
        updatedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        template: "Professional",
      };

      if (existingIdx >= 0) {
        savedList[existingIdx] = resumeEntry;
      } else {
        savedList.push(resumeEntry);
      }

      localStorage.setItem("saved_resumes", JSON.stringify(savedList));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  if (!resume) {
    return <div className="p-6">Resume not found.</div>;
  }
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="px-6 py-2 border-b bg-card">
        <ResumeToolbar
          saving={saveStatus === "saving"}
          saveStatus={saveStatus}
          onSave={handleSave}
          onDownload={handleDownload}
        />
      </div>
      <div className="grid grid-cols-12 flex-1 overflow-hidden">
        <div className="col-span-4 border-r overflow-y-auto bg-card h-full">
          <ResumeEditorForm resume={resume} setResume={setResume} />
        </div>
        <div className="col-span-8 bg-muted/30 overflow-y-auto p-8 h-full">
          <div className="max-w-4xl mx-auto shadow-lg bg-white border border-border">
            <ResumeTemplate resume={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}
