import { Check, Award, Eye } from "lucide-react";

export default function TemplateItem({
  tpl,
  isSelected,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  onPreviewClick,
}) {
  return (
    <div
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative flex items-start gap-4.5 p-4.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md shadow-primary/5 ring-1 ring-primary/30"
          : "border-border bg-card hover:border-primary/20 hover:bg-muted/10 hover:shadow-xs"
      }`}
    >
      {/* Floating eye preview button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPreviewClick();
        }}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-lg bg-card border border-border/80 text-muted-foreground hover:text-foreground opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all shadow-xs z-10 hover:scale-105 active:scale-95 cursor-pointer"
        title="Quick Preview"
      >
        <Eye size={11} />
      </button>
      {/* Visual indicator of layout */}
      <div
        className={`w-12 h-14 rounded-xl bg-linear-to-br ${tpl.thumbnailColor} opacity-90 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between shrink-0 relative overflow-hidden`}
      >
        {/* Abstract page lines */}
        <div className="w-full flex gap-1 bg-white/10 rounded-sm p-1 h-full">
          {tpl.name === "Corporate" ? (
            <>
              <div className="w-[30%] bg-white/30 rounded-xs h-full" />
              <div className="w-[70%] flex flex-col gap-0.5">
                <div className="h-1 bg-white/40 rounded-xs w-3/4 animate-pulse" />
                <div className="h-[2px] bg-white/20 rounded-xs w-full" />
                <div className="h-[2px] bg-white/20 rounded-xs w-5/6" />
                <div className="h-[2px] bg-white/20 rounded-xs w-2/3" />
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col gap-0.5">
              <div className="h-1 bg-white/40 rounded-xs w-1/3 mx-auto animate-pulse" />
              <div className="h-[2px] bg-white/20 rounded-xs w-full" />
              <div className="h-[2px] bg-white/20 rounded-xs w-full" />
              <div className="h-[2px] bg-white/20 rounded-xs w-5/6" />
              <div className="h-[2px] bg-white/20 rounded-xs w-2/3" />
            </div>
          )}
        </div>

        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-xs flex items-center justify-center">
            <div className="w-5.5 h-5.5 rounded-full bg-white text-primary flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
              <Check size={12} className="stroke-3" />
            </div>
          </div>
        )}
      </div>

      {/* Main Details */}
      <div className="flex-1 min-w-0 space-y-1 text-left">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-extrabold text-[13px] text-foreground tracking-tight">
            {tpl.name}
          </h4>
         
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {tpl.description}
        </p>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 font-medium pt-1">
          <Award size={11} className="text-primary shrink-0" />
          <span className="truncate">
            <strong className="text-foreground font-semibold">Best for: </strong>
            {tpl.recommended}
          </span>
        </div>
      </div>
    </div>
  );
}
