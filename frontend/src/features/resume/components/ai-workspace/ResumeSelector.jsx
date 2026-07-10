import { useRef } from "react";
import { UploadCloud, Sparkles, FileText } from "lucide-react";
import Select from "../resume/dashboard/Select";

export default function ResumeSelector({
  resumesList,
  selectedResume,
  onSelectResume,
  onUploadFile,
  uploading,
  uploadProgress,
  dragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onImportProfile,
  importingProfile,
  onReset,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUploadFile(file);
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs transition-all duration-300">
      <div className="flex flex-col gap-4">
        {selectedResume ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-primary/5 border border-primary/10 rounded-xl animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-foreground">
                  {selectedResume.original_filename ||
                    selectedResume.title ||
                    "Untitled Resume"}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Active Workspace Resume
                </p>
              </div>
            </div>
            <button
              onClick={onReset}
              className="px-3.5 py-1.5 bg-card hover:bg-muted border border-border hover:border-border/80 text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Change Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Upload Box */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center group ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40"
              }`}
            >
              {uploading ? (
                <div className="w-full space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-spin">
                    <UploadCloud size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">
                      Uploading Resume...
                    </p>
                    <div className="w-32 bg-border h-1 rounded-full mx-auto overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors flex items-center justify-center mb-3">
                    <UploadCloud size={20} />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">
                    Upload your resume
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                    Drag and drop, or{" "}
                    <span className="text-primary font-bold">browse</span>
                  </p>
                  <p className="text-[9px] text-muted-foreground/80 mt-0.5">
                    PDF or DOCX (max. 5MB)
                  </p>
                </>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
            />

            {/* Quick Actions (Select saved or import from profile) */}
            <div className="flex flex-col justify-between gap-4">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Select a saved resume
                </label>
                <div className="relative">
                  <Select
                    options={resumesList.map((res) => ({
                      value: String(res.id),
                      label:
                        res.title ||
                        res.original_filename ||
                        `Resume #${res.id}`,
                    }))}
                    value=""
                    onChange={(resumeId) => {
                      const selected = resumesList.find(
                        (resume) => String(resume.id) === String(resumeId),
                      );

                      if (selected) {
                        onSelectResume(selected);
                      }
                    }}
                    placeholder="Choose from saved resumes..."
                    size="sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px bg-border flex-1" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase">
                  Or
                </span>
                <div className="h-px bg-border flex-1" />
              </div>

              <button
                onClick={onImportProfile}
                disabled={importingProfile}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {importingProfile ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Importing Profile...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Use My Saved Profile instead</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
