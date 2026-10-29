import { X, Sparkles, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModalA11y } from "../../../hooks/useModalA11y";

export default function AuthPromptModal({ isOpen, onClose, title, actionText }) {
  const navigate = useNavigate();
  const modalRef = useModalA11y({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 outline-none"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles size={18} className="fill-indigo-600 dark:fill-indigo-400" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Unlock Copilot Feature
            </span>
          </div>

          <div className="space-y-2">
            <h3 id="auth-modal-title" className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title || "Create an account to continue"}
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              {actionText || "Get access to your personalized AI Career Copilot, resume editor, ATS tools, and mock interviews."}
            </p>
          </div>

          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl text-xs text-slate-600 dark:text-slate-350">
            {[
              "Real-time ATS parsing & score check",
              "Personalized mock interview simulations",
              "Unlimited resume export in PDF & DOCX format",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                onClose();
                navigate("/register");
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              Sign Up Free with Email
            </button>
            <button
              onClick={() => {
                onClose();
                navigate("/login");
              }}
              className="w-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold py-3 rounded-xl text-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              Already Have an Account? Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
