import { useState } from "react";
import { Check, Download, Trash2 } from "lucide-react";
import DeleteAccountModal from "./DeleteAccountModal";

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative flex-shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer ${
        value ? "bg-primary" : "bg-muted border border-border"
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          value ? "translate-x-[18px]" : ""
        }`}
      />
    </button>
  );
}

export default function PrivacySettings() {
  const [privacy, setPrivacy] = useState({
    shareAnalytics: true,
    personalizeJobs: true,
  });
  const [saved, setSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleChange = (key, val) => {
    const updated = { ...privacy, [key]: val };
    setPrivacy(updated);
    localStorage.setItem("resupilot_privacy", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      privacy,
      settings_v: 1,
      exported_at: new Date().toISOString()
    }));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "resupilot_settings_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-bold text-sm">Privacy & Preference</h3>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
              <Check size={13} /> Saved!
            </span>
          )}
        </div>

        <div className="flex items-start justify-between py-3 border-b border-border">
          <div className="mr-4">
            <p className="text-sm font-semibold text-foreground">Usage Analytics</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Share anonymous click and hover analytics data to help us improve the AI models.
            </p>
          </div>
          <Toggle value={privacy.shareAnalytics} onChange={(v) => handleChange("shareAnalytics", v)} />
        </div>

        <div className="flex items-start justify-between py-3">
          <div className="mr-4">
            <p className="text-sm font-semibold text-foreground">AI Personalization</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use job matching metadata history to customize recommended questions and resume insights.
            </p>
          </div>
          <Toggle value={privacy.personalizeJobs} onChange={(v) => handleChange("personalizeJobs", v)} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-foreground font-bold text-sm">Data Portability</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Download a copy of your personal settings, resume metadata, and logs.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
        >
          <Download size={14} /> Export Settings Data
        </button>
      </div>

      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-destructive font-bold text-sm">Danger Zone</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently remove your ResuPilot dashboard profile and settings. This cannot be undone.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive hover:bg-destructive/95 text-white text-xs font-bold transition-all cursor-pointer"
        >
          <Trash2 size={14} /> Delete Account...
        </button>
      </div>

      <DeleteAccountModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
