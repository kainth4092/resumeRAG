export const STATUS_CFG = {
  Applied:    { color: "#3b82f6", bg: "#eff6ff",  label: "Applied",    dot: "#3b82f6" },
  Interview:  { color: "#7C3AED", bg: "#f5f3ff",  label: "Interview",  dot: "#7C3AED" },
  Assessment: { color: "#f59e0b", bg: "#fffbeb",  label: "Assessment", dot: "#f59e0b" },
  "HR Round": { color: "#ec4899", bg: "#fdf2f8",  label: "HR Round",   dot: "#ec4899" },
  Technical:  { color: "#8b5cf6", bg: "#f5f3ff",  label: "Technical",  dot: "#8b5cf6" },
  Offer:      { color: "#10b981", bg: "#ecfdf5",  label: "Offer",      dot: "#10b981" },
  Rejected:   { color: "#ef4444", bg: "#fef2f2",  label: "Rejected",   dot: "#ef4444" },
  Wishlist:   { color: "#6b7280", bg: "#f9fafb",  label: "Wishlist",   dot: "#6b7280" },
  Saved:      { color: "#6b7280", bg: "#f9fafb",  label: "Saved",      dot: "#6b7280" },
  Viewed:     { color: "#6b7280", bg: "#f9fafb",  label: "Viewed",     dot: "#6b7280" },
};

export const ALL_STATUSES = [
  "Saved",
  "Wishlist",
  "Applied",
  "Assessment",
  "HR Round",
  "Interview",
  "Technical",
  "Offer",
  "Rejected",
];

export const LOCATION_OPTS = [
  { value: "", label: "Any Location (India)" },
  { value: "Bangalore", label: "Bangalore" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Delhi", label: "Delhi" },
  { value: "Remote Only", label: "Remote Only" },
];

export const EXPERIENCE_OPTS = [
  { value: "", label: "Any Experience" },
  { value: "0-2", label: "0–2 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5-8", label: "5–8 years" },
  { value: "8+", label: "8+ years" },
];

export const JOB_TYPE_OPTS = [
  { value: "", label: "Any Type" },
  { value: "Full-time", label: "Full-time" },
  { value: "Contract", label: "Contract" },
  { value: "Part-time", label: "Part-time" },
];

export const REMOTE_OPTS = [
  { value: "", label: "Any Remote" },
  { value: "yes", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];
