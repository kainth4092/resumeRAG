import { useState, useEffect } from "react";
import { Save, Check } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import api from "../../../services/api";
import { Select } from "./ui/Select";

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
      />
    </div>
  );
}

export default function AccountSettings() {
  const { user, fetchUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [account, setAccount] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    timezone: "America/Los_Angeles",
  });

  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => {
        setAccount({
          name: user.name || "",
          email: user.email || "",
          phone: user.profile?.phone || "",
          location: user.profile?.location || "",
          headline: user.profile?.headline || "",
          timezone: localStorage.getItem("resupilot_timezone") || "America/Los_Angeles",
        });
      });
    }
  }, [user]);

  const handleChange = (key) => (val) => {
    setAccount((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put("/auth/settings/account", {
        name: account.name,
        email: account.email,
        phone: account.phone,
        location: account.location,
        headline: account.headline,
      });
      localStorage.setItem("resupilot_timezone", account.timezone);
      await fetchUser(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (!account.name) return "U";
    return account.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground">Personal Information</h3>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
            <Check size={13} /> Saved!
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-primary text-xl font-bold">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            getInitials()
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">{account.name || "User"}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{account.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" value={account.name} onChange={handleChange("name")} />
        <Field label="Email" value={account.email} onChange={handleChange("email")} type="email" />
        <Field label="Phone" value={account.phone} onChange={handleChange("phone")} />
        <Field label="Location" value={account.location} onChange={handleChange("location")} />
        <Field label="Job Title" value={account.headline} onChange={handleChange("headline")} />
        <div>
          <Select
            label="Timezone"
            options={["America/Los_Angeles", "America/New_York", "Europe/London", "Asia/Tokyo"].map((tz) => ({
              value: tz,
              label: tz,
            }))}
            value={account.timezone}
            onChange={handleChange("timezone")}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 transition-all cursor-pointer"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
