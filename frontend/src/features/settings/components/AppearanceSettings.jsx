import { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";

export default function AppearanceSettings() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
      return "light";
    }
    return "light";
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new Event("storage"));
  }, [theme]);

  const selectTheme = (newTheme) => {
    setTheme(newTheme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Card = ({ id, label, icon: Icon, desc }) => (
    <button
      onClick={() => selectTheme(id)}
      className={`w-full flex items-start gap-4 p-4 border rounded-2xl transition-all text-left cursor-pointer ${
        theme === id
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border hover:border-muted-foreground/30 hover:bg-muted/10 bg-card"
      }`}
    >
      <div className={`p-2.5 rounded-xl ${theme === id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {theme === id && <Check size={14} className="text-primary shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </button>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-bold text-sm">Theme Settings</h3>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
            <Check size={13} /> Saved!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card
          id="light"
          label="Light Theme"
          icon={Sun}
          desc="Clean, high-contrast bright mode interface."
        />
        <Card
          id="dark"
          label="Dark Theme"
          icon={Moon}
          desc="Vibrant dark mode for reduced eye strain."
        />
        <Card
          id="system"
          label="System Default"
          icon={Monitor}
          desc="Matches your system operating system settings."
        />
      </div>
    </div>
  );
}
