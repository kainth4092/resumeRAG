import {
  Clock,
  Edit2,
  Eye,
  FileText,
  MoreHorizontal,
  Star,
  Trash2,
  Zap,
  X,
  CheckCircle2,
  Copy,
} from "lucide-react";
import DownloadBtn from "./DownloadButton";
import { STATUS_STYLES } from "./constants";
import { downloadPDF } from "../../../../../utils/exporter";

export default function ResumeTable({
  filtered,
  removingId,
  toggleStar,
  setPreviewResume,
  handleEdit,
  menuOpen,
  setMenuOpen,
  menuRef,
  setDeleteTarget,
  navigate,
  handleSetActive,
  handleDuplicate,
  handleGenerateInterview,
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {["Resume", "ATS Score", "Status", "Updated", "Template", "Actions"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`py-3.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest ${i === 5 ? "text-right pr-10 pl-4" : i === 0 ? "text-left px-5" : "text-left px-4"}`}
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
                <td colSpan={6} className="px-5 py-16 text-center">
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
                  className={[
                    "border-b border-border last:border-0 transition-all duration-300 group",
                    removingId === r.id
                      ? "opacity-0 scale-y-0 max-h-0 overflow-hidden"
                      : "hover:bg-muted/30 opacity-100",
                  ].join(" ")}
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
                        <button
                          onClick={() => setPreviewResume(r)}
                          className="font-semibold text-foreground text-sm hover:text-primary transition-colors text-left"
                        >
                          {r.name}
                        </button>
                        <p className="text-[11px] text-muted-foreground">
                          {r.version} · {r.pages}p
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      r.score >= 80 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                        : r.score >= 60 
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {r.score || 0}%
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

                  <td className="px-4 py-4">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
                      {r.template}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(r)}
                        title="Edit"
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-transparent hover:bg-primary/10 hover:border-primary/20 text-muted-foreground hover:text-primary transition-all"
                      >
                        <Edit2 size={14} />
                      </button>

                      <DownloadBtn
                        format="PDF"
                        size="sm"
                        onDownload={() => {
                          setPreviewResume(r);
                          setTimeout(() => {
                            const el =
                              document.querySelector(".printable-resume");
                            downloadPDF(el, `${r.name || "Resume"}.pdf`);
                          }, 150);
                        }}
                      />

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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-end p-4" onClick={() => setMenuOpen(null)}>
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-(--shadow-xl) animate-in fade-in zoom-in-95 duration-200 text-left"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm truncate pr-4">
                {filtered.find((r) => r.id === menuOpen)?.name ||
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
              <button
                onClick={() => {
                  const target = filtered.find((r) => r.id === menuOpen);
                  if (target) {
                    handleSetActive(target.id);
                  }
                  setMenuOpen(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-2xl transition-colors cursor-pointer text-left"
              >
                <CheckCircle2 size={15} className="text-emerald-500" />
                Set as Active
              </button>

              <button
                onClick={() => {
                  const target = filtered.find((r) => r.id === menuOpen);
                  if (target) {
                    setPreviewResume(target);
                  }
                  setMenuOpen(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-2xl transition-colors cursor-pointer text-left"
              >
                <Eye size={15} className="text-muted-foreground" />
                Preview Resume
              </button>

              <button
                onClick={() => {
                  const target = filtered.find((r) => r.id === menuOpen);
                  if (target) {
                    setPreviewResume(target);
                    setTimeout(() => {
                      const el = document.querySelector(".printable-resume");
                      downloadPDF(el, `${target.name || "Resume"}.pdf`);
                    }, 150);
                  }
                  setMenuOpen(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-2xl transition-colors cursor-pointer text-left"
              >
                <FileText size={15} className="text-muted-foreground" />
                Download PDF
              </button>

              <button
                onClick={() => {
                  const target = filtered.find((r) => r.id === menuOpen);
                  if (target && handleDuplicate) {
                    handleDuplicate(target);
                  }
                  setMenuOpen(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-2xl transition-colors cursor-pointer text-left"
              >
                <Copy size={15} className="text-muted-foreground" />
                Duplicate Resume
              </button>

              <button
                onClick={() => {
                  const target = filtered.find((r) => r.id === menuOpen);
                  if (target && handleGenerateInterview) {
                    handleGenerateInterview(target);
                  }
                  setMenuOpen(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-2xl transition-colors cursor-pointer text-left"
              >
                <Zap size={15} className="text-primary" />
                Generate Interview Prep
              </button>

              <button
                onClick={() => {
                  const target = filtered.find((r) => r.id === menuOpen);
                  setDeleteTarget(target);
                  setMenuOpen(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-2xl transition-colors cursor-pointer text-left"
              >
                <Trash2 size={15} />
                Delete Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
