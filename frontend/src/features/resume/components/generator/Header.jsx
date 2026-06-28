import { ArrowLeft } from "lucide-react";

export default function Header({ onBack }) {
    return (
        <div className="flex items-start justify-between gap-4 font-sans">
            <div className="flex items-center gap-3">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="w-9 h-9 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground flex items-center justify-center shrink-0 transition-all cursor-pointer"
                        title="Back to Resumes list"
                    >
                        <ArrowLeft size={16} />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">New Resume Generator</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Upload a resume, paste a job description, select a template, and generate an ATS-optimized version.</p>
                </div>
            </div>
        </div>
    );
}