export default function HeatMap({ analysis }) {
  const sections = [
    { name: "Contact Info", strength: analysis?.heatmap?.contact_info ?? 0 },
    { name: "Summary", strength: analysis?.heatmap?.summary ?? 0 },
    { name: "Experience", strength: analysis?.heatmap?.experience ?? 0 },
    { name: "Skills", strength: analysis?.heatmap?.skills ?? 0 },
    { name: "Education", strength: analysis?.heatmap?.education ?? 0 },
    { name: "Projects", strength: analysis?.heatmap?.projects ?? 0 },
  ];

  return (
    <>
      {analysis && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-foreground mb-1">Resume Heatmap</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Section-by-section ATS strength analysis
          </p>
          <div className="space-y-3">
            {sections.map((s) => {
              const color =
                s.strength >= 80
                  ? "#10b981"
                  : s.strength >= 60
                    ? "#f59e0b"
                    : "#ef4444";
              const label =
                s.strength >= 80
                  ? "Strong"
                  : s.strength >= 60
                    ? "Good"
                    : s.strength >= 40
                      ? "Weak"
                      : "Critical";
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">
                    {s.name}
                  </span>
                  <div className="flex-1 h-5 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center px-2.5 transition-all duration-700"
                      style={{
                        width: `${s.strength}%`,
                        backgroundColor: color + "25",
                        border: `1px solid ${color}35`,
                      }}
                    >
                      <span className="text-[10px] font-bold" style={{ color }}>
                        {s.strength}%
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-semibold w-14 text-right shrink-0"
                    style={{ color }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
