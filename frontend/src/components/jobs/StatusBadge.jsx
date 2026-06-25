import React from "react";

export const STATUS_CFG = {
  Applied: { color: "#3b82f6", bg: "#eff6ff", label: "Applied", dot: "#3b82f6" },
  Interview: { color: "#7C3AED", bg: "#f5f3ff", label: "Interview", dot: "#7C3AED" },
  Assessment: { color: "#f59e0b", bg: "#fffbeb", label: "Assessment", dot: "#f59e0b" },
  "HR Round": { color: "#ec4899", bg: "#fdf2f8", label: "HR Round", dot: "#ec4899" },
  Technical: { color: "#8b5cf6", bg: "#f5f3ff", label: "Technical", dot: "#8b5cf6" },
  Offer: { color: "#10b981", bg: "#ecfdf5", label: "Offer", dot: "#10b981" },
  Rejected: { color: "#ef4444", bg: "#fef2f2", label: "Rejected", dot: "#ef4444" },
  Wishlist: { color: "#6b7280", bg: "#f9fafb", label: "Wishlist", dot: "#6b7280" },
  Saved: { color: "#6b7280", bg: "#f9fafb", label: "Saved", dot: "#6b7280" },
  Viewed: { color: "#6b7280", bg: "#f9fafb", label: "Viewed", dot: "#6b7280" },
};

export default function StatusBadge({ status }) {

  const normalizedStatus = STATUS_CFG[status] ? status : "Saved";
  const cfg = STATUS_CFG[normalizedStatus];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
      style={{
        color: cfg.color,
        backgroundColor: cfg.bg,
        borderColor: cfg.color + "30",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}
