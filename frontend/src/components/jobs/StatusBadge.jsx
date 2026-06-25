import { STATUS_CFG } from "../../constants/jobs.constants";

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
