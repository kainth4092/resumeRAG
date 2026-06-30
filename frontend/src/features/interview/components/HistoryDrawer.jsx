import { useState, useEffect } from "react";
import { X, Clock, Trash2, History } from "lucide-react";
import { getInterviewHistory, deleteInterviewSession } from "../services/interviewService";

export default function HistoryDrawer({
  open,
  onClose,
  onSelectSession,
  activeSessionId,
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getInterviewHistory();
      setHistory(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteInterviewSession(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!open) return null;

  return (
    <>

      <div
        className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">Interview History</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Load previous sessions and practice</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-xs gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span>Fetching history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20">
              <History className="mx-auto text-muted-foreground/30 mb-2.5" size={24} />
              <p className="text-sm font-semibold text-foreground">No sessions yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">Generated sessions will appear here.</p>
            </div>
          ) : (
            history.map((item) => {
              const active = activeSessionId === item.id;
              const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectSession(item.id);
                    onClose();
                  }}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${active
                    ? "bg-primary/5 border-primary/25 shadow-sm"
                    : "bg-card border-border hover:border-primary/20 hover:shadow-sm"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3 pr-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{item.company || "Interview Prep"}</p>
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.role || "Software Engineer"}</p>
                      <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        <Clock size={10} /> {dateStr}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="absolute right-3.5 top-3.5 w-7 h-7 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Delete session"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
