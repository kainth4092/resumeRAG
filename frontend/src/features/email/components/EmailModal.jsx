import { useState, useEffect, useRef } from "react";
import { X, Mail, Send, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { emailService } from "../services/emailService";
import { EmailFields } from "./EmailFields";
import { ResumeSelector } from "./ResumeSelector";
import { AttachmentPreview } from "./AttachmentPreview";
import { SuccessView, ErrorView } from "./StatusViews";
import { getResumes, getActiveResume } from "../../resume/services/resumeService";

export function EmailModal({ open, onClose, initialResume = null }) {
  const { user } = useAuth();
  const userEmail = user?.email || "jordan@example.com";

  const [email, setEmail] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [resumesList, setResumesList] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [sendState, setSendState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [ccError, setCcError] = useState("");
  const [bccError, setBccError] = useState("");

  const modalRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSubject("");
      setMessage("");

      const loadResumes = async () => {
        try {
          const allResumes = await getResumes();
          const activeRes = await getActiveResume();

          const formattedResumes = (allResumes || []).map(r => ({
            id: r.id,
            name: r.title || r.original_filename || `Resume #${r.id}`,
            title: r.title || r.original_filename || `Resume #${r.id}`,
            original_filename: r.original_filename,
            is_active: r.is_active,
          }));

          setResumesList(formattedResumes);

          if (initialResume) {
            setSelectedResume(initialResume);
          } else if (activeRes && activeRes.active_resume_id) {
            const activeFormatted = formattedResumes.find(r => r.id === activeRes.active_resume_id) || {
              id: activeRes.active_resume_id,
              name: activeRes.title || activeRes.original_filename || "Active Resume",
              title: activeRes.title || activeRes.original_filename || "Active Resume",
              original_filename: activeRes.original_filename,
              is_active: true
            };
            setSelectedResume(activeFormatted);
          } else if (formattedResumes.length > 0) {
            setSelectedResume(formattedResumes[0]);
          } else {
            setSelectedResume(null);
          }
        } catch (err) {
          console.error("Failed to fetch resumes from backend", err);
          const resumesKey = user?.email ? `saved_resumes_${user.email}` : "saved_resumes";
          const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
          const formattedSaved = saved.map(r => ({
            id: r.id || 1,
            name: r.name || r.title || "Untitled Resume",
            title: r.title || "Untitled Resume",
            resume: r.resume
          }));
          setResumesList(formattedSaved);
          if (initialResume) {
            setSelectedResume(initialResume);
          } else if (formattedSaved.length > 0) {
            setSelectedResume(formattedSaved[0]);
          } else {
            setSelectedResume(null);
          }
        }
      };

      loadResumes();

      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);
    }
  }, [open, initialResume, user?.email]);

  useEffect(() => {
    if (selectedResume) {
      const resumeName = selectedResume.original_filename || selectedResume.name || selectedResume.title || selectedResume;
      const isDocx = typeof resumeName === "string" && resumeName.toLowerCase().endsWith(".docx");

      let formattedSize = "120 KB";
      if (selectedResume.resume) {
        const sizeBytes = JSON.stringify(selectedResume.resume).length;
        formattedSize = `${(sizeBytes / 1024).toFixed(1)} KB`;
      }

      setAttachments([
        {
          name: typeof resumeName === "string"
            ? (resumeName.endsWith(".pdf") || resumeName.endsWith(".docx") ? resumeName : `${resumeName}.pdf`)
            : "resume.pdf",
          size: formattedSize,
          type: isDocx ? "docx" : "pdf",
          data: selectedResume.resume || selectedResume,
        },
      ]);
    } else {
      setAttachments([]);
    }
  }, [selectedResume]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open && sendState !== "loading") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, sendState]);

  const validate = () => {
    let hasErrors = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setEmailError("");
    setCcError("");
    setBccError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Recipient email address is required.");
      hasErrors = true;
    } else if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      hasErrors = true;
    }

    if (cc.trim()) {
      const ccList = cc.split(",").map((e) => e.trim());
      const hasInvalidCc = ccList.some((e) => e !== "" && !emailRegex.test(e));
      if (hasInvalidCc) {
        setCcError("One or more CC email addresses are invalid.");
        hasErrors = true;
      }
    }

    if (bcc.trim()) {
      const bccList = bcc.split(",").map((e) => e.trim());
      const hasInvalidBcc = bccList.some((e) => e !== "" && !emailRegex.test(e));
      if (hasInvalidBcc) {
        setBccError("One or more BCC email addresses are invalid.");
        hasErrors = true;
      }
    }
    if (!hasErrors) {
      const allEmails = [];
      const primaryEmail = email.trim().toLowerCase();
      if (primaryEmail) allEmails.push(primaryEmail);

      if (cc.trim()) {
        cc.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean).forEach(e => allEmails.push(e));
      }
      if (bcc.trim()) {
        bcc.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean).forEach(e => allEmails.push(e));
      }

      const uniqueEmails = new Set(allEmails);
      if (uniqueEmails.size < allEmails.length) {
        setEmailError("Duplicate email addresses detected between Recipient, CC, and BCC.");
        hasErrors = true;
      }
    }

    return !hasErrors;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSendState("loading");
    setErrorMessage("");

    try {
      const activeRecipient = email.trim();
      const rawResumeId = selectedResume?.id || selectedResume?.resume_id;
      let resumeId = parseInt(rawResumeId, 10);
      if (isNaN(resumeId)) {
        resumeId = 1;
      }

      await emailService.send({
        recipientEmail: activeRecipient,
        subject: subject.trim(),
        message: message.trim(),
        resumeId: resumeId,
        templateId: selectedResume?.template || null,
        cc: cc.trim(),
        bcc: bcc.trim(),
      });

      setSendState("success");
    } catch (err) {
      console.error("[Email Modal] Error:", err);
      setSendState("error");
      setErrorMessage(err.message || "Failed to deliver email.");
    }
  };

  const handleClose = () => {
    if (sendState === "loading") return;
    setSendState("idle");
    setEmail("");
    setCc("");
    setBcc("");
    setEmailError("");
    setCcError("");
    setBccError("");
    onClose();
  };

  const handleRestoreAttachment = () => {
    if (selectedResume) {
      setSelectedResume({ ...selectedResume });
    } else if (resumesList.length > 0) {
      setSelectedResume(resumesList[0]);
    } else {
      setSelectedResume(null);
    }
  };

  if (!open) return null;

  const isSendDisabled =
    sendState === "loading" ||
    attachments.length === 0 ||
    !subject.trim() ||
    !message.trim() ||
    !email.trim();

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
