import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, X, ChevronLeft } from "lucide-react";
import { uploadResume } from "../../services/resumeService";

export default function InterviewSetup({ onGenerate, onCancel, hasSessions }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [resumeId, setResumeId] = useState(null);
    const [fileName, setFileName] = useState("");
    const [fileSize, setFileSize] = useState("");
    const [dragging, setDragging] = useState(false);

    // Form inputs
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [jd, setJd] = useState("");

    const [error, setError] = useState(null);
    const [generating, setGenerating] = useState(false);

    const fileRef = useRef(null);

    const handleUpload = async (uploadedFile) => {
        if (!uploadedFile || uploadedFile.type !== "application/pdf") {
            setError("Only PDF files are allowed.");
            return;
        }
        setError(null);
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", uploadedFile);
            const res = await uploadResume(formData);

            setResumeId(res.data.resume_id);
            setFile(uploadedFile);
            setFileName(uploadedFile.name);
            setFileSize((uploadedFile.size / (1024 * 1024)).toFixed(2));
        } catch (err) {
            console.error("Upload failed", err);
            setError(err.response?.data?.detail || "Failed to upload resume. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleUpload(droppedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resumeId) {
            setError("Please upload your resume first.");
            return;
        }
        if (!jd.trim() || jd.trim().length < 30) {
            setError("Please enter a valid job description (at least 30 characters).");
            return;
        }

        setError(null);
        setGenerating(true);
        try {
            await onGenerate({
                resume_id: resumeId,
                job_description: jd,
                company: company.trim() || null,
                role: role.trim() || null,
            });
        } catch (err) {
            console.error("Generation failed", err);
            setError(err.response?.data?.detail || "Failed to generate interview questions. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleResetFile = () => {
        setFile(null);
        setResumeId(null);
        setFileName("");
        setFileSize("");
        setError(null);
    };

    return (
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 md:p-8 font-sans shadow-[var(--shadow-md)]">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                {hasSessions && (
                    <button
                        onClick={onCancel}
                        className="p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-2"
                        title="Back to session"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}
                <div>
                    <h2 className="text-foreground text-xl font-bold">Configure Practice Session</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Setup your resume and target role to generate tailor-made questions.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl font-semibold mb-6 flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500 hover:opacity-75 font-bold ml-4">
                        Dismiss
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* PDF Resume Upload */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                        1. Upload PDF Resume
                    </label>

                    {!file && !uploading ? (
                        <div
                            onDragOver={e => {
                                e.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                                dragging
                                    ? "border-primary bg-primary/5 scale-[1.01]"
                                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                            }`}
                        >
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                    dragging ? "bg-primary/15" : "bg-muted"
                                }`}
                            >
                                <Upload size={20} className={dragging ? "text-primary" : "text-muted-foreground"} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-foreground">Drop your resume here</p>
                                <p className="text-xs text-muted-foreground mt-0.5">or click to browse files</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 bg-muted rounded border border-border text-muted-foreground font-mono">
                                PDF ONLY
                            </span>
                            <input
                                ref={fileRef}
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={e => {
                                    const selected = e.target.files[0];
                                    if (selected) handleUpload(selected);
                                }}
                            />
                        </div>
                    ) : uploading ? (
                        <div className="p-6 border border-border rounded-2xl bg-muted/20 flex flex-col items-center justify-center gap-3">
                            <Loader2 size={24} className="text-primary animate-spin" />
                            <p className="text-xs font-medium text-muted-foreground">Uploading resume to AI parser...</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <FileText size={18} className="text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{fileName}</p>
                                <p className="text-xs text-muted-foreground">{fileSize} MB · Parse successful</p>
                            </div>
                            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                            <button
                                type="button"
                                onClick={handleResetFile}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                title="Change file"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Job Metadata */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-0">
                        2. Job Target Details
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground">Company Name (Optional)</label>
                            <input
                                type="text"
                                value={company}
                                onChange={e => setCompany(e.target.value)}
                                placeholder="e.g. Google, Stripe"
                                className="w-full h-10 px-3.5 text-sm bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground">Target Role (Optional)</label>
                            <input
                                type="text"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                placeholder="e.g. Senior Frontend Engineer"
                                className="w-full h-10 px-3.5 text-sm bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Job Description</label>
                        <textarea
                            value={jd}
                            onChange={e => setJd(e.target.value)}
                            placeholder="Paste the target job description or requirements here... (Min 30 characters)"
                            rows={6}
                            required
                            className="w-full p-4 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all leading-relaxed"
                        />
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    type="submit"
                    disabled={!resumeId || !jd.trim() || jd.trim().length < 30 || generating}
                    className="w-full flex items-center justify-center gap-2 h-11 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98] transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                    {generating ? (
                        <>
                            <Loader2 size={16} className="animate-spin" /> Generating Interview Prep Questions...
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} /> Generate Interview Prep
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
