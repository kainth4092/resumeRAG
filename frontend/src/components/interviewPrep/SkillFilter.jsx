import { memo } from "react";

export const SkillFilter = memo(function SkillFilter({ activeFilter, setActiveFilter }) {
  const chips = ["All", "React", "Python", "FastAPI", "JavaScript", "PostgreSQL", "Projects", "Behavioral"];

  return (
    <div className="flex flex-wrap gap-2 py-1">
      {chips.map((chip) => {
        const active = activeFilter === chip;
        return (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${active
                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                : "bg-card border-border text-muted-foreground hover:bg-muted hover:border-primary/20"
              }`}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
});
