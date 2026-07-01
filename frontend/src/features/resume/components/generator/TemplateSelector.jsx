import { TEMPLATE_REGISTRY } from "../resume/templates";
import TemplateItem from "./TemplateItem";
import PreviewPanel from "./PreviewPanel";

export default function TemplateSelector({
  selectedTemplateName,
  setSelectedTemplateName,
  hoveredTemplate,
  setHoveredTemplate,
  setMobilePreviewTemplate,
}) {
  const activePreviewTemplate = hoveredTemplate || selectedTemplateName;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
            Choose Resume Template
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a layout optimization. Hover over any design to see a full layout preview instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Area: Templates list */}
        <div className="lg:col-span-10 grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Object.values(TEMPLATE_REGISTRY).map((tpl) => {
            const isSelected = selectedTemplateName === tpl.name;
            return (
              <TemplateItem
                key={tpl.name}
                tpl={tpl}
                isSelected={isSelected}
                onSelect={() => setSelectedTemplateName(tpl.name)}
                onMouseEnter={() => setHoveredTemplate(tpl.name)}
                onMouseLeave={() => setHoveredTemplate(null)}
                onPreviewClick={() => setMobilePreviewTemplate(tpl.name)}
              />
            );
          })}
        </div>

        {/* Right Area: Instant Desktop Hover Preview Panel */}
        {/* <PreviewPanel
          activeTemplateName={activePreviewTemplate}
          onExpandClick={() => setMobilePreviewTemplate(activePreviewTemplate)}
        /> */}
      </div>
    </div>
  );
}
