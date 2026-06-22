import { useState } from "react";

export function Label({ children }) {
  return (
    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

export function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 px-3.5 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3.5 py-2.5 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 resize-none transition-all"
    />
  );
}

export default function EditorSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors group border-b border-transparent data-[open=true]:border-border"
        data-open={open}
      >
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground flex-1 text-left">
          {title}
        </span>
        {badge !== undefined && (
          <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <div
          className={`w-5 h-5 flex items-center justify-center rounded-lg text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>
      {open && <div className="px-5 py-5 space-y-4">{children}</div>}
    </div>
  );
}