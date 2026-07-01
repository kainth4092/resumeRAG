import { Eye, Info, Sparkles } from "lucide-react";
import TemplateThumbnail from "../resume/templates/TemplateThumbnail";
import { MOCK_RESUME } from "../../pages/templatesData";
import { TEMPLATE_REGISTRY } from "../resume/templates";

export default function PreviewPanel({
  activeTemplateName,
  onExpandClick,
}) {
  const activeTpl = TEMPLATE_REGISTRY[activeTemplateName];

  return (
    <div className="lg:col-span-2 hidden lg:flex flex-col bg-gradient-to-b from-muted/30 to-muted/5 border border-border/80 rounded-2xl p-5 text-center space-y-4 sticky top-6 self-start shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="text-left border-b border-border pb-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-primary/10 text-primary flex items-center gap-1">
            <Sparkles size={9} className="animate-pulse" /> Instant Preview
          </span>
          <button
            type="button"
            onClick={onExpandClick}
            className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer hover:scale-102 active:scale-98"
          >
            <Eye size={11} /> Expand Preview
          </button>
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-foreground">
            {activeTemplateName} Layout
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
            {activeTpl?.description}
          </p>
        </div>
      </div>

      <div className="bg-card/50 border border-border/50 rounded-xl p-4 flex items-center justify-center shadow-inner h-[380px] overflow-hidden relative group">
        <div className="w-[250px] h-[356px] shadow-xl rounded-md overflow-hidden bg-card border border-border/60 transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-2xl">
          <TemplateThumbnail
            TemplateComponent={activeTpl.component}
            scale={250 / 794}
            resume={MOCK_RESUME}
          />
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 justify-center">
        <Info size={11} className="text-primary shrink-0" />
        Hover any card on the left to inspect its layout instantly.
      </p>
    </div>
  );
}
