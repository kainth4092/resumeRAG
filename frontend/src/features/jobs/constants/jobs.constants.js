export const STATUS_CFG = {
  Applied: {
    color: "#3b82f6",
    bg: "#eff6ff",
    label: "Applied",
    dot: "#3b82f6",
  },
  Interview: {
    color: "#4F46E5",
    bg: "#EEF2FF",
    label: "Interview",
    dot: "#4F46E5",
  },
  Assessment: {
    color: "#f59e0b",
    bg: "#fffbeb",
    label: "Assessment",
    dot: "#f59e0b",
  },
  "HR Round": {
    color: "#ec4899",
    bg: "#fdf2f8",
    label: "HR Round",
    dot: "#ec4899",
  },
  Technical: {
    color: "#14B8A6",
    bg: "#F0FDFA",
    label: "Technical",
    dot: "#14B8A6",
  },
  Offer: { color: "#10b981", bg: "#ecfdf5", label: "Offer", dot: "#10b981" },
  Rejected: {
    color: "#ef4444",
    bg: "#fef2f2",
    label: "Rejected",
    dot: "#ef4444",
  },
  Wishlist: {
    color: "#6b7280",
    bg: "#f9fafb",
    label: "Wishlist",
    dot: "#6b7280",
  },
  Saved: { color: "#6b7280", bg: "#f9fafb", label: "Saved", dot: "#6b7280" },
  Viewed: { color: "#6b7280", bg: "#f9fafb", label: "Viewed", dot: "#6b7280" },
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
  { value: "Hyderabad", label: "Hyderabad" },
  { value: "Pune", label: "Pune" },
  { value: "Chennai", label: "Chennai" },
  { value: "Gurugram", label: "Gurugram" },
  { value: "Noida", label: "Noida" },
];

export const JOB_TYPE_OPTS = [
  { value: "", label: "Any Type" },
  { value: "Full-time", label: "Full-time" },
  { value: "Contract", label: "Contract" },
  { value: "Part-time", label: "Part-time" },
];

export const REMOTE_OPTS = [
  { value: "", label: "Any Work Mode" },
  { value: "yes", label: "Remote Only" },
];
