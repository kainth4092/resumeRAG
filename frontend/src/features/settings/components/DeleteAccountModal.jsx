import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../auth/context/AuthContext";

export default function DeleteAccountModal({ isOpen, onClose }) {
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    setError("");
    try {
      await api.delete("/auth/settings/account");
      logout();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-popover border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 text-destructive">
          <div className="p-2 bg-destructive/10 rounded-xl">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Delete Account Permanently?</h3>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          This action cannot be undone. All your resumes, profile logs, saved job metrics, and mock interview attempts will be permanently erased.
        </p>

        {error && (
          <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
            Type <span className="text-destructive font-mono">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3.5 py-2 text-sm bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/25 focus:border-destructive/40 transition-all font-mono"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== "DELETE" || deleting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-destructive text-white text-xs font-bold hover:bg-destructive/90 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            <Trash2 size={13} />
            {deleting ? "Deleting..." : "Permanently Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
