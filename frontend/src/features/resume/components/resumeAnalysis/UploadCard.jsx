import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";

export default function UploadCard({
  uploadedFile,
  uploading,
  handleChooseFile,
  handleFileInputChange,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  dragging,
  fileRef,
  fileName,
  fileSize,
  uploadProgress,
  setUploadedFile,
  setSelectedResume,
  setFileName,
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden">
      <h3 className="text-md font-bold text-foreground mb-4">
        Upload New Resume
      </h3>

      {!uploadedFile && !uploading ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleChooseFile}
          className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
            dragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/20"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              dragging
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Upload size={24} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              Drag and drop your resume here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Accepts PDF or DOCX up to 5MB
            </p>
          </div>
          <button
            type="button"
            onClick={handleChooseFile}
            className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-foreground bg-card hover:bg-muted transition-all cursor-pointer shadow-xs"
          >
            Browse Files
          </button>
        </div>
      ) : uploading ? (
        <div className="p-8 border border-border rounded-xl bg-muted/10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Loader2 size={20} className="text-primary animate-spin" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-foreground">
                Uploading files...
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {fileName}
              </p>
            </div>
            <span className="text-sm font-bold text-primary shrink-0">
              {uploadProgress}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              fileName?.toLowerCase().endsWith(".docx")
                ? "bg-blue-500/10"
                : "bg-red-500/10"
            }`}
          >
            <FileText
              size={20}
              className={
                fileName?.toLowerCase().endsWith(".docx")
                  ? "text-blue-500"
                  : "text-red-500"
              }
            />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-foreground truncate">
              {fileName}
            </p>
            <p className="text-xs text-emerald-500 font-medium mt-0.5">
              {fileSize} MB · File upload completed
            </p>
          </div>
          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
          <button
            onClick={() => {
              setUploadedFile(null);
              setSelectedResume(null);
              setFileName("");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx"
        onChange={handleFileInputChange}
      />
    </div>
  );
}
