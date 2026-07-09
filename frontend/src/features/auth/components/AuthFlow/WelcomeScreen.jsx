import { ArrowRight } from "lucide-react";
import { Slide, Logo, PrimaryButton, GoogleButton } from "./AuthFlowShared";
import { AuthAlert } from "../../pages/AuthComponents";

export default function WelcomeScreen({
  onContinueEmail,
  onGoogleClick,
  googleLoading,
  onSignIn,
  alert,
}) {
  return (
    <Slide animKey="welcome" className="overflow-x-hidden">
      <Logo />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          Your AI Career Copilot
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
          Build ATS-ready resumes. Practice interviews.
          <br />
          Discover jobs. Track applications.
          <br />
          All in one intelligent workspace.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { emoji: "✦", label: "AI Resume Builder" },
          { emoji: "✦", label: "ATS Analysis" },
          { emoji: "✦", label: "Interview Prep" },
          { emoji: "✦", label: "Job Tracker" },
        ].map((f) => (
          <span
            key={f.label}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 rounded-full text-xs font-semibold select-none"
          >
            <span className="text-[9px] text-indigo-400 dark:text-indigo-500">
              {f.emoji}
            </span>
            {f.label}
          </span>
        ))}
      </div>

      {alert && (
        <div className="mb-5">
          <AuthAlert type={alert.type} message={alert.message} />
        </div>
      )}

      <div className="space-y-3">
        <PrimaryButton onClick={onContinueEmail}>
          Continue with Email <ArrowRight size={15} />
        </PrimaryButton>
        <GoogleButton onClick={onGoogleClick} loading={googleLoading} />
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSignIn}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </Slide>
  );
}
