import React, { useState, useRef, useEffect } from "react";
import { FileText, ChevronDown } from "lucide-react";


export function ResumeSelector({ selectedResume, setSelectedResume, resumes = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const displayList = resumes;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!selectedResume && displayList.length > 0) {
      setSelectedResume(displayList[0]);
    }
  }, [selectedResume, displayList, setSelectedResume]);

  const selectedName = selectedResume?.name || selectedResume?.title || selectedResume || "Select a resume";

  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
        Selected Resume Template
      </label>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-sm text-foreground hover:border-primary/40 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-primary/25"
        >
          <FileText size={14} className="text-primary shrink-0" />
          <span className="flex-1 text-left truncate font-medium">{selectedName}</span>
          <ChevronDown
            size={13}
            className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-(--shadow-lg) z-50 overflow-hidden max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            {displayList.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground text-center font-medium">
                No resumes found.
              </div>
            ) : (
              displayList.map((r, idx) => {
                const rName = r.name || r.title || r;
                const isCurrent =
                  (selectedResume?.id && r?.id && selectedResume.id === r.id) ||
                  selectedName === rName;

                return (
                  <button
                    key={r.id || idx}
                    type="button"
                    onClick={() => {
                      setSelectedResume(r);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-muted transition-colors cursor-pointer ${isCurrent ? "text-primary bg-primary/5 font-semibold" : "text-foreground"
                      }`}
                  >
                    <FileText size={13} className="shrink-0 text-primary/70" />
                    <span className="truncate">{rName}</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
