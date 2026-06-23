import { useEffect, useState } from "react";
import { Eye, History, Trash2, X } from "lucide-react";
import { interviewService } from "../../services/interviewService";

export default function HistoryDrawer({ onClose, onOpenSession, onSessionDeleted }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await interviewService.getHistory();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const deleteHistory = async (id) => {
    try {
      await interviewService.deleteSession(id);
      setHistory((prev) => prev.filter((x) => x.id !== id));
      if (onSessionDeleted) {
        onSessionDeleted(id);
      }
    } catch (error) {
      console.error("Failed to delete history:", error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-card border-l border-border z-50 flex flex-col shadow-[var(--shadow-lg)] animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <History size={14} className="text-primary" />
            </div>
            <h3 className="text-foreground font-semibold">Interview History</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={17} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="text-muted-foreground">Loading…</div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <History size={26} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">No history yet</p>
              <p className="text-xs text-muted-foreground">Complete a session to see it here.</p>
            </div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="bg-background border border-border rounded-2xl p-4 hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#635BFF" }}>
                      {h.company?.[0] || "I"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{h.company || "Interview"}</p>
                      <p className="text-xs text-muted-foreground">{h.role || "Session"}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { l: "Questions", v: h.questions_count },
                    { l: "Date", v: new Date(h.created_at).toLocaleDateString() },
                  ].map((d) => (
                    <div key={d.l} className="p-2 bg-muted/40 rounded-xl text-center">
                      <p className="text-[10px] text-muted-foreground">{d.l}</p>
                      <p className="text-xs font-semibold text-foreground truncate">{d.v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (onOpenSession) onOpenSession(h.id);
                      onClose();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    <Eye size={12} /> Open
                  </button>
                  <button onClick={() => deleteHistory(h.id)} className="w-8 h-8 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
