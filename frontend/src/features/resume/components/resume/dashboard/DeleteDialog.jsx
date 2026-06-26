import { useState } from "react";
import { AlertTriangle, FileText, Loader2, Trash2 } from "lucide-react";

function ConfirmDelete({ resume, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 900));
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={!deleting ? onCancel : undefined}
      />
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-[var(--shadow-lg)] p-6 animate-in fade-in-0 zoom-in-95 duration-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold">Delete resume?</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="bg-muted/40 border border-border rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText size={14} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {resume.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {resume.version} · {resume.template} template
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          "<span className="font-medium text-foreground">{resume.name}</span>"
          will be permanently deleted. All ATS scores and history will be lost.
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 active:scale-[0.98] disabled:opacity-70 transition-all cursor-pointer"
          >
            {deleting ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Deleting…
              </>
            ) : (
              <>
                <Trash2 size={13} /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DeleteDialog({ deleteTarget, setDeleteTarget, handleDeleteConfirm }) {
  return (
    <>
      {deleteTarget && (
        <ConfirmDelete
          resume={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
