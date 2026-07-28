import { FileText } from "lucide-react";

export default function SavedResumeList({
  resumesList,
  selectedResume,
  handleSelectResume,
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col h-[350px]">
      <h3 className="text-md font-bold text-foreground mb-3">
        Or Select Saved Resume
      </h3>
      {resumesList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-muted-foreground">
            No saved resumes found in database.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {resumesList.map((r) => {
            const isSelected =
              selectedResume && String(selectedResume.id) === String(r.id);
            return (
              <button
                key={r.id}
                onClick={() => handleSelectResume(r)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText
                  size={16}
                  className={
                    isSelected ? "text-primary" : "text-muted-foreground"
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">
                    {r.title || "Untitled Resume"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {r.updatedAt || "Saved recently"}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
