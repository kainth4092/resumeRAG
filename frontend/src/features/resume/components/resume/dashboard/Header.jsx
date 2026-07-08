import { Plus, FileText } from "lucide-react";

export default function Header({ onNewResume }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm shrink-0">
          <FileText className="text-primary" size={20} />
        </div>
        <div className="text-left">
          <h1 className="text-xl font-bold text-foreground">My Resumes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage, customize, and analyze your professional resumes.
          </p>
        </div>
      </div>
      <button
        onClick={onNewResume}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20 text-sm font-semibold shrink-0 cursor-pointer"
      >
        <Plus size={15} /> New Resume
      </button>
    </div>
  );
}
