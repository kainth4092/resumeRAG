import { useState, useEffect } from "react";
import { Save, Check } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import api from "../../../services/api";

function Field({ label, value, onChange, type = "text", disabled = false }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-2">
        {label}
      </label>

      <input
        type={type}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-11 px-3.5 rounded-xl border border-border text-sm transition-all ${
          disabled
            ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
            : "bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        }`}
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
  });

  const getUserName = (userData) => {
    if (typeof userData?.name === "string") {
      return userData.name.trim();
    }

    if (typeof userData?.full_name === "string") {
      return userData.full_name.trim();
    }

    if (typeof userData?.profile?.name === "string") {
      return userData.profile.name.trim();
    }

    const firstName =
      typeof userData?.first_name === "string"
        ? userData.first_name.trim()
        : "";

    const lastName =
      typeof userData?.last_name === "string" ? userData.last_name.trim() : "";

    return `${firstName} ${lastName}`.trim();
  };

  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => {
        setAccount({
          name: getUserName(user),
          email: typeof user.email === "string" ? user.email : "",
          phone:
            typeof user.profile?.phone === "string" ? user.profile.phone : "",
          location:
            typeof user.profile?.location === "string"
              ? user.profile.location
              : "",
          headline:
            typeof user.profile?.headline === "string"
              ? user.profile.headline
              : "",
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
        name: account.name.trim(),
        email: account.email,
        phone: account.phone.trim(),
        location: account.location.trim(),
        headline: account.headline.trim(),
      });
      await fetchUser(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Failed to update profile settings.",
      );
    } finally {
      setSaving(false);
    }
  };
  const getInitials = () => {
    const name = typeof account.name === "string" ? account.name.trim() : "";

    if (!name) return "U";

    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-semibold ">
          <span className="border-b border-primary">Personal Information</span>
        </h3>
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
            <img
              src={user.avatar_url}
              alt="Avatar"
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            getInitials()
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {account.name || "User"}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {account.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Full Name"
          value={account.name}
          onChange={handleChange("name")}
        />
        <Field
          label="Email"
          value={account.email}
          onChange={handleChange("email")}
          type="email"
          disabled
        />
        <Field
          label="Phone"
          value={account.phone}
          onChange={handleChange("phone")}
        />
        <Field
          label="Location"
          value={account.location}
          onChange={handleChange("location")}
        />
        <Field
          label="Job Title"
          value={account.headline}
          onChange={handleChange("headline")}
        />
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
