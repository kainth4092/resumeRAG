import { useState } from "react";
import { ChevronLeft, Mail } from "lucide-react";
import { Slide, Logo, Field, PrimaryButton } from "./AuthFlowShared";

export default function ForgotScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    try {
      setLoading(true);
      setError("");
      // Simulate API call for forgot password
      await new Promise((r) => setTimeout(r, 1600));
      setSent(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Slide animKey="forgot-success">
        <Logo />
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Mail
              size={28}
              className="text-emerald-600 dark:text-emerald-450"
            />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Check your inbox
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            We sent a password reset link to
            <br />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {email}
            </span>
          </p>
          <PrimaryButton onClick={onBack}>Back to Sign In</PrimaryButton>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="w-full mt-3 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350 py-2 transition-colors font-medium cursor-pointer"
          >
            Try a different email
          </button>
        </div>
      </Slide>
    );
  }

  return (
    <Slide animKey="forgot">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 mb-6 transition-colors group cursor-pointer"
      >
        <ChevronLeft
          size={14}
          className="group-hover:-translate-x-0.5 transition-transform"
        />{" "}
        Back to sign in
      </button>

      <Logo />

      <div className="text-center mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-1.5">
          Forgot your password?
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Enter your email and we'll send a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Email Address"
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setError("");
          }}
          placeholder="you@example.com"
          error={error}
          autoComplete="email"
          icon={<Mail size={16} />}
        />
        <PrimaryButton type="submit" loading={loading}>
          {loading ? "Sending…" : "Send Reset Link"}
        </PrimaryButton>
      </form>
    </Slide>
  );
}
