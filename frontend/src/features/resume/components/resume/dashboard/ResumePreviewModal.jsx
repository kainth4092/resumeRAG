import React, { useState } from "react";
import { FileText, Edit2, Trash2, X, Printer } from "lucide-react";
import ResumeTemplate from "../ResumeTemplate";
import { STATUS_STYLES } from "./constants";
import { TEMPLATE_REGISTRY } from "../templates";
import { useAuth } from "../../../../../context/AuthContext";

function PreviewModal({ resume, onClose, onEdit, onDelete, onUpdate }) {
  const { user } = useAuth();
  const resumesKey = user?.email ? `saved_resumes_${user.email}` : "saved_resumes";
  const [activeTemplate, setActiveTemplate] = useState(resume.template || "Professional");

  const handleTemplateChange = (newTemplate) => {
    setActiveTemplate(newTemplate);
    const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
    const updated = saved.map((item) => {
      if (String(item.id) === String(resume.id)) {
        return { ...item, template: newTemplate };
      }
      return item;
    });
    localStorage.setItem(resumesKey, JSON.stringify(updated));
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-(--shadow-lg) overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-200 max-h-[92vh]">
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {resume.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[resume.status] || STATUS_STYLES.Active}`}
                >
                  {resume.status || "Active"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={activeTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="h-8 px-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted transition-all"
            >
              {Object.keys(TEMPLATE_REGISTRY).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 px-6 py-6 font-sans">
          <div className="max-w-[640px] mx-auto shadow-(--shadow-lg) rounded-xl overflow-hidden border border-black/10">
            <ResumeTemplate resume={resume} templateName={activeTemplate} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResumePreviewModal({
  previewResume,
  setPreviewResume,
  handleEdit,
  setDeleteTarget,
  onUpdate,
}) {
  return (
    <>
      {previewResume && (
        <PreviewModal
          resume={previewResume}
          onClose={() => setPreviewResume(null)}
          onEdit={() => handleEdit(previewResume)}
          onDelete={() => {
            setDeleteTarget(previewResume);
            setPreviewResume(null);
          }}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
