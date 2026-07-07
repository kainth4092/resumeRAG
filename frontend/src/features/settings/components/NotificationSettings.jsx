import { useState } from "react";
import { Check } from "lucide-react";

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

export default function NotificationSettings() {
  const [notif, setNotif] = useState(() => {
    const cached = localStorage.getItem("resupilot_notifications");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback to default
      }
    }
    return {
      resumeHits: true,
      jobMatches: true,
      weeklySummary: false,
      appUpdates: true,
      interviewAlerts: true,
    };
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key, val) => {
    const updated = { ...notif, [key]: val };
    setNotif(updated);
    localStorage.setItem("resupilot_notifications", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Row = ({ label, desc, stateKey }) => (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0 last:pb-0 first:pt-0">
      <div className="mr-4">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <Toggle value={notif[stateKey]} onChange={(v) => handleChange(stateKey, v)} />
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-bold text-sm">Notifications Preferences</h3>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
            <Check size={13} /> Saved!
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Notifications</h4>
        <Row
          label="Resume Hits & Feedback"
          desc="Get notified when AI resume scanner rates your uploaded resume."
          stateKey="resumeHits"
        />
        <Row
          label="Job Matches"
          desc="Receive daily email summaries of job postings that match your target role."
          stateKey="jobMatches"
        />
        <Row
          label="Weekly Summary Report"
          desc="A summary of your dashboard activity, resumes, and interview performance."
          stateKey="weeklySummary"
        />
      </div>

      <div className="pt-4 border-t border-border space-y-1">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">In-App & Push Notifications</h4>
        <Row
          label="Application Updates"
          desc="Get updates when new features and performance enhancements are released."
          stateKey="appUpdates"
        />
        <Row
          label="Interview Alerts"
          desc="Alerts and reminders for scheduled mock interviews and feedback reviews."
          stateKey="interviewAlerts"
        />
      </div>
    </div>
  );
}
