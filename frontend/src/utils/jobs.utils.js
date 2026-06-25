
export const getLogoColor = (name) => {
  if (!name) return "#7C3AED";
  const colors = [
    "#635BFF",
    "#5E6AD2",
    "#000000",
    "#d97706",
    "#F24E1E",
    "#10b981",
    "#3b82f6",
    "#ec4899",
  ]

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const exportToCSV = (trackedJobs = []) => {
  if (trackedJobs.length === 0) {
    return;
  }
  const headers = ["Company", "Role", "Location", "Type", "Status", "Source", "Date Added"];
  const rows = trackedJobs.map((app) => [
    app.company_name || "",
    app.job_title || "",
    app.location || "",
    app.employment_type || "",
    app.status || "",
    app.source || "JSearch",
    app.created_at ? new Date(app.created_at).toLocaleDateString() : "",
  ]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `job_tracker_export_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
