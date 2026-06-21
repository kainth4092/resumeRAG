function PreviewModal({ resume, onClose, onEdit, onDelete }) {
  const [downloading, setDownloading] = useState(false);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-200 max-h-[92vh]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {resume.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[resume.status]}`}
                >
                  {resume.status}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {resume.version} · {resume.template}
                </span>
                <span
                  className={`text-[11px] font-bold ${resume.score >= 85 ? "text-emerald-600 dark:text-emerald-400" : resume.score >= 70 ? "text-amber-600" : "text-red-500"}`}
                >
                  ATS {resume.score}/100
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Actions */}
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/30 active:scale-[0.97] transition-all"
            >
              <Edit2 size={12} /> Edit
            </button>
            <DownloadBtn format="PDF" size="sm" />
            <DownloadBtn format="DOCX" size="sm" />
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/25 text-xs font-semibold text-destructive hover:bg-destructive/5 active:scale-[0.97] transition-all"
            >
              <Trash2 size={12} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ATS bar */}
        <div className="flex-shrink-0 px-5 py-3 bg-muted/20 border-b border-border flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-muted-foreground">ATS Score</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-32">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${resume.score}%`,
                  backgroundColor:
                    resume.score >= 85
                      ? "#10b981"
                      : resume.score >= 70
                        ? "#f59e0b"
                        : "#ef4444",
                }}
              />
            </div>
            <span
              className={`text-xs font-bold ${resume.score >= 85 ? "text-emerald-600 dark:text-emerald-400" : resume.score >= 70 ? "text-amber-600" : "text-red-500"}`}
            >
              {resume.score}/100
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Last updated: {resume.updated}
          </span>
        </div>

        {/* Scrollable resume preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 px-6 py-6">
          <div className="max-w-[640px] mx-auto shadow-[var(--shadow-lg)] rounded-xl overflow-hidden border border-black/10">
            <ResumePreviewContent resume={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResumePreviewModal() {
  return (
    <>
      {previewResume && (
        <PreviewModal
          resume={previewResume}
          onClose={() => setPreviewResume(null)}
          onEdit={() => handleEdit(previewResume)}
          onDelete={() => {
            setDeleteTarget(previewResume);
            setPreviewResume(null);
          }}
        />
      )}
    </>
  );
}
