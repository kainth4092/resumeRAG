import { useState } from "react";
import { Loader2, CheckCircle2, Download } from "lucide-react";

export default function DownloadBtn({ format = "PDF", size = "sm", onDownload }) {
  const [state, setState] = useState("idle");

  const handle = async () => {
    setState("generating");
    try {
      await new Promise((r) => setTimeout(r, 2200));
      setState("done");
      onDownload?.();
    } catch (err) {
      console.error("Download action failed:", err);
      setState("idle");
      return;
    }
    await new Promise((r) => setTimeout(r, 1800));
    setState("idle");
  };

  const base =
    size === "sm"
      ? "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
      : "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer";

  if (state === "generating")
    return (
      <button
        disabled
        className={`${base} bg-muted text-muted-foreground cursor-not-allowed`}
      >
        <Loader2 size={size === "sm" ? 11 : 14} className="animate-spin" />
        Generating {format}…
      </button>
    );
  if (state === "done")
    return (
      <button
        disabled
        className={`${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}
      >
        <CheckCircle2 size={size === "sm" ? 11 : 14} />
        Downloaded!
      </button>
    );
  return (
    <button
      onClick={handle}
      className={`${base} border border-border text-foreground hover:bg-muted hover:border-primary/30 active:scale-[0.97]`}
    >
      <Download
        size={size === "sm" ? 11 : 14}
        className="text-muted-foreground"
      />
      {format}
    </button>
  );
}
