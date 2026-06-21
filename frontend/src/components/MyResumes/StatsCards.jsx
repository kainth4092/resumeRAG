export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Total", value: resumes.length, color: "text-foreground" },
        {
          label: "Active",
          value: resumes.filter((r) => r.status === "Active").length,
          color: "text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Avg ATS",
          value: `${Math.round(resumes.reduce((s, r) => s + r.score, 0) / resumes.length)}/100`,
          color: "text-primary",
        },
        {
          label: "Best Score",
          value: `${Math.max(...resumes.map((r) => r.score))}/100`,
          color: "text-amber-600",
        },
      ].map((s) => (
        <div
          key={s.label}
          className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center justify-between hover:shadow-[var(--shadow-sm)] transition-shadow"
        >
          <span className="text-xs text-muted-foreground">{s.label}</span>
          <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}
