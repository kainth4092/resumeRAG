import { X } from "lucide-react";

export default function QuestionForm({
  isOpen,
  onClose,
  onSubmit,
  editingQuestion,
  formData,
  setFormData,
  formError,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-(--shadow-lg) p-6 animate-in fade-in-0 zoom-in-95 duration-200 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-foreground font-bold text-lg">
            {editingQuestion ? "Edit Question" : "Share Question"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Question</label>
            <textarea
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="What is the difference between state and props in React?"
              className="w-full h-20 px-3 py-2 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sample Answer (Optional)</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Provide a clear sample answer, or leave blank to automatically generate with AI..."
              className="w-full h-24 px-3 py-2 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Skill</label>
              <input
                required
                type="text"
                value={formData.skill}
                onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                placeholder="e.g. React"
                className="w-full h-9 px-3 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-9 px-3 text-sm bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
              >
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Projects">Projects</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Experience Level</label>
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                className="w-full h-9 px-3 text-sm bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
              >
                <option value="Fresher">Fresher</option>
                <option value="1-3 Years">1-3 Years</option>
                <option value="3-5 Years">3-5 Years</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g. react, hooks, state"
                className="w-full h-9 px-3 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 transition-all cursor-pointer"
            >
              {submitting ? "Saving..." : editingQuestion ? "Update" : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
