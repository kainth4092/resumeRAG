import { useState, useEffect, useRef } from "react";
import { Mail, RefreshCw } from "lucide-react";
import { Slide, Logo, PrimaryButton } from "./AuthFlowShared";

export default function VerifyScreen({ email, onVerified }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState("");
  const refs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleChange = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = d;
    setCode(next);
    setError("");
    if (d && i < 5) refs.current[i + 1]?.focus();
    if (!d && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const next = [...code];
    pasted.split("").forEach((c, idx) => {
      if (idx < 6) next[idx] = c;
    });
    setCode(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const verify = async () => {
    if (code.join("").length < 6) {
      setError("Enter the complete 6-digit code");
      return;
    }
    try {
      setLoading(true);
      await onVerified(code.join(""));
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      setResending(true);
      setError("");
      await new Promise((r) => setTimeout(r, 1500));
      setCountdown(60);
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Slide animKey="verify">
      <Logo />
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Mail size={28} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2 text-center">
          Verify your email
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed text-center">
          We sent a 6-digit code to
          <br />
          <span className="font-semibold text-slate-700 dark:text-slate-350">
            {email || "your email"}
          </span>
        </p>
      </div>

      {/* OTP Code */}
      <div className="text-center">
        <label className="block text-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 tracking-wide select-none">
          Enter verification code
        </label>
        <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !code[i] && i > 0) {
                  refs.current[i - 1]?.focus();
                }
              }}
              className={`w-11 h-14 text-center text-xl font-bold rounded-[14px] border-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none transition-all
                ${
                  digit
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/15 dark:focus:ring-indigo-500/15"
                }
                ${error ? "border-red-400 dark:border-red-500/80" : ""}`}
            />
          ))}
        </div>
        {error && (
          <p className="text-center text-xs text-red-500 dark:text-red-400 mt-2">
            {error}
          </p>
        )}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2">
          You can paste the code directly
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <PrimaryButton
          onClick={verify}
          loading={loading}
          disabled={code.join("").length < 6}
        >
          {loading ? "Verifying…" : "Verify Email"}
        </PrimaryButton>
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1.5 text-center">
            Didn't receive it?
          </p>
          {countdown > 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              Resend available in{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-350">
                {countdown}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold mx-auto disabled:opacity-50 transition-colors cursor-pointer"
            >
              {resending ? (
                <>
                  <RefreshCw size={13} className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <RefreshCw size={13} /> Resend code
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Slide>
  );
}
