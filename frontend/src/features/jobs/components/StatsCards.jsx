import {
  Send,
  MessageSquare,
  CheckCircle2,
  X,
} from "lucide-react";

export default function StatsCards({ apps = [] }) {
  const stats = [
    {
      label: "Applied",
      value: apps.filter((a) => a.status !== "Wishlist" && a.status !== "Saved").length,
      icon: Send,
      color: "#3b82f6",
      bg: "#eff6ff",
      trend: "Tracked",
      up: true,
    },
    {
      label: "Interviews",
      value: apps.filter((a) =>
        ["Interview", "Technical", "HR Round", "Assessment"].includes(a.status)
      ).length,
      icon: MessageSquare,
      color: "#7C3AED",
      bg: "#f5f3ff",
      trend: "Scheduled",
      up: true,
    },
    {
      label: "Offers",
      value: apps.filter((a) => a.status === "Offer").length,
      icon: CheckCircle2,
      color: "#10b981",
      bg: "#ecfdf5",
      trend: "Offers",
      up: true,
    },
    {
      label: "Rejected",
      value: apps.filter((a) => a.status === "Rejected").length,
      icon: X,
      color: "#ef4444",
      bg: "#fef2f2",
      trend: "Closed",
      up: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-card border border-border rounded-2xl p-5 hover:shadow-(--shadow-md) hover:-translate-y-0.5 transition-all duration-200 cursor-default group"
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.up
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-500"
                }`}
            >

            </div>
          </div>
          <div className="text-3xl font-bold text-foreground tracking-tight">
            {s.value}
          </div>
          <div className="text-sm text-muted-foreground mt-1 font-medium">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
