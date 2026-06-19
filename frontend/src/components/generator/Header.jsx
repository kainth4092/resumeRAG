import { Download, Eye, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header({ showHistory, setShowHistory, generated, generatedResume }) {
    const navigate = useNavigate();

    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-foreground">Resume Generator</h1>
                <p className="text-sm text-muted-foreground mt-1">Upload your resume · analyze a job description · generate an ATS-optimized version.</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setShowHistory(h => !h)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${showHistory ? "border-primary/30 bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                    <History size={14} /> History {showHistory ? "▲" : "▼"}
                </button>
                {generated && (
                    <>
                        <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-all">
                            <Download size={14} /> PDF
                        </button>
                        <button onClick={() => navigate("/resume/editor", { state: { resume: generatedResume } })} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-all">
                            <Eye size={14} /> Preview
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}