import { Sparkles, Check, Copy, ChevronDown } from "lucide-react";

export default function AIImprover({
  improvingSection,
  setImprovingSection,
  improvedText,
  setImprovedText,
  copiedSection,
  customSectionContent,
  setCustomSectionContent,
  triggerSectionImprovement,
  copyToClipboard,
  improving,
}) {
  const sections = ["Summary", "Experience", "Projects", "Skills", "Education"];

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs text-left space-y-4">
      <div className="border-b border-border pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Sparkles className="text-primary fill-primary/10" size={15} />
            AI Section Improver
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Optimize specific resume sections independently using AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Section List (Sidebar or Dropdown on mobile) */}
        <div className="lg:col-span-1 space-y-1.5">
          <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 lg:hidden">
            Select Section
          </label>
          <div className="relative lg:hidden">
            <select
              value={improvingSection || ""}
              onChange={(e) => {
                setImprovingSection(e.target.value);
                setImprovedText("");
                setCustomSectionContent("");
              }}
              className="w-full appearance-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground font-bold focus:outline-hidden cursor-pointer pr-10"
            >
              <option value="" disabled>Select section to improve...</option>
              {sections.map((sect) => (
                <option key={sect} value={sect}>{sect}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
          </div>

          <div className="hidden lg:flex flex-col gap-1.5">
            {sections.map((sect) => {
              const isSelected = improvingSection === sect;
              return (
                <button
                  key={sect}
                  onClick={() => {
                    setImprovingSection(sect);
                    setImprovedText("");
                    setCustomSectionContent("");
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-card border-border hover:bg-muted text-foreground"
                  }`}
                >
                  {sect}
                  <Sparkles
                    size={12}
                    className={isSelected ? "text-white" : "text-primary"}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Improvement Panel */}
        <div className="lg:col-span-3 border border-border rounded-xl p-4.5 space-y-4 bg-muted/10">
          {improvingSection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Improving: {improvingSection}
                </span>
                {improvedText && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-2.5 py-1 border border-border rounded-lg text-[10px] font-bold text-foreground bg-card hover:bg-muted cursor-pointer transition-colors"
                  >
                    {copiedSection ? (
                      <>
                        <Check size={11} className="text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Current Content (Optional)
                  </label>
                  <textarea
                    value={customSectionContent}
                    onChange={(e) => setCustomSectionContent(e.target.value)}
                    placeholder={`Paste your existing ${improvingSection.toLowerCase()} content here to guide the AI, or leave blank to extract from the uploaded resume context.`}
                    className="w-full h-36 rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary resize-none font-medium"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Improved AI Copy
                  </label>
                  <div className="flex-1 min-h-[144px] rounded-xl border border-border bg-card p-3 text-xs text-foreground overflow-y-auto whitespace-pre-line text-left relative font-medium">
                    {improving ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-card/60 backdrop-blur-xs">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mb-1.5" />
                        <p className="text-[10px] text-muted-foreground">AI is polishing your text...</p>
                      </div>
                    ) : improvedText ? (
                      improvedText
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <Sparkles
                          size={14}
                          className="text-primary/40 animate-pulse mb-1"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Click Improve to view AI optimizations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => triggerSectionImprovement(improvingSection)}
                  disabled={improving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-xs shadow-primary/10 disabled:opacity-50"
                >
                  <Sparkles size={12} />
                  Improve {improvingSection}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <Sparkles size={24} className="text-primary/30 mb-2 animate-bounce" />
              <p className="text-xs font-bold text-foreground">
                Select a section to optimize
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 max-w-xs">
                We will improve vocabulary, format and keywords using senior recruitment parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
