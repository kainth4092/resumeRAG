export function Select({ label, options, value, onChange }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 text-sm bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-popover text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
