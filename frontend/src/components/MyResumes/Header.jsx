export default function Header() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-foreground">My Resumes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {resumes.length} resumes ·{" "}
          {resumes.filter((r) => r.status === "Active").length} active
        </p>
      </div>
      <button
        onClick={() => navigate("generator")}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20 text-sm font-semibold flex-shrink-0"
      >
        <Plus size={15} /> New Resume
      </button>
    </div>
  );
}
