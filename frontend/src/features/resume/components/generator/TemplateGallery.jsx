import { Check, Info } from "lucide-react";
import { TEMPLATE_REGISTRY } from "../resume/templates";

export default function TemplateGallery({
  isOpen,
  onClose,
  selectedTemplate,
  onSelect,
  onConfirm,
  generating,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-3xl shadow-(--shadow-lg)overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-200 max-h-[85vh]">
        <div className="px-6 py-5 border-b border-border bg-card shrink-0">
          <h2 className="text-lg font-black text-foreground">Select a Resume Template</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Choose from our professionally engineered layouts. Each design is optimized for specific industries and parsed cleanly by applicant tracking systems.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(TEMPLATE_REGISTRY).map((tpl) => {
              const isSelected = selectedTemplate === tpl.name;
              return (
                <div
                  key={tpl.name}
                  onClick={() => onSelect(tpl.name)}
                  className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/45"
                    : "border-border bg-card hover:border-primary/25 hover:shadow-xs"
                    }`}
                >
                  <div className="space-y-3">
                    <div
                      className={`h-24 w-full rounded-xl bg-linear-to-br ${tpl.thumbnailColor} opacity-90 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between relative overflow-hidden`}
                    >
                      <div className="w-full h-full flex gap-1 bg-white/10 rounded-sm p-1">
                        <div className="w-1/3 bg-white/20 rounded-xs h-full" />
                        <div className="w-2/3 flex flex-col gap-1">
                          <div className="h-2 bg-white/30 rounded-xs w-3/4" />
                          <div className="h-1 bg-white/20 rounded-xs w-full" />
                          <div className="h-1 bg-white/20 rounded-xs w-5/6" />
                          <div className="h-1 bg-white/20 rounded-xs w-2/3" />
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center shadow-xs">
                          <Check size={14} className="stroke-3" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 justify-between">
                        <h4 className="font-bold text-sm text-foreground">{tpl.name}</h4>
                        {tpl.atsBadge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            ATS Friendly
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">
                        {tpl.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/60 flex items-start gap-1.5 text-[10px] text-muted-foreground">
                    <Info size={11} className="mt-0.5 text-primary" />
                    <span>
                      <strong className="text-foreground font-semibold">Uses: </strong>
                      {tpl.recommended}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-card flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={generating}
            className="h-10 px-5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-primary/20"
          >
            Confirm & Generate
          </button>
        </div>
      </div>
    </div>
  );
}
