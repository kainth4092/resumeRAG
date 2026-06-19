import { Save, Download } from "lucide-react";

export default function ResumeToolbar({
    saving,
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
            <div className="flex gap-3">
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                    <Save size={16} />
                    Save
                </button>
                <button
                    onClick={onDownload}
                    className="px-4 py-2 border rounded-lg"
                >
                    <Download size={16} />
                    Download PDF
                </button>
            </div>
        </div>
    );
}