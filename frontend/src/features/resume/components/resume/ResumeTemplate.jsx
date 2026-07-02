import { TEMPLATE_REGISTRY } from "./templates";

export default function ResumeTemplate({
  resume,
  templateName = "Professional",
}) {
  if (!resume) return null;

  const r = resume.resume || resume;

  const activeTemplate = templateName || r.template || "Professional";
  const registryItem =
    TEMPLATE_REGISTRY[activeTemplate] || TEMPLATE_REGISTRY.Professional;
  const TargetTemplate = registryItem.component;

  return <TargetTemplate resume={resume} />;
}
