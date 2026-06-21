export default function ResumeTable() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {[
                "Resume",
                "ATS Score",
                "Status",
                "Updated",
                "Template",
                "Actions",
              ].map((h, i) => (
                <th
                  key={h}
                  className={`py-3.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest ${i === 5 ? "text-right pr-5 pl-4" : i === 0 ? "text-left px-5" : "text-left px-4"}`}
                >
                  {h}
                </th>
              ))}
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
                  {/* Resume name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStar(r.id)}
                        className="flex-shrink-0 transition-transform hover:scale-125 active:scale-95"
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
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
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

                  {/* ATS Score */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${r.score}%`,
                            backgroundColor:
                              r.score >= 85
                                ? "#10b981"
                                : r.score >= 70
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold ${r.score >= 85 ? "text-emerald-600 dark:text-emerald-400" : r.score >= 70 ? "text-amber-600" : "text-red-500"}`}
                      >
                        {r.score}
                      </span>
                      {r.score >= 85 && (
                        <ArrowUpRight size={11} className="text-emerald-500" />
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>

                  {/* Updated */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {r.updated}
                    </div>
                  </td>

                  {/* Template */}
                  <td className="px-4 py-4">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
                      {r.template}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview */}
                      <button
                        onClick={() => setPreviewResume(r)}
                        title="Preview"
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-transparent hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(r)}
                        title="Edit"
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-transparent hover:bg-primary/10 hover:border-primary/20 text-muted-foreground hover:text-primary transition-all"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Download */}
                      <DownloadBtn format="PDF" size="sm" />

                      {/* More menu */}
                      <div
                        className="relative"
                        ref={menuOpen === r.id ? menuRef : undefined}
                      >
                        <button
                          onClick={() =>
                            setMenuOpen(menuOpen === r.id ? null : r.id)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-xl border border-transparent hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground transition-all"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {menuOpen === r.id && (
                          <div className="absolute right-0 top-full mt-1.5 w-44 bg-popover border border-border rounded-2xl shadow-[var(--shadow-lg)] z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                            <div className="py-1.5">
                              <button
                                onClick={() => {
                                  setPreviewResume(r);
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                              >
                                <Eye
                                  size={14}
                                  className="text-muted-foreground"
                                />{" "}
                                Preview
                              </button>
                              <button
                                onClick={() => {
                                  handleEdit(r);
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                              >
                                <Edit2
                                  size={14}
                                  className="text-muted-foreground"
                                />{" "}
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  navigate("generator");
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                              >
                                <Zap
                                  size={14}
                                  className="text-muted-foreground"
                                />{" "}
                                Regenerate
                              </button>
                              <div className="h-px bg-border mx-2 my-1" />
                              <button
                                onClick={() => {
                                  setDeleteTarget(r);
                                  setMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
