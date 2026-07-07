import { useState } from "react";
import {
  ChevronLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import {
  Slide,
  Logo,
  Field,
  PasswordStrength,
  PrimaryButton,
  Divider,
  GoogleButton,
} from "./AuthFlowShared";
import { AuthAlert } from "../../pages/AuthComponents";

export default function RegisterScreen({
  onSignup,
  onLogin,
  onBack,
  onGoogleClick,
  googleLoading,
  alert,
  setAlert,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) {
      e.name = "Full name is required";
    }
    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email address";
    }
    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 8) {
      e.password = "Password must be at least 8 characters";
    }
    if (!form.confirm) {
      e.confirm = "Please confirm your password";
    } else if (form.confirm !== form.password) {
      e.confirm = "Passwords do not match";
    }
    if (!agreed) {
      e.terms = "You must agree to the Terms of Service and Privacy Policy";
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
      await onSignup(form);
    } catch (err) {
      void err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Slide animKey="register">
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
          Create your workspace
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Free AI-powered career workspace. No credit card needed.
        </p>
      </div>

      {alert && (
        <div className="mb-4">
          <AuthAlert type={alert.type} message={alert.message} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Full Name"
          value={form.name}
          onChange={set("name")}
          placeholder="Jordan Davis"
          error={errors.name}
          autoComplete="name"
          icon={<User size={16} />}
        />

        <Field
          label="Email Address"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
          icon={<Mail size={16} />}
        />

        <div>
          <Field
            label="Password"
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            placeholder="Create a strong password"
            error={errors.password}
            autoComplete="new-password"
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
          <PasswordStrength password={form.password} />
        </div>

        <Field
          label="Confirm Password"
          type={showConfirm ? "text" : "password"}
          value={form.confirm}
          onChange={set("confirm")}
          placeholder="Repeat your password"
          error={errors.confirm}
          autoComplete="new-password"
          icon={<Lock size={16} />}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />

        {/* Terms and conditions */}
        <div className="text-left">
          <button
            type="button"
            onClick={() => setAgreed((a) => !a)}
            className="flex items-start gap-2.5 cursor-pointer group focus:outline-none text-left"
          >
            <div
              className={`mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                agreed
                  ? "bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500"
                  : "border-slate-300 dark:border-slate-700 group-hover:border-indigo-400 dark:group-hover:border-indigo-500"
              }`}
            >
              {agreed && (
                <Check size={10} className="text-white" strokeWidth={3} />
              )}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed select-none">
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Privacy Policy
              </a>
            </span>
          </button>
          {errors.terms && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 ml-6.5">
              {errors.terms}
            </p>
          )}
        </div>

        <div className="pt-1">
          <PrimaryButton type="submit" loading={loading} disabled={!agreed}>
            {loading ? "Creating workspace…" : "Create Free Account"}
          </PrimaryButton>
        </div>
      </form>

      <Divider />
      <GoogleButton onClick={onGoogleClick} loading={googleLoading} />

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onLogin}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </Slide>
  );
}
