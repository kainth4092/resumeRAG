import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import DeleteAccountModal from "./DeleteAccountModal";
import api from "../../../services/api";

let privacySettingsCache = null;

function Toggle({ value, onChange, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onChange(!value);
        }
      }}
      className={`relative shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
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
  const DEFAULT_PRIVACY = {
    share_analytics: true,
    personalize_jobs: true,
  };
  const [privacy, setPrivacy] = useState(
    () => privacySettingsCache || DEFAULT_PRIVACY,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (privacySettingsCache) {
      setLoading(false);
      return;
    }

    const fetchPrivacySettings = async () => {
      try {
        setError("");

        const response = await api.get("/settings/privacy", {
          bypassCache: true,
        });

        privacySettingsCache = response.data;
        setPrivacy(response.data);
      } catch (err) {
        console.error("Failed to fetch privacy settings:", err);

        setError(
          err?.response?.data?.detail || "Failed to load privacy settings.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacySettings();
  }, []);

  const handleChange = async (key, value) => {
    if (saving) return;

    const previousPrivacy = { ...privacy };

    const updatedPrivacy = {
      ...privacy,
      [key]: value,
    };

    setPrivacy(updatedPrivacy);
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await api.put("/settings/privacy", updatedPrivacy);
      privacySettingsCache = response.data;
      setPrivacy(response.data);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to save privacy settings:", err);

      setPrivacy(previousPrivacy);

      setError(
        err?.response?.data?.detail || "Failed to save privacy settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-semibold">
            {" "}
            <span className="border-b border-primary">
              Privacy & Preference
            </span>
          </h3>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
              <Check size={13} /> Saved!
            </span>
          )}
        </div>

        <div className="flex items-start justify-between py-3 border-b border-border">
          <div className="mr-4">
            <p className="text-sm font-semibold text-foreground">
              Usage Analytics
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Share anonymous click and hover analytics data to help us improve
              the AI models.
            </p>
          </div>
          <Toggle
            value={privacy.share_analytics}
            onChange={(v) => handleChange("share_analytics", v)}
            disabled={loading || saving}
          />
        </div>

        <div className="flex items-start justify-between py-3">
          <div className="mr-4">
            <p className="text-sm font-semibold text-foreground">
              AI Personalization
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use job matching metadata history to customize recommended
              questions and resume insights.
            </p>
          </div>
          <Toggle
            value={privacy.personalize_jobs}
            onChange={(v) => handleChange("personalize_jobs", v)}
            disabled={loading || saving}
          />
        </div>
      </div>

      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-destructive font-bold text-sm">Danger Zone</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently remove your ResuPilot dashboard profile and settings.
            This cannot be undone.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive hover:bg-destructive/95 text-white text-xs font-bold transition-all cursor-pointer"
        >
          <Trash2 size={14} /> Delete Account...
        </button>
      </div>

      <DeleteAccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
