import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { Logo, Field, PrimaryButton } from "../components/AuthFlow/AuthFlowShared";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the URL. Please request a new link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        token: token.trim(),
        new_password: password,
      });
      setSuccess(true);
    } catch (err) {
      console.error("Password reset failed:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to reset password. The link may have expired or is invalid."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <Logo />

        {success ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Password Reset Complete
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
            <div className="pt-2">
              <PrimaryButton onClick={() => navigate("/login")}>
                Sign In Now
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Lock size={20} />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Set New Password
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your new password below to regain access to your account.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!token && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs">
                No reset token found in this link. Please request a new password reset link from the login page.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />

              <Field
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />

              <PrimaryButton type="submit" loading={loading} disabled={!token || loading}>
                Update Password
              </PrimaryButton>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
