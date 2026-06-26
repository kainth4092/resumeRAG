export default function StatsCards({ resumes = [] }) {
  const total = resumes.length;
  const active = resumes.filter((r) => r.status === "Active").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
      {[
        { label: "Total", value: total, color: "text-foreground" },
        {
          label: "Active",
          value: active,
          color: "text-emerald-600 dark:text-emerald-400",
        },

      ].map((s) => (
        <div
          key={s.label}
          className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center justify-between hover:shadow-(--shadow-sm) transition-shadow"
        >
          <span className="text-xs text-muted-foreground">{s.label}</span>
          <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}
