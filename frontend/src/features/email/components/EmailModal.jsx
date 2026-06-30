import { X, Mail, Send, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { EmailFields } from "./EmailFields";
import { ResumeSelector } from "./ResumeSelector";
import { AttachmentPreview } from "./AttachmentPreview";
import { SuccessView, ErrorView } from "./StatusViews";
import { useEmailModal } from "../hooks/useEmailModal";

export function EmailModal({ open, onClose, initialResume = null }) {
  const {
    userEmail,
    email,
    setEmail,
    cc,
    setCc,
    bcc,
    setBcc,
    subject,
    setSubject,
    message,
    setMessage,
    resumesList,
    selectedResume,
    setSelectedResume,
    attachments,
    sendState,
    setSendState,
    errorMessage,
    emailError,
    ccError,
    bccError,
    modalRef,
    handleSend,
    handleClose,
    handleRestoreAttachment,
    isSendDisabled,
  } = useEmailModal({ open, onClose, initialResume });

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-dialog-title"
      ref={modalRef}
      tabIndex="-1"
      className="fixed inset-0 z-200 flex items-center justify-center p-4 outline-hidden"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-(--shadow-lg) overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">

        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail size={15} className="text-primary" />
            </div>
            <h3 id="email-dialog-title" className="font-bold text-foreground">
              Send Resume
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={sendState === "loading"}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 p-1 rounded-lg hover:bg-muted/50 cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {sendState === "success" ? (
          <SuccessView onClose={handleClose} />
        ) : sendState === "error" ? (
          <ErrorView
            error={errorMessage}
            onRetry={handleSend}
            onBack={() => setSendState("idle")}
          />
        ) : (
          <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">

            <EmailFields
              email={email}
              setEmail={setEmail}
              cc={cc}
              setCc={setCc}
              bcc={bcc}
              setBcc={setBcc}
              emailError={emailError}
              ccError={ccError}
              bccError={bccError}
              userEmail={userEmail}
            />

            <ResumeSelector
              selectedResume={selectedResume}
              setSelectedResume={setSelectedResume}
              resumes={resumesList}
            />

            <AttachmentPreview
              attachments={attachments}
              onRemove={() => setAttachments([])}
            />

            {attachments.length === 0 && (
              <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>Resume attachment missing!</span>
                </div>
                <button
                  type="button"
                  onClick={handleRestoreAttachment}
                  className="text-[10px] uppercase font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Re-attach
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-input-background border border-border rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/25 focus:border-primary/50 resize-none transition-all"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted/50 transition-all cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSendDisabled}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all shadow-xs shadow-primary/25 cursor-pointer"
              >
                {sendState === "loading" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Resume
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailModal;
