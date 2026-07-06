import { useState, forwardRef } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export const AuthInput = forwardRef(
  (
    { label, error, success, hint, icon, suffix, className = "", ...props },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div
          className={`
          relative flex items-center rounded-xl border bg-input-background transition-all duration-200
          ${
            error
              ? "border-destructive ring-2 ring-destructive/20"
              : success
                ? "border-emerald-500 ring-2 ring-emerald-500/20"
                : focused
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40"
          }
        `}
        >
          {icon && (
            <div className="pl-3.5 flex items-center shrink-0 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground
              focus:outline-none min-w-0 transition-colors
              ${icon ? "pl-2.5" : "pl-3.5"}
              ${suffix ? "pr-2" : "pr-3.5"}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <div className="pr-3 flex items-center shrink-0">{suffix}</div>
          )}
          {error && !suffix && (
            <div className="pr-3 shrink-0">
              <AlertCircle size={16} className="text-destructive" />
            </div>
          )}
          {success && !error && !suffix && (
            <div className="pr-3 shrink-0">
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-destructive flex items-center gap-1.5">
            <AlertCircle size={12} /> {error}
          </p>
        )}
        {!error && hint && (
          <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  },
);
AuthInput.displayName = "AuthInput";

export function PasswordInput({
  label,
  error,
  success,
  hint,
  value,
  onChange,
  placeholder,
  name,
  autoComplete,
}) {
  const [show, setShow] = useState(false);
  return (
    <AuthInput
      label={label}
      error={error}
      success={success}
      hint={hint}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder || "••••••••"}
      name={name}
      autoComplete={autoComplete}
      icon={
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      }
      suffix={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          tabIndex={-1}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  );
}
function getStrength(pw) {
  const checks = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const label =
    score <= 1
      ? "Very Weak"
      : score === 2
        ? "Weak"
        : score === 3
          ? "Fair"
          : score === 4
            ? "Strong"
            : "Very Strong";
  const color =
    score <= 1
      ? "bg-red-500"
      : score === 2
        ? "bg-orange-500"
        : score === 3
          ? "bg-amber-500"
          : score === 4
            ? "bg-lime-500"
            : "bg-emerald-500";
  return { score, label, color, checks };
}

export function PasswordStrengthMeter({ password }) {
  if (!password) return null;
  const { score, label, color, checks } = getStrength(password);
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : "bg-border"}`}
          />
        ))}
      </div>
      <p
        className={`text-xs font-medium ${score <= 2 ? "text-red-500" : score === 3 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"}`}
      >
        {label}
      </p>
      <div className="grid grid-cols-2 gap-1">
        {[
          { key: "length", label: "8+ characters" },
          { key: "upper", label: "Uppercase letter" },
          { key: "lower", label: "Lowercase letter" },
          { key: "number", label: "Number" },
          { key: "special", label: "Special character" },
        ].map((r) => (
          <div key={r.key} className="flex items-center gap-1.5">
            {checks[r.key] ? (
              <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/30 shrink-0" />
            )}
            <span
              className={`text-[11px] ${checks[r.key] ? "text-foreground" : "text-muted-foreground"}`}
            >
              {r.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthCheckbox({ id, label, checked, onChange, error }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-start gap-2.5 cursor-pointer group"
      >
        <div
          className={`
          w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
          ${checked ? "bg-primary border-primary" : error ? "border-destructive" : "border-border group-hover:border-primary/60"}
        `}
        >
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4l3 3 5-6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span className="text-sm text-muted-foreground leading-relaxed">
          {label}
        </span>
      </label>
      {error && (
        <p className="mt-1 text-xs text-destructive flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthButton({
  children,
  loading,
  disabled,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
}) {
  const base =
    "w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card";
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25",
    secondary:
      "bg-muted text-foreground hover:bg-muted/70 active:scale-[0.98] focus:ring-primary/50 disabled:opacity-50",
    outline:
      "border border-border bg-card text-foreground hover:bg-muted hover:border-primary/40 active:scale-[0.98] focus:ring-primary/50 disabled:opacity-50",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 size={16} className="animate-spin shrink-0" />}
      {children}
    </button>
  );
}

export function GoogleButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 active:scale-[0.98] transition-all duration-200 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 shadow-sm"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
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

export function AuthDivider({ label = "OR" }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export function AuthAlert({ type, message }) {
  const styles = {
    error:
      "bg-destructive/10 border-destructive/25 text-destructive dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/30",
    success:
      "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30",
    info: "bg-primary/10 border-primary/25 text-primary dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-900/30",
  };
  const icons = {
    error: <AlertCircle size={15} className="shrink-0" />,
    success: <CheckCircle2 size={15} className="shrink-0" />,
    info: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  };
  return (
    <div
      className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-sm ${styles[type]}`}
    >
      {icons[type]}
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
