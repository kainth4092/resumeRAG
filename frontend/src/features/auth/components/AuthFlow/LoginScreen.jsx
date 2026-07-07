import { useState } from "react";
import { ChevronLeft, Mail, Lock, Check, Eye, EyeOff } from "lucide-react";
import {
  Slide,
  Logo,
  Field,
  PrimaryButton,
  Divider,
  GoogleButton,
} from "./AuthFlowShared";
import { AuthAlert } from "../../pages/AuthComponents";

export default function LoginScreen({
  onLogin,
  onRegister,
  onForgot,
  onBack,
  onGoogleClick,
  googleLoading,
  alert,
  setAlert,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Please enter a valid email address";
    }
    if (!password) {
      e.password = "Password is required";
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setAlert(null);
      await onLogin({ email, password, remember });
    } catch (err) {
      void err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Slide animKey="login">
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
        Back
      </button>

      <Logo />

      <div className="text-center mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-1.5">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Continue building your career with ResuPilot AI.
        </p>
      </div>

      {alert && (
        <div className="mb-4">
          <AuthAlert type={alert.type} message={alert.message} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Email Address"
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setErrors((p) => ({ ...p, email: "" }));
          }}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
          icon={<Mail size={16} />}
          suffix={
            !errors.email &&
            email &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (
              <Check size={14} className="text-emerald-500" />
            ) : undefined
          }
        />

        <Field
          label="Password"
          type={showPw ? "text" : "password"}
          value={password}
          onChange={(v) => {
            setPassword(v);
            setErrors((p) => ({ ...p, password: "" }));
          }}
          placeholder="••••••••"
          error={errors.password}
          autoComplete="current-password"
          icon={<Lock size={16} />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />

        <div className="flex items-center justify-between pt-0.5">
          <button
            type="button"
            onClick={() => setRemember((r) => !r)}
            className="flex items-center gap-2 cursor-pointer group text-left focus:outline-none"
          >
            <div
              className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                remember
                  ? "bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500"
                  : "border-slate-300 dark:border-slate-700 group-hover:border-indigo-400 dark:group-hover:border-indigo-500"
              }`}
            >
              {remember && (
                <Check size={10} className="text-white" strokeWidth={3} />
              )}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Remember me
            </span>
          </button>
          <button
            type="button"
            onClick={onForgot}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        <div className="pt-1">
          <PrimaryButton type="submit" loading={loading}>
            {loading ? "Signing in…" : "Continue"}
          </PrimaryButton>
        </div>
      </form>

      <Divider />
      <GoogleButton onClick={onGoogleClick} loading={googleLoading} />

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onRegister}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
        >
          Create account
        </button>
      </p>
    </Slide>
  );
}
