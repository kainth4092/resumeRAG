import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function Select({ options = [], value, onChange, placeholder = "Select...", size = "md", pill = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full border border-border ${pill ? "rounded-full" : "rounded-xl"} text-left cursor-pointer transition-all ${size === "sm" ? "h-9 px-3 text-xs" : "h-10 px-3.5 text-sm"
          } bg-card text-foreground hover:border-primary/30`}
      >
        <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={size === "sm" ? 12 : 14} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-popover border border-border rounded-xl shadow-(--shadow-lg) z-50 py-1 max-h-48 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-100">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-3.5 py-2 text-left text-sm transition-colors cursor-pointer ${opt.value === value
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground hover:bg-muted"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const YEARS = (startYear = 1990) => {
  const current = new Date().getFullYear();
  const arr = [];
  for (let y = current; y >= startYear; y--) {
    arr.push({ value: String(y), label: String(y) });
  }
  return arr;
};

export const CURRENT_YEARS = () => {
  const current = new Date().getFullYear();
  const arr = [{ value: "present", label: "Present" }];
  for (let y = current + 5; y >= 1990; y--) {
    arr.push({ value: String(y), label: String(y) });
  }
  return arr;
};
