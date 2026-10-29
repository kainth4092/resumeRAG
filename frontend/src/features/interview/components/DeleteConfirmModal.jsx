import { useModalA11y } from "../../../hooks/useModalA11y";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  deleting,
}) {
  const modalRef = useModalA11y({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-300 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-(--shadow-lg) p-6 animate-in fade-in-0 zoom-in-95 duration-200 space-y-4 outline-none"
      >
        <h3 id="delete-confirm-title" className="text-foreground font-semibold">
          Delete question?
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Are you sure you want to delete this question? This action cannot be undone.
        </p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2 rounded-xl bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 active:scale-[0.98] disabled:opacity-70 transition-all cursor-pointer"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
