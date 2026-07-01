import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function Select({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  size = "md",
  className = "",
  disabled = false,
}) {
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

  const sizeClasses = {
    sm: "h-9 px-3 text-xs rounded-xl",
    md: "h-12 px-3.5 text-sm rounded-xl",
    lg: "h-12 px-4 text-sm rounded-2xl",
  };

  const chevronSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full border border-border text-left cursor-pointer transition-all duration-200 bg-card text-foreground hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size] || sizeClasses.md}`}
      >
        <span className={selectedOption ? "text-foreground font-medium" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={chevronSizes[size] || chevronSizes.md}
          className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-popover border border-border rounded-xl shadow-lg shadow-black/10 z-50 py-1 max-h-56 overflow-y-auto animate-in fade-in-0 slide-in-from-top-1 duration-100">
          {options.length === 0 ? (
            <div className="px-3.5 py-2 text-xs text-muted-foreground text-center">
              No options available
            </div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2 text-left text-sm transition-colors duration-150 cursor-pointer ${
                  opt.value === value
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
