import {
  Clock,
  Edit2,
  FileText,
  MoreHorizontal,
  Star,
  Trash2,
  Zap,
  X,
  CheckCircle2,
} from "lucide-react";
import { STATUS_STYLES } from "./constants";
import { downloadPDF, downloadDOCX } from "../../../exporters";

export default function ResumeTable({
  filtered,
  allResumes = filtered,
  removingId,
  toggleStar,
  setPreviewResume,
  handleEdit,
  menuOpen,
  setMenuOpen,
  menuRef,
  setDeleteTarget,
  handleSetActive,
  handleGenerateInterview,
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {["Resume", "Headline", "Status", "Updated", "Actions"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`py-3.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest ${
                      i === 4
                        ? "text-right px-5"
                        : i === 0
                          ? "text-left px-5"
                          : "text-left px-4"
                    }`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <FileText
                    size={32}
                    className="mx-auto mb-3 text-muted-foreground/30"
                  />
                  <p className="text-sm font-medium text-muted-foreground">
                    No resumes found
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Try adjusting your search or filters
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-all duration-200 group opacity-100"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStar(r.id)}
                        className="shrink-0 transition-transform hover:scale-125 active:scale-95"
                      >
                        <Star
                          size={13}
                          className={
                            r.starred
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors"
                          }
                        />
                      </button>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: r.color + "18" }}
                      >
                        <FileText size={14} style={{ color: r.color }} />
                      </div>
                      <div>
                        {r.parsing_status === "pending" ||
                        r.parsing_status === "processing" ? (
                          <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                            <span>{r.name}</span>
                            <span className="w-2.5 h-2.5 border border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-md px-1 py-0.5 animate-pulse uppercase tracking-wider font-extrabold font-mono shrink-0">
                              Parsing...
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setPreviewResume(r)}
                            className="font-semibold text-foreground text-sm hover:text-primary transition-colors text-left"
                          >
                            {r.name}
                          </button>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          {r.version} · {r.pages || 1}p
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className="inline-flex items-center max-w-[220px] truncate text-sm font-medium text-foreground"
                      title={r.role || "Not specified"}
                    >
                      {r.role || "Not specified"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {r.updated}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(r)}
                        disabled={
                          r.parsing_status === "pending" ||
                          r.parsing_status === "processing"
                        }
                        title={
                          r.parsing_status === "pending" ||
                          r.parsing_status === "processing"
                            ? "Parsing in progress..."
                            : "Edit"
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-transparent hover:bg-primary/10 hover:border-primary/20 text-muted-foreground hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Edit2 size={14} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpen(menuOpen === r.id ? null : r.id)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-xl border border-transparent hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-end p-4"
          onClick={() => setMenuOpen(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-(--shadow-xl) animate-in fade-in zoom-in-95 duration-200 text-left"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm truncate pr-4">
                {allResumes.find((r) => r.id === menuOpen)?.name ||
                  "Resume Actions"}
              </h3>
              <button
                onClick={() => setMenuOpen(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-3 space-y-1.5">
              {(() => {
                const target = allResumes.find((r) => r.id === menuOpen);
                const isParsing =
                  target?.parsing_status === "pending" ||
                  target?.parsing_status === "processing";
                return (
                  <>
                    <button
                      onClick={() => {
                        if (target && !isParsing) {
                          handleSetActive(target.id);
                        }
                        setMenuOpen(null);
                      }}
                      disabled={isParsing}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-2xl transition-colors cursor-pointer text-left disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      Set as Active
                    </button>

                    <button
                      onClick={async () => {
                        if (target && !isParsing) {
                          setPreviewResume(target);
                          await new Promise((resolve) =>
                            setTimeout(resolve, 200),
                          );
                          const resumeData = target.resume || target;
                          await downloadPDF(
                            resumeData,
                            `${target.name || "Resume"}.pdf`,
                          );
                          setPreviewResume(null);
                        }
                        setMenuOpen(null);
                      }}
                      disabled={isParsing}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-2xl transition-colors cursor-pointer text-left disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <FileText size={15} className="text-muted-foreground" />
                      Download PDF
                    </button>

                    <button
                      onClick={() => {
                        if (target && !isParsing) {
                          const resumeData = target.resume || target;
                          downloadDOCX(
                            resumeData,
                            `${target.name || "Resume"}.docx`,
                            target.template || "Professional",
                          );
                        }
                        setMenuOpen(null);
                      }}
                      disabled={isParsing}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-2xl transition-colors cursor-pointer text-left disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <FileText size={15} className="text-muted-foreground" />
                      Download DOCX
                    </button>

                    <button
                      onClick={() => {
                        if (target && handleGenerateInterview && !isParsing) {
                          handleGenerateInterview(target);
                        }
                        setMenuOpen(null);
                      }}
                      disabled={isParsing}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-2xl transition-colors cursor-pointer text-left disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Zap size={15} className="text-primary" />
                      Generate Interview Prep
                    </button>

                    <button
                      onClick={() => {
                        if (target) {
                          setDeleteTarget(target);
                        }
                        setMenuOpen(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-2xl transition-colors cursor-pointer text-left"
                    >
                      <Trash2 size={15} />
                      Delete Resume
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
