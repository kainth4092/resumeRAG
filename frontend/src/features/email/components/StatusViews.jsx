import { CheckCircle2, AlertTriangle } from "lucide-react";

export function SuccessView({ onClose }) {
  return (
    <div className="flex flex-col items-center py-12 px-6 text-center animate-in fade-in-0 zoom-in-95 duration-350">
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 shadow-inner">
        <CheckCircle2 size={28} className="text-emerald-500 animate-bounce" />
      </div>
      <h3 className="text-foreground font-bold text-lg mb-2">Resume Sent!</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
        Your tailored resume has been sent successfully. Check your outbox or inbox shortly.
      </p>
      <button
        onClick={onClose}
        className="w-full py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-all cursor-pointer font-medium"
      >
        Dismiss
      </button>
    </div>
  );
}

export function ErrorView({ error, onRetry, onBack }) {
  return (
    <div className="flex flex-col items-center py-10 px-6 text-center animate-in fade-in-0 zoom-in-95 duration-250">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-destructive" />
      </div>
      <h3 className="text-foreground font-bold text-lg mb-2">Delivery Failed</h3>
      <p className="text-xs text-destructive bg-destructive/5 border border-destructive/10 rounded-xl p-3 mb-6 max-w-xs font-semibold leading-normal">
        {error || "We ran into an error while sending the email. Please check your credentials or API keys."}
      </p>
      <div className="flex gap-3 w-full">
        <button
          onClick={onBack}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          Modify Details
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
