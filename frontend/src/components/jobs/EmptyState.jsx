import { Search } from "lucide-react";

export default function EmptyState({
  title = "No jobs found",
  description = "Try adjusting your search or broadening your filters to see more results.",
  buttonText = "Search Again",
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-2xl p-6">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Search size={24} className="text-muted-foreground/40" />
      </div>
      <h3 className="text-foreground font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-4">
          {description}
        </p>
      )}
      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
