import { useState, useEffect } from "react";
import {
  Eye, Zap, Heart, CheckCircle2, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { TEMPLATE_REGISTRY } from "../components/resume/templates";
import { useAuth } from "../../auth/context/AuthContext";
import { MOCK_RESUME, TEMPLATE_METADATA } from "./templatesData";
import TemplateThumbnail from "../components/resume/templates/TemplateThumbnail";
import TemplatePreviewModal from "../components/resume/templates/TemplatePreviewModal";

export default function Templates() {
  const { user } = useAuth();
  const resumesKey = user?.email ? `saved_resumes_${user.email}` : "saved_resumes";
  const favKey = user?.email ? `favorited_templates_${user.email}` : "favorited_templates";

  const [activeResume, setActiveResume] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
      const active = saved.find((item) => item.status === "Active") || saved[0];
      if (active && active.resume) {
        setActiveResume(active.resume);
      }
    } catch (e) {
      console.error("Failed to load active resume for template rendering", e);
    }
  }, [user, resumesKey]);

  const [templates, setTemplates] = useState(() => {
    const defaultTemplate = localStorage.getItem("default_resume_template") || "Professional";
    let favoritedList = [];
    try {
      favoritedList = JSON.parse(localStorage.getItem(favKey) || "[]");
    } catch (e) { }

    return TEMPLATE_METADATA.map((t) => ({
      ...t,
      selected: t.name === defaultTemplate,
      favorited: favoritedList.includes(t.name),
      Component: TEMPLATE_REGISTRY[t.name]?.component || TEMPLATE_REGISTRY.Professional.component,
    }));
  });

  const [preview, setPreview] = useState(null);
  const [applying, setApplying] = useState(null);

  const selectedTpl = templates.find((t) => t.selected);
  const resumeToRender = activeResume || MOCK_RESUME;

  const toggleFav = (name) => {
    setTemplates((prev) =>
      prev.map((t) => (t.name === name ? { ...t, favorited: !t.favorited } : t))
    );

    let favoritedList = [];
    try {
      favoritedList = JSON.parse(localStorage.getItem(favKey) || "[]");
    } catch (e) { }

    if (favoritedList.includes(name)) {
      favoritedList = favoritedList.filter((f) => f !== name);
      toast.info(`Removed "${name}" from favorites`);
    } else {
      favoritedList.push(name);
      toast.success(`Added "${name}" to favorites`);
    }
    localStorage.setItem(favKey, JSON.stringify(favoritedList));
  };

  const applyTemplate = async (name) => {
    setApplying(name);
    await new Promise((r) => setTimeout(r, 1100));

    localStorage.setItem("default_resume_template", name);

    const lastResumeId = localStorage.getItem("last_generated_resume_id");
    if (lastResumeId) {
      const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
      const updated = saved.map((item) => {
        if (String(item.id) === String(lastResumeId)) {
          return { ...item, template: name };
        }
        return item;
      });
      localStorage.setItem(resumesKey, JSON.stringify(updated));
    }

    setTemplates((prev) =>
      prev.map((t) => ({ ...t, selected: t.name === name }))
    );
    setApplying(null);
    setPreview(null);
    toast.success(`"${name}" template applied successfully!`);
  };

  const THUMB_SCALE = 280 / 794;

  return (
    <div className="h-full overflow-y-auto bg-background text-left">

      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Resume Templates</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Premium, ATS-optimized designs.
              {selectedTpl && (
                <> Using: <span className="font-semibold text-foreground">{selectedTpl.name}</span></>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 duration-300">
          {templates.map((tpl) => {
            const isSelected = tpl.selected;
            const isApplying = applying === tpl.name;

            return (
              <div
                key={tpl.name}
                className="group bg-card border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-(--shadow-lg) hover:-translate-y-1"
                style={{
                  borderColor: isSelected ? tpl.accent + "60" : undefined,
                  borderWidth: isSelected ? 1.5 : 1,
                  boxShadow: isSelected ? `0 0 0 3px ${tpl.accent}15` : undefined,
                }}
                onClick={() => setPreview(tpl)}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ height: 300, backgroundColor: tpl.accentBg }}
                >
                  <TemplateThumbnail TemplateComponent={tpl.Component} scale={THUMB_SCALE} resume={resumeToRender} />

                  <div
                    className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                    style={{ background: `linear-gradient(to bottom, transparent, ${tpl.accentBg}DD)` }}
                  />

                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ backgroundColor: "rgba(0,0,0,0.25)", backdropFilter: "blur(2px)" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreview(tpl); }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold shadow-lg hover:bg-gray-50 active:scale-[0.97] transition-all cursor-pointer"
                    >
                      <Eye size={15} /> Preview
                    </button>
                    <button
                      onClick={async (e) => { e.stopPropagation(); await applyTemplate(tpl.name); }}
                      disabled={isApplying || isSelected}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg active:scale-[0.97] transition-all disabled:opacity-70 hover:opacity-90 cursor-pointer"
                      style={{ backgroundColor: tpl.accent }}
                    >
                      {isApplying ? <><Loader2 size={14} className="animate-spin" /> Applying…</> : isSelected ? <><CheckCircle2 size={14} /> Active</> : <><Zap size={14} /> Use Template</>}
                    </button>
                  </div>

                  {isSelected && (
                    <div
                      className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white shadow-md animate-in zoom-in-50 duration-200"
                      style={{ backgroundColor: tpl.accent }}
                    >
                      <CheckCircle2 size={11} /> Active Template
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFav(tpl.name); }}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-xl bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                    style={{ color: tpl.favorited ? "#ef4444" : "#9ca3af" }}
                  >
                    <Heart size={14} className={tpl.favorited ? "fill-red-500" : ""} />
                  </button>
                </div>

                <div className="p-5 text-left">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-foreground leading-none">{tpl.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{tpl.subtitle}</p>
                    </div>
                    {tpl.favorited && <Heart size={14} className="fill-red-500 text-red-500 shrink-0 mt-0.5" />}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{tpl.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-lg border border-border bg-muted text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreview(tpl); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/30 active:scale-[0.97] transition-all cursor-pointer"
                      >
                        <Eye size={12} /> Preview
                      </button>
                      <button
                        onClick={async (e) => { e.stopPropagation(); await applyTemplate(tpl.name); }}
                        disabled={isApplying || isSelected}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white active:scale-[0.97] transition-all disabled:opacity-60 hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: isSelected ? "#10b981" : tpl.accent }}
                      >
                        {isApplying
                          ? <><Loader2 size={12} className="animate-spin" /> Applying…</>
                          : isSelected
                            ? <><CheckCircle2 size={12} /> Active</>
                            : <><Zap size={12} /> Use</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {preview && (
        <TemplatePreviewModal
          template={preview}
          onClose={() => setPreview(null)}
          onApply={() => applyTemplate(preview.name)}
          onFavorite={() => toggleFav(preview.name)}
          applying={applying === preview.name}
          resume={resumeToRender}
        />
      )}
    </div>
  );
}
