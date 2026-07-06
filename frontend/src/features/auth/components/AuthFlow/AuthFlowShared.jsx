import { useState, forwardRef } from "react";
import { Zap, AlertCircle, RefreshCw } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-8">
      <div className="w-9 h-9 rounded-[12px] bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
        <Zap size={18} className="text-white" />
      </div>
      <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
        ResuPilot{" "}
        <span className="text-indigo-600 dark:text-indigo-400">AI</span>
      </span>
    </div>
  );
}

export function Divider({ label = "or" }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export function GoogleButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 h-12 border border-slate-200 dark:border-slate-800 rounded-[14px] bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98] transition-all text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm disabled:opacity-50 cursor-pointer"
    >
      {loading ? (
        <RefreshCw
          size={16}
          className="animate-spin text-slate-400 dark:text-slate-500"
        />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      Continue with Google
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  loading,
  disabled,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-2 h-12 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-[14px] text-sm font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading && <RefreshCw size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export const Field = forwardRef(
  (
    {
      label,
      type = "text",
      value,
      onChange,
      placeholder,
      error,
      icon,
      suffix,
      autoComplete,
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    return (
      <div className="w-full text-left">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 tracking-wide">
          {label}
        </label>
        <div
          className={`relative flex items-center rounded-[14px] border bg-slate-50/50 dark:bg-slate-900/50 transition-all duration-200 ${
            error
              ? "border-red-400 dark:border-red-500/80 ring-2 ring-red-400/15 dark:ring-red-500/15"
              : focused
                ? "border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-400/15 dark:ring-indigo-500/15"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          {icon && (
            <div className="pl-4 text-slate-400 dark:text-slate-500 flex-shrink-0">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`flex-1 h-12 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none min-w-0 ${
              icon ? "pl-3" : "pl-4"
            } ${suffix ? "pr-2" : "pr-4"}`}
          />
          {suffix && <div className="pr-3 flex-shrink-0">{suffix}</div>}
          {error && !suffix && (
            <AlertCircle
              size={15}
              className="text-red-400 dark:text-red-500 mr-3 flex-shrink-0"
            />
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={12} /> {error}
          </p>
        )}
      </div>
    );
  },
);
Field.displayName = "Field";

function strengthInfo(pw) {
  const checks = {
    len: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    num: /\d/.test(pw),
    sym: /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const labels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["", "#EF4444", "#F97316", "#F59E0B", "#22C55E", "#10B981"];
  return {
    score,
    label: labels[score] || "",
    color: colors[score] || "",
    checks,
  };
}

export function PasswordStrength({ password }) {
  if (!password) return null;
  const { score, label, color, checks } = strengthInfo(password);
  return (
    <div className="mt-2.5 space-y-2 text-left">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? "" : "bg-slate-200 dark:bg-slate-800"
            }`}
            style={i <= score ? { backgroundColor: color } : undefined}
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-semibold" style={{ color }}>
          {label}
        </span>
        <div className="flex gap-1 flex-wrap">
          {[
            ["8+ chars", checks.len],
            ["Uppercase", checks.upper],
            ["Number", checks.num],
            ["Symbol", checks.sym],
          ].map(([l, ok]) => (
            <span
              key={l}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                ok
                  ? "bg-emerald-100 dark:bg-emerald-950/55 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
              }`}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Slide({ children, animKey }) {
  return (
    <div
      key={animKey}
      className="animate-in fade-in-0 slide-in-from-bottom-3 duration-300"
    >
      {children}
    </div>
  );
}
