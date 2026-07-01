import { useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";

export default function ResumeUpload({
    uploaded,
    setUploaded,
    uploading,
    dragging,
    fileName,
    fileSize,
    setDragging,
    setAnalysis,
    uploadProgress,
    handleUpload,
    handleDrop,
    generated,
    setGenerated,
    generating }) {

    const fileRef = useRef(null);
    const [openingFileManager, setOpeningFileManager] = useState(false);

    const handleChooseFile = (e) => {
        e.stopPropagation();
        setOpeningFileManager(true);

        const handleWindowFocus = () => {
            setTimeout(() => {
                setOpeningFileManager(false);
                window.removeEventListener("focus", handleWindowFocus);
            }, 1200);
        };

        window.addEventListener("focus", handleWindowFocus);
        fileRef.current?.click();
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        setOpeningFileManager(false);
        if (file) {
            handleUpload(file);
        }
    };

    const handleDroppedFile = (e) => {
        setOpeningFileManager(false);
        handleDrop(e);
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-4 font-sans">
            <h3 className="text-sm font-bold text-foreground mb-3">Upload Resume</h3>
            {!uploaded && !uploading && !openingFileManager ? (
                <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDroppedFile}
                    onClick={handleChooseFile}
                    className={`border border-dashed rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all ${dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/20"}`}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${dragging ? "bg-primary/15" : "bg-muted"}`}>
                            <Upload size={16} className={dragging ? "text-primary" : "text-muted-foreground"} />
                        </div>
                        <div className="min-w-0 text-left">
                            <p className="text-xs font-semibold text-foreground">Drop or select your resume</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">PDF or DOCX format · Max 5MB</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleChooseFile}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-foreground bg-card hover:bg-muted hover:border-primary/30 transition-all shrink-0 cursor-pointer"
                    >
                        Choose File
                    </button>
                </div>
            ) : openingFileManager ? (
                <div className="p-4 border border-primary/20 rounded-xl bg-primary/5 flex items-center justify-between gap-3 animate-pulse font-sans">
                    <div className="flex items-center gap-3 min-w-0 text-left">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Loader2 size={15} className="text-primary animate-spin" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground">Opening file manager...</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Select a file to begin uploading</p>
                        </div>
                    </div>
                    <button
                        disabled
                        type="button"
                        className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-bold text-muted-foreground bg-muted shrink-0 cursor-not-allowed"
                    >
                        Please wait
                    </button>
                </div>
            ) : uploading ? (
                <div className="p-4 border border-border rounded-xl bg-muted/10 font-sans">
                    <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Loader2 size={15} className="text-primary animate-spin" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs font-semibold text-foreground">Uploading resume...</p>
                            <p className="text-[10px] text-muted-foreground truncate">{fileName}</p>
                        </div>
                        <span className="text-xs font-bold text-primary shrink-0">{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl font-sans">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        fileName?.toLowerCase().endsWith(".docx")
                            ? "bg-blue-500/10"
                            : "bg-red-500/10"
                    }`}>
                        <FileText size={15} className={
                            fileName?.toLowerCase().endsWith(".docx")
                                ? "text-blue-500"
                                : "text-red-500"
                        } />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-semibold text-foreground truncate">{fileName}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                            {fileSize} MB · Resume uploaded successfully
                        </p>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <button
                        onClick={() => { setUploaded(false); setAnalysis(false); setGenerated(false); }}
                        disabled={generating || generated}
                        className={`transition-colors shrink-0 ${generating || generated ? "text-muted-foreground/30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"}`}
                        title={generating || generated ? "Cannot reset file after generating" : "Reset upload"}
                    >
                        <X size={15} />
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
    )
}