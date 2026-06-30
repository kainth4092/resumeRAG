import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ChallengeModal({ showModal, setShowModal, startChallengeSetup, loading }) {
  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Challenge Rules</h3>
                <p className="text-xs text-muted-foreground">Please read before starting</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Once started, the test <strong>cannot be paused</strong> or stopped.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>The timer runs continuously and will auto-submit at <strong>10:00</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Leaving the tab, switching windows, or reloading the page will trigger an automatic submission immediately.</strong></span>
              </li>
            </ul>

            <div className="flex gap-2.5 pt-2 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 h-10 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={startChallengeSetup}
                disabled={loading}
                className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={12} />
                    Loading...
                  </>
                ) : (
                  "Begin Test"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
