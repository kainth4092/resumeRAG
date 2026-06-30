import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { emailService } from "../services/emailService";
import { getResumes, getActiveResume } from "../../resume/services/resumeService";

export function useEmailModal({ open, onClose, initialResume }) {
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

  const isSendDisabled =
    sendState === "loading" ||
    attachments.length === 0 ||
    !subject.trim() ||
    !message.trim() ||
    !email.trim();

  return {
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
    setAttachments,
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
  };
}
