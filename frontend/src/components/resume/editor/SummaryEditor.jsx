import { Zap } from "lucide-react";
import EditorSection, { Label, Textarea } from "./EditorSection";

export default function SummaryEditor({ summary = {}, onChange }) {
  return (
    <EditorSection title="Professional Summary" icon={Zap} defaultOpen>
      <div className="text-left">
        <div className="flex items-center justify-between mb-1.5">
          <Label>Summary</Label>

        </div>
        <Textarea
          value={summary.text}
          onChange={(v) => onChange({ text: v })}
          rows={4}
          placeholder="Write a compelling 2-3 sentence summary highlighting your key achievements and expertise…"
        />
        <p className="text-[11px] text-muted-foreground mt-1 text-right">
          {(summary.text || "").length} chars
        </p>
      </div>
    </EditorSection>
  );
}
