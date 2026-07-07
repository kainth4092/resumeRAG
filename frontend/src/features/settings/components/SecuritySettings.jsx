import { useState } from "react";
import { Lock, Eye, EyeOff, AlertTriangle, Check } from "lucide-react";
import api from "../../../services/api";

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

export default function SecuritySettings() {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [twoFactor, setTwoFactor] = useState(() => {
    return localStorage.getItem("resupilot_2fa") === "true";
  });

  const handleToggle2FA = (val) => {
    setTwoFactor(val);
    localStorage.setItem("resupilot_2fa", String(val));
  };

  const handleSavePw = async () => {
    setPwError("");
    setPwSaved(false);
    if (!pw.current) {
      setPwError("Current password is required");
      return;
    }
    if (pw.next.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwError("Passwords do not match");
      return;
    }

    setPwSaving(true);
    try {
      await api.put("/auth/settings/password", {
        current_password: pw.current,
        new_password: pw.next,
      });
      setPwSaved(true);
      setPw({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setPwError(err.response?.data?.detail || "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  };

  const PWInput = ({ label, showKey, value, onChange }) => (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPw[showKey] ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPw((s) => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {showPw[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-bold text-sm">Change Password</h3>
          {pwSaved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
              <Check size={13} /> Password updated!
            </span>
          )}
        </div>

        {pwError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
            <AlertTriangle size={14} className="shrink-0" /> {pwError}
          </div>
        )}

        <PWInput
          label="Current Password"
          showKey="current"
          value={pw.current}
          onChange={(v) => setPw((p) => ({ ...p, current: v }))}
        />
        <PWInput
          label="New Password"
          showKey="next"
          value={pw.next}
          onChange={(v) => setPw((p) => ({ ...p, next: v }))}
        />
        <PWInput
          label="Confirm New Password"
          showKey="confirm"
          value={pw.confirm}
          onChange={(v) => setPw((p) => ({ ...p, confirm: v }))}
        />

        <button
          onClick={handleSavePw}
          disabled={pwSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-70 transition-all cursor-pointer"
        >
          {pwSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Lock size={14} />
          )}
          {pwSaving ? "Updating..." : "Update Password"}
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add an extra layer of security to your account.
            </p>
          </div>
          <Toggle value={twoFactor} onChange={handleToggle2FA} />
        </div>
      </div>
    </div>
  );
}
