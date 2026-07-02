import { useState } from "react";
import { Plus, X, RefreshCw, CheckCircle2 } from "lucide-react";
import Select from "../../resume/components/resume/dashboard/Select";
import { saveJob, updateJobStatus } from "../services/jobs.service";

export default function AddJobModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    company: "",
    role: "",
    jobLink: "",
    location: "",
    salary: "",
    status: "Applied",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const statusOpts = [
    { value: "Saved", label: "Saved" },
    { value: "Wishlist", label: "Wishlist" },
    { value: "Applied", label: "Applied" },
    { value: "Interview", label: "Interview" },
    { value: "Offer", label: "Offer" },
  ];

  const handleSave = async () => {
    if (!form.company || !form.role) {
      return;
    }
    setSaving(true);
    try {
      const uniqueId = `manual-${Date.now()}`;
      const mockJobPayload = {
        job_id: uniqueId,
        company_name: form.company,
        job_title: form.role,
        company_logo: null,
        location: form.location || "Remote",
        employment_type: "Full-time",
        apply_url: form.jobLink || null,
        posted_at: "Today",
      };

      await saveJob(mockJobPayload);

      if (form.status !== "Saved") {
        await updateJobStatus(uniqueId, form.status);
      }

      if (form.notes) {
        localStorage.setItem(`notes_${uniqueId}`, form.notes);
      }

      onAdd();
    } catch (error) {
      console.error("Failed to save manual application:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-(--shadow-lg) overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plus size={15} className="text-primary" />
            </div>
            <h3 className="text-foreground font-semibold">Add Application</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <InputField
                label="Company *"
                value={form.company}
                onChange={set("company")}
                placeholder="Google, Stripe, Linear…"
              />
            </div>
            <div className="col-span-2">
              <InputField
                label="Role *"
                value={form.role}
                onChange={set("role")}
                placeholder="Senior Software Engineer"
              />
            </div>
            <InputField
              label="Location"
              value={form.location}
              onChange={set("location")}
              placeholder="Remote"
            />
            <InputField
              label="Salary"
              value={form.salary}
              onChange={set("salary")}
              placeholder="$150K–$200K"
            />
            <div className="col-span-2">
              <InputField
                label="Job Posting URL"
                value={form.jobLink}
                onChange={set("jobLink")}
                placeholder="https://…"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Status
              </label>
              <Select
                options={statusOpts}
                value={form.status}
                onChange={set("status")}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              rows={3}
              placeholder="Any initial notes about this application…"
              className="w-full px-3.5 py-2.5 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none transition-all"
            />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.company || !form.role || saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-primary/15 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Adding…
              </>
            ) : (
              <>
                <CheckCircle2 size={14} /> Add Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const InputField = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
      {label}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 px-3.5 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
    />
  </div>
);
