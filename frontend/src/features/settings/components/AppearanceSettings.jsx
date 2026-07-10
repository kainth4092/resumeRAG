import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const THEME_STORAGE_KEY = "theme";

const themeOptions = [
  {
    id: "light",
    label: "Light",
    description: "Always use light mode",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Always use dark mode",
    icon: Moon,
  },
  {
    id: "system",
    label: "System Default",
    description: "Automatically match your device theme",
    icon: Monitor,
  },
];

function getStoredTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || "system";
}

function applyTheme(theme) {
  const root = document.documentElement;

  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  const shouldUseDark =
    theme === "dark" || (theme === "system" && systemPrefersDark);

  root.classList.toggle("dark", shouldUseDark);

  root.style.colorScheme = shouldUseDark ? "dark" : "light";
}

export default function AppearanceSettings() {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  useEffect(() => {
    const syncTheme = (event) => {
      const savedTheme =
        event?.detail?.theme ||
        localStorage.getItem(THEME_STORAGE_KEY) ||
        "system";

      setTheme(savedTheme);
    };

    window.addEventListener("resupilot-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("resupilot-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    // Apply immediately — no refresh required.
    applyTheme(newTheme);

    // Notify other components if they listen for theme changes.
    window.dispatchEvent(
      new CustomEvent("resupilot-theme-change", {
        detail: { theme: newTheme },
      }),
    );
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-foreground">Appearance</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Choose how ResuPilot looks on your device.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const selected = theme === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleThemeChange(option.id)}
              className={`relative rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                  selected
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon size={17} />
              </div>

              <p
                className={`text-sm font-semibold ${
                  selected ? "text-primary" : "text-foreground"
                }`}
              >
                {option.label}
              </p>

              <p className="text-[11px] leading-relaxed text-muted-foreground mt-1">
                {option.description}
              </p>

              {selected && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
