import { useState } from "react";
import { X, Heart, Download, CheckCircle2, Loader2, Sparkles, Star, Zap } from "lucide-react";
import { downloadPDF } from "../../../../../utils/exporter";

export default function TemplatePreviewModal({
  template: tpl,
  onClose,
  onApply,
  onFavorite,
  applying,
  resume,
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      downloadPDF(resume, `${resume.personal_info?.name || "Optimized"}_Resume.pdf`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (e) {
      console.error("Failed to download PDF", e);
    } finally {
      setDownloading(false);
    }
  };

  const MODAL_PREVIEW_SCALE = 600 / 794;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-in fade-in-0 duration-200" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-(--shadow-lg)overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-200 max-h-[95vh]">

        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#e5e7eb" }}>
              <Sparkles size={17} style={{ color: "#6b7280" }} />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-foreground text-base font-bold">{tpl.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#f3f4f6", color: "#374151" }}>
                  {tpl.badge}
                </span>
                {tpl.selected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={9} /> Active
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{tpl.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">

            <button
              onClick={onFavorite}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${tpl.favorited ? "border-red-500/30 bg-red-500/10 text-red-500" : "border-border text-muted-foreground hover:border-red-400/40 hover:text-red-400"}`}
            >
              <Heart size={15} className={tpl.favorited ? "fill-red-500" : ""} />
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading || downloaded}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted active:scale-[0.97] disabled:opacity-70 transition-all cursor-pointer"
            >
              {downloading
                ? <><Loader2 size={14} className="animate-spin" /> Downloading…</>
                : downloaded
                  ? <><CheckCircle2 size={14} className="text-emerald-500" /> Downloaded!</>
                  : <><Download size={14} /> Download</>
              }
            </button>

            <button
              onClick={onApply}
              disabled={applying || tpl.selected}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white active:scale-[0.97] disabled:opacity-60 transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: tpl.accent === "#000000" ? "#1a1a1a" : tpl.accent }}
            >
              {applying ? <><Loader2 size={14} className="animate-spin" /> Applying…</>
                : tpl.selected ? <><CheckCircle2 size={14} /> Active Template</>
                  : <><Zap size={14} /> Use Template</>
              }
            </button>

            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1 cursor-pointer">
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-6 px-6 py-3 bg-muted/20 border-b border-border flex-wrap">
          <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> ATS Score: {tpl.ats}%
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star size={13} className="fill-amber-400 text-amber-400" /> {tpl.stars} ({tpl.uses} users)
          </div>
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {tpl.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-muted border border-border text-muted-foreground">{tag}</span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-zinc-900 p-8">
          <div
            className="mx-auto shadow-2xl rounded-xl overflow-hidden border border-black/10"
            style={{ width: 600 }}
          >
            <div style={{ position: "relative", width: 600, overflow: "hidden" }}>
              <div
                style={{
                  width: 794,
                  transform: `scale(${MODAL_PREVIEW_SCALE})`,
                  transformOrigin: "top left",
                  height: "auto",
                }}
              >
                <tpl.Component scale={1} resume={resume} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
