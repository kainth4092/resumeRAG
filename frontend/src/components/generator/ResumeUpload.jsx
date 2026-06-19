import { useRef } from "react";
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
    setGenerated }) {

    const fileRef = useRef(null);

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-foreground mb-4">Upload Resume</h3>
            {!uploaded && !uploading ? (
                <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all ${dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-primary/15" : "bg-muted"}`}>
                        <Upload size={22} className={dragging ? "text-primary" : "text-muted-foreground"} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">Drop your resume here</p>
                        <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {["PDF"].map(f => <span key={f} className="text-[11px] px-2.5 py-1 bg-muted rounded-lg text-muted-foreground border border-border font-mono">{f}</span>)}
                    </div>
                    <input ref={fileRef} type="file" className="hidden" accept=".pdf" onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                            handleUpload(file)
                        }
                    }} />
                </div>
            ) : uploading ? (
                <div className="p-5 border border-border rounded-2xl bg-muted/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Loader2 size={16} className="text-primary animate-spin" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Uploading resume...</p>
                            <p className="text-xs text-muted-foreground">{fileName}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={17} className="text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{fileName}</p>
                        <p className="text-xs text-muted-foreground">{fileSize} MB · Uploaded successfully</p>
                    </div>
                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                    <button
                        onClick={() => { setUploaded(false); setAnalysis(false); setGenerated(false); }}
                        disabled={!generated}
                        className={`transition-colors ${!generated ? "text-muted-foreground/30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"}`}
                        title={!generated ? "Generate the resume first to reset upload" : "Reset upload"}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}