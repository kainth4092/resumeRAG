import { useState, useEffect } from "react";
import { Clock, Trash2, History, ChevronRight, X } from "lucide-react";
import {
  getInterviewHistory,
  deleteInterviewSession,
} from "../services/interviewService";

export default function SessionHistory({ onSelectSession, activeSessionId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getInterviewHistory();
      setHistory(data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load interview history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      setError("");
      setSuccess("");
      await deleteInterviewSession(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      setSuccess("Session deleted successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to delete session.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-xs gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span>Loading preparation history...</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-16 text-center max-w-xl mx-auto mt-8 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <History size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-foreground">
            No interview sessions yet
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Generate customized mock interview questions from your resume to
            start practicing. Your history will be recorded here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-semibold flex items-center justify-between animate-in fade-in-0 duration-200">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-semibold flex items-center justify-between animate-in fade-in-0 duration-200">
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            className="text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => {
          const active = activeSessionId === item.id;
          const dateStr = new Date(item.created_at).toLocaleDateString(
            undefined,
            {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          );

          return (
            <div
              key={item.id}
              onClick={() => onSelectSession(item.id)}
              className={`group relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-40 ${
                active
                  ? "bg-primary/5 border-primary/45 shadow-sm"
                  : "bg-card border-border hover:border-primary/20 hover:shadow-sm"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 pr-6">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-foreground tracking-tight">
                      {item.company || "Interview Prep"}
                    </p>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-semibold">
                  {item.role || "Software Engineer"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  <Clock size={11} />
                  <span>{dateStr}</span>
                </div>
                <span className="text-[10px] font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Resume Prep <ChevronRight size={10} />
                </span>
              </div>

              <button
                onClick={(e) => handleDelete(e, item.id)}
                className="absolute right-4 top-4 w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                title="Delete session"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
