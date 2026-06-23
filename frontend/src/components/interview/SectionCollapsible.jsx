import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SectionCollapsible({ title, count, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors text-left focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground">{title}</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {count}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 bg-card border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}
