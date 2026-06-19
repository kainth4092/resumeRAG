import { X } from "lucide-react";
import ResumeTemplate from "../resume/ResumeTemplate";

export default function PreviewModal({ previewOpen, setPreviewOpen, generatedResume }) {
    return (
        <>
            {previewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
                    <div className="relative w-full max-w-6xl bg-card border border-border rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <h3 className="text-foreground">Resume Preview</h3>
                            <button onClick={() => setPreviewOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-6 bg-muted/30 max-h-[90vh] overflow-y-auto">
                            <div className="bg-white rounded-2xl shadow-[var(--shadow-lg)] p-6 border border-black/5">
                                <ResumeTemplate resume={generatedResume} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}