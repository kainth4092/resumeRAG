import { useEffect, useState } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import api from "../../../services/api";

let notificationSettingsCache = null;

function Toggle({ value, onChange, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`relative shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${value ? "bg-primary" : "bg-muted border border-border"}`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          value ? "translate-x-[18px]" : ""
        }`}
      />
    </button>
  );
}

function Row({ label, desc, value, onChange, disabled = false }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0 last:pb-0 first:pt-0">
      <div className="mr-4">
        <p className="text-sm font-semibold text-foreground">{label}</p>

        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>

      <Toggle value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}

const DEFAULT_SETTINGS = {
  email_notifications: true,
  weekly_digest: true,
  job_alerts: true,
  interview_alerts: true,
  roadmap_updates: true,
  product_updates: false,
};

export default function NotificationSettings() {
  const [settings, setSettings] = useState(
    () => notificationSettingsCache || DEFAULT_SETTINGS,
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (notificationSettingsCache) {
      return;
    }

    const fetchNotificationSettings = async () => {
      try {
        setError("");

        const response = await api.get("/settings/notifications", {
          bypassCache: true,
        });

        notificationSettingsCache = response.data;
        setSettings(response.data);
      } catch (err) {
        console.error("Failed to fetch notification settings:", err);

        setError(
          err?.response?.data?.detail ||
            "Failed to load notification settings.",
        );
      }
    };

    fetchNotificationSettings();
  }, []);

  const handleToggle = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const response = await api.put("/settings/notifications", settings);
      notificationSettingsCache = response.data;
      setSettings(response.data);

      setSuccess("Notification preferences saved successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to save notification settings:", err);

      setError(
        err?.response?.data?.detail || "Failed to save notification settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-foreground font-semibold">
          <span className="border-b border-primary">
            Notification Preferences
          </span>
        </h3>

        {success && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
            <Check size={13} />
            Saved!
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs font-medium text-red-500">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Email Notifications
        </h4>

        <Row
          label="Email Notifications"
          desc="Master control for receiving email notifications from ResuPilot."
          value={settings.email_notifications}
          onChange={(value) => handleToggle("email_notifications", value)}
          disabled={saving}
        />

        <Row
          label="Job Matches"
          desc="Receive notifications about jobs that match your target role."
          value={settings.job_alerts}
          onChange={(value) => handleToggle("job_alerts", value)}
          disabled={saving}
        />

        <Row
          label="Weekly Summary Report"
          desc="Receive a weekly summary of your resumes, applications, interviews, and career progress."
          value={settings.weekly_digest}
          onChange={(value) => handleToggle("weekly_digest", value)}
          disabled={saving}
        />
      </div>

      <div className="pt-4 border-t border-border space-y-1">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          In-App Notifications
        </h4>

        <Row
          label="Interview Alerts"
          desc="Get notified about interview preparation activity and shared questions."
          value={settings.interview_alerts}
          onChange={(value) => handleToggle("interview_alerts", value)}
          disabled={saving}
        />

        <Row
          label="Roadmap Updates"
          desc="Get notified when your career roadmap or target role is updated."
          value={settings.roadmap_updates}
          onChange={(value) => handleToggle("roadmap_updates", value)}
          disabled={saving}
        />

        {/* <Row
          label="Product Updates"
          desc="Receive notifications about new features and product improvements."
          value={settings.product_updates}
          onChange={(value) => handleToggle("product_updates", value)}
          disabled={saving}
        /> */}
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check size={14} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
