import { FileText, Paperclip, X } from "lucide-react";


export function AttachmentPreview({ attachments = [], onRemove }) {
  if (attachments.length === 0) {
    return (
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
          Attachments (0)
        </label>
        <div className="flex items-center justify-center p-4 border border-dashed border-border rounded-xl bg-muted/10 text-xs text-muted-foreground">
          <Paperclip size={13} className="mr-1.5 text-muted-foreground animate-pulse" />
          No attachments loaded.
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
        Attachments ({attachments.length})
      </label>
      <div className="space-y-2 max-h-36 overflow-y-auto">
        {attachments.map((file, idx) => {
          const fileName = file.name || "resume.pdf";
          const isDocx = fileName.toLowerCase().endsWith(".docx") || file.type?.toLowerCase() === "docx" || file.type?.includes("word");
          const displaySize = file.size || "120 KB";

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-muted/40 border border-border rounded-xl hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileText size={16} />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold text-foreground truncate">{fileName}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {isDocx ? "DOCX Document" : "PDF Document"} • {displaySize}
                  </p>
                </div>
              </div>

              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-all duration-150 cursor-pointer"
                  title="Remove Attachment"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
