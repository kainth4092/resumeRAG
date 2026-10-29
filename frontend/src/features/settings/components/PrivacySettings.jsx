import { useState } from "react";
import { Download, Trash2, ShieldCheck, FileText, AlertCircle, Loader2 } from "lucide-react";
import DeleteAccountModal from "./DeleteAccountModal";
import api from "../../../services/api";

export default function PrivacySettings() {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const handleExportData = async () => {
    try {
      setExporting(true);
      setExportError("");
      const response = await api.get("/account/export", {
        bypassCache: true,
      });

      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `resupilot_account_export_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export account data:", err);
      setExportError(
        err?.response?.data?.detail || "Failed to generate account export. Please try again."
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Data Protection & Rights */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-foreground font-semibold">
            <span className="border-b border-primary">Data Protection & Privacy</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            ResuPilot AI adheres to strict data minimization, GDPR, and CCPA privacy standards.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border/80 bg-muted/40 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Zero AI Model Training</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Your resume text, contact details, and career history are processed strictly for
                real-time inference via secure enterprise endpoints (OpenRouter, Groq, OpenAI).
                Your data is never used to train public or foundation AI models.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2 border-t border-border/60">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Data Rights & Portability</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Under GDPR Article 20 and CCPA, you have the right to receive all your personal
                data in a structured, commonly used, machine-readable JSON format.
              </p>
            </div>
          </div>
        </div>

        {exportError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs font-medium text-red-500">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Export Account Data</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Download all your resumes, scores, job matches, and profile history as a single JSON file.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0 ml-4"
          >
            {exporting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating Export...
              </>
            ) : (
              <>
                <Download size={14} />
                Export JSON
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-destructive font-bold text-sm">Danger Zone</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently remove your ResuPilot dashboard profile, uploaded resumes, AI interview
            history, and vector search embeddings. This cannot be undone.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive hover:bg-destructive/95 text-white text-xs font-bold transition-all cursor-pointer"
        >
          <Trash2 size={14} /> Delete Account & All Data...
        </button>
      </div>

      <DeleteAccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
