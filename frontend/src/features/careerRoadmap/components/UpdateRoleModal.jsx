import { useState, useEffect } from "react";
import { X, Target } from "lucide-react";

export default function UpdateRoleModal({
  isOpen,
  onClose,
  onSubmit,
  initialRole,
  initialLevel,
}) {
  const [role, setRole] = useState(initialRole || "");
  const [level, setLevel] = useState(initialLevel || "");

  useEffect(() => {
    if (isOpen) {
      const load = async () => {
        setRole(initialRole || "");
        setLevel(initialLevel || "");
      };
      load();
    }
  }, [isOpen, initialRole, initialLevel]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(role, level);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl z-10 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Target className="text-primary" size={18} />
            <h2 className="text-lg font-semibold text-foreground">
              Update Target Role
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Target Role Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Target Level / Company Tier
            </label>
            <input
              type="text"
              required
              placeholder="e.g. At top-tier startups (Stripe, Linear level)"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white font-medium rounded-xl text-sm hover:bg-primary/90 shadow-sm transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
