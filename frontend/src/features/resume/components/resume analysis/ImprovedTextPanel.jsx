import { Check, Copy, Sparkles } from "lucide-react";

export default function ImprovedTextPanel({
  improvingSection,
  improvedText,
  copyToClipboard,
  setCustomSectionContent,
  customSectionContent,
  copiedSection,
  triggerSectionImprovement,
}) {
  return (
    <div className="lg:col-span-3 border border-border rounded-xl p-5 space-y-4 bg-muted/10">
      {improvingSection ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Improving: {improvingSection}
            </span>
            {improvedText && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-2.5 py-1 border border-border rounded-lg text-[10px] font-bold text-foreground bg-card hover:bg-muted cursor-pointer transition-colors"
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
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">
                Current Content (Optional)
              </label>
              <textarea
                value={customSectionContent}
                onChange={(e) => setCustomSectionContent(e.target.value)}
                placeholder={`Paste your existing ${improvingSection.toLowerCase()} content here to guide the AI, or leave blank to extract from the uploaded resume context.`}
                className="w-full h-44 rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary resize-none font-medium"
              />
            </div>

            {/* AI improved result display */}
            <div className="space-y-2 flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase text-left">
                Improved AI Copy
              </span>
              <div className="flex-1 min-h-[176px] rounded-xl border border-border bg-card p-3 text-xs text-foreground overflow-y-auto whitespace-pre-line text-left relative font-medium">
                {improvedText ? (
                  improvedText
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <Sparkles
                      size={16}
                      className="text-primary animate-pulse mb-1"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Click Improve to view AI optimizations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => triggerSectionImprovement(improvingSection)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-xs shadow-primary/10"
            >
              <Sparkles size={13} />
              Improve {improvingSection} with AI
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <Sparkles size={28} className="text-primary/30 mb-2 animate-bounce" />
          <p className="text-xs font-bold text-foreground">
            Select a section to optimize
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            We will improve vocabulary, format and keywords using senior
            recruitment templates.
          </p>
        </div>
      )}
    </div>
  );
}
