import { Sparkles } from "lucide-react";

export default function SectionMenu({
  improvingSection,
  setImprovingSection,
  setImprovedText,
  setCustomSectionContent,
  setError,
}) {
  return (
    <div className="lg:col-span-1 space-y-2">
      {["Summary", "Experience", "Projects", "Skills", "Education"].map(
        (sect) => {
          const isSelected = improvingSection === sect;
          return (
            <button
              key={sect}
              onClick={() => {
                setImprovingSection(sect);
                setImprovedText("");
                setCustomSectionContent("");
                setError("");
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-card border-border hover:bg-muted text-foreground"
              }`}
            >
              {sect}
              <Sparkles
                size={13}
                className={isSelected ? "text-white" : "text-primary"}
              />
            </button>
          );
        },
      )}
    </div>
  );
}
