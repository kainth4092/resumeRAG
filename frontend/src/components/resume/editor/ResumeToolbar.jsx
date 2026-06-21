import { Save, Download } from "lucide-react";

export default function ResumeToolbar({
    saving,
    saveStatus,
    onSave,
    onDownload,
}) {
    return (
        <div className="flex items-center justify-between bg-card border rounded-xl p-4 mb-5">
            <div>
                <h2 className="text-lg font-semibold">
                    Resume Editor
                </h2>
                <p className="text-sm text-muted-foreground">
                    Professional Template
                </p>
            </div>
            <div className="flex items-center gap-3">
                {saveStatus === "saving" && (
                    <span className="text-xs text-muted-foreground animate-pulse font-medium">
                        Saving...
                    </span>
                )}
                {saveStatus === "saved" && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-full font-semibold flex items-center gap-1">
                        ✓ Saved
                    </span>
                )}
                {saveStatus === "error" && (
                    <span className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-full font-semibold flex items-center gap-1">
                        ✗ Failed to save
                    </span>
                )}
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-75 transition-all shadow-sm shadow-primary/20 hover:shadow-md active:scale-[0.98]"
                >
                    <Save size={14} />
                    Save
                </button>
                <button
                    onClick={onDownload}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-muted active:scale-[0.98] transition-all"
                >
                    <Download size={14} />
                    Download PDF
                </button>
            </div>
        </div>
    );
}