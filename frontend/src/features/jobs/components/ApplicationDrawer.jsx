import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronDown, Zap, MessageSquare, ExternalLink } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { ALL_STATUSES, STATUS_CFG } from "../constants/jobs.constants";

export default function ApplicationDrawer({ app, onClose, onStatusChange }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(app.status);
  const [notes, setNotes] = useState("");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes_${app.job_id}`) || "";
    setNotes(savedNotes);
    setStatus(app.status);
  }, [app]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleNotesChange = (val) => {
    setNotes(val);
    localStorage.setItem(`notes_${app.job_id}`, val);
  };

  const appliedDateStr = app.applied_at
    ? new Date(app.applied_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : app.created_at
      ? new Date(app.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Recently";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-card border-l border-border z-50 flex flex-col shadow-(--shadow-lg) animate-in slide-in-from-right-4 duration-300 lg:static lg:h-full lg:max-w-none lg:border-none lg:shadow-none min-h-0">
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold bg-primary/10 text-primary shrink-0">
              {app.company_name?.charAt(0).toUpperCase() || "J"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {app.job_title}
              </p>
              <p className="text-xs text-muted-foreground">
                {app.company_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Status
              </span>
              <div className="relative">
                <button
                  onClick={() => setStatusMenuOpen((o) => !o)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <StatusBadge status={status} />
                  <ChevronDown size={13} className="text-muted-foreground" />
                </button>
                {statusMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-popover border border-border rounded-2xl shadow-(--shadow-lg) z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="py-1.5">
                      {ALL_STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setStatus(s);
                            onStatusChange(app.job_id, s);
                            setStatusMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-muted transition-colors cursor-pointer ${
                            s === status ? "bg-primary/5" : ""
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor: STATUS_CFG[s]?.dot || "#6b7280",
                            }}
                          />
                          <span
                            className={
                              s === status
                                ? "font-semibold text-primary"
                                : "text-foreground"
                            }
                          >
                            {s}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Date Added", value: appliedDateStr },
                { label: "Source", value: app.source || "JSearch" },
                { label: "Location", value: app.location || "Remote" },
                { label: "Type", value: app.employment_type || "Full-time" },
              ].map((d) => (
                <div
                  key={d.label}
                  className="p-3 bg-muted/40 rounded-xl border border-border"
                >
                  <p className="text-[10px] text-muted-foreground mb-0.5 font-medium uppercase tracking-wide">
                    {d.label}
                  </p>
                  <p className="text-xs font-semibold text-foreground truncate">
                    {d.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={5}
              placeholder="Add personal notes (interview stages, questions, contacts)..."
              className="w-full px-3 py-2.5 text-xs bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none transition-all"
            />
          </div>
        </div>

        <div className="shrink-0 p-5 border-t border-border space-y-2 bg-muted/20">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                navigate("/resumes?view=new");
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/15 cursor-pointer"
            >
              <Zap size={13} /> Generate Resume
            </button>
            <button
              onClick={() => {
                navigate("/interview");
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition-all cursor-pointer"
            >
              <MessageSquare size={13} /> Interview Prep
            </button>
          </div>
          {app.apply_url && (
            <a
              href={app.apply_url}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all"
            >
              <ExternalLink size={12} /> Job Posting
            </a>
          )}
        </div>
      </div>
    </>
  );
}
