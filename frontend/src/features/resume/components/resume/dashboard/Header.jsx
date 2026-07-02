import { Plus } from "lucide-react";

export default function Header({ resumes = [], onNewResume }) {
  const activeCount = resumes.filter((r) => r.status === "Active").length;

  return (
    <div className="flex items-start justify-between gap-4 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Resumes</h1>
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
