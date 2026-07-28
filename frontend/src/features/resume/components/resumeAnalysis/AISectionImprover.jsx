import { Sparkles } from "lucide-react";

export default function AISectionImprover() {
  return (
    <div className="border-b border-border pb-3 text-left">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Sparkles className="text-primary fill-primary/10" size={16} />
        AI Section Improver
      </h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        Optimize specific resume sections independently. This runs standalone AI
        prompts without regenerating your entire document.
      </p>
    </div>
  );
}
