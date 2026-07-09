import { useEffect, useState } from "react";
import {
  X,
  Target,
  BriefcaseBusiness,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Select from "../../resume/components/resume/dashboard/Select";

const ROLE_LEVELS = {
  "Frontend Developer": ["Junior", "Mid-Level", "Senior"],
  "Backend Developer": ["Junior", "Mid-Level", "Senior"],
  "Full Stack Developer": ["Junior", "Mid-Level", "Senior"],
  "Software Engineer": ["Junior", "Mid-Level", "Senior"],
  "Data Analyst": ["Junior", "Mid-Level", "Senior"],
  "Data Scientist": ["Junior", "Mid-Level", "Senior"],
  "AI/ML Engineer": ["Junior", "Mid-Level", "Senior"],
  "DevOps Engineer": ["Junior", "Mid-Level", "Senior"],
  "Cloud Engineer": ["Junior", "Mid-Level", "Senior"],
  "Mobile Developer": ["Junior", "Mid-Level", "Senior"],
  "QA Engineer": ["Junior", "Mid-Level", "Senior"],
  "Cybersecurity Engineer": ["Junior", "Mid-Level", "Senior"],
};

const TARGET_ROLES = Object.keys(ROLE_LEVELS);

const LEVEL_DETAILS = {
  Junior: {
    label: "Junior",
    description: "0–2 years · Build strong foundations and job-ready projects",
  },
  "Mid-Level": {
    label: "Mid-Level",
    description:
      "2–5 years · Own features, architecture, testing, and delivery",
  },
  Senior: {
    label: "Senior",
    description:
      "5+ years · Lead architecture, scalability, and technical decisions",
  },
};

export default function UpdateRoleModal({
  isOpen,
  onClose,
  onSubmit,
  initialRole,
  initialLevel,
}) {
  const [role, setRole] = useState("Frontend Developer");
  const [level, setLevel] = useState("Junior");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const safeRole = ROLE_LEVELS[initialRole]
      ? initialRole
      : "Frontend Developer";

    const availableLevels = ROLE_LEVELS[safeRole];

    const safeLevel = availableLevels.includes(initialLevel)
      ? initialLevel
      : availableLevels[0];

    setRole(safeRole);
    setLevel(safeLevel);
    setLocalError("");
    setSubmitting(false);
  }, [isOpen, initialRole, initialLevel]);

  if (!isOpen) return null;

  const availableLevels = ROLE_LEVELS[role] || [];

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    const supportedLevels = ROLE_LEVELS[newRole] || [];

    setRole(newRole);
    setLocalError("");

    if (!supportedLevels.includes(level)) {
      setLevel(supportedLevels[0] || "");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!role) {
      setLocalError("Please select a target role.");
      return;
    }

    if (!level) {
      setLocalError("Please select a target level.");
      return;
    }

    if (!ROLE_LEVELS[role]?.includes(level)) {
      setLocalError(`${level} level is not currently available for ${role}.`);
      return;
    }

    setSubmitting(true);
    setLocalError("");

    try {
      await onSubmit(role, level);
    } catch (error) {
      console.error("Failed to update roadmap target:", error);

      setLocalError(
        error?.response?.data?.detail ||
          "Failed to update your target role. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close target role modal"
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Target className="text-primary" size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground">
                Update Target Role
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Your entire roadmap will adapt to this career target.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {localError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-3 text-xs font-medium text-red-500">
              {localError}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="target-role"
              className="flex items-center gap-2 text-xs font-semibold text-foreground"
            >
              <BriefcaseBusiness size={14} className="text-primary" />
              Target Role
            </label>

            <Select
              id="target-role"
              value={role}
              disabled={submitting}
              onChange={handleRoleChange}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {TARGET_ROLES.map((targetRole) => (
                <option key={targetRole} value={targetRole}>
                  {targetRole}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <TrendingUp size={14} className="text-primary" />
              Target Level
            </label>

            <div
              className={`grid grid-cols-1 gap-2 ${
                availableLevels.length === 3
                  ? "sm:grid-cols-3"
                  : availableLevels.length === 2
                    ? "sm:grid-cols-2"
                    : ""
              }`}
            >
              {availableLevels.map((levelValue) => {
                const details = LEVEL_DETAILS[levelValue];
                const selected = level === levelValue;

                return (
                  <button
                    key={levelValue}
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setLevel(levelValue);
                      setLocalError("");
                    }}
                    className={`rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                      selected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                        : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
                    }`}
                  >
                    <span
                      className={`block text-xs font-semibold ${
                        selected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {details?.label || levelValue}
                    </span>

                    <span className="mt-1 block text-[10px] leading-relaxed text-muted-foreground">
                      {details?.description || ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
            <p className="text-xs font-medium text-foreground">
              Your new roadmap
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Skills, readiness, learning phases, recommendations, and projects
              will be recalculated for{" "}
              <span className="font-semibold text-foreground">
                {level} {role}
              </span>
              .
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={handleClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Target size={15} />
                  Update Roadmap
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
