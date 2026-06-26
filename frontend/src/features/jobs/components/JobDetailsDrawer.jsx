import { X, MapPin, Clock, DollarSign, ExternalLink, Bookmark, Briefcase, Globe, UserCheck } from "lucide-react";
import { getLogoColor } from "../utils/jobs.utils";

export default function JobDetailsDrawer({
  job,
  isOpen,
  onClose,
  isSaved,
  onSave,
  saving = false,
}) {
  if (!isOpen || !job) return null;

  const companyName = job.company_name || job.company || "Unknown Company";
  const jobTitle = job.job_title || job.title || "Job Opportunity";
  const location = job.location || "Remote";
  const empType = job.employment_type || job.type || "Full-time";
  const postedAt = job.posted_at || job.postedAgo || "Recently";
  const logoUrl = job.company_logo || null;
  const description = job.description || "No description provided.";
  const salary = job.salary || "Not disclosed";
  const website = job.company_website || null;
  const publisher = job.publisher || "Not specified";
  const applyUrl = job.apply_url || null;

  const firstLetter = companyName.charAt(0).toUpperCase();
  const logoBgColor = getLogoColor(companyName);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[500px] bg-card border-l border-border z-50 flex flex-col shadow-(--shadow-lg) animate-in slide-in-from-right duration-300">
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-10 h-10 rounded-2xl shrink-0 object-contain bg-muted border border-border"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{
                backgroundColor: logoBgColor,
                display: logoUrl ? "none" : "flex",
              }}
            >
              {firstLetter}
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-foreground truncate">
                {jobTitle}
              </h2>
              <p className="text-xs text-muted-foreground">{companyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/40 rounded-xl border border-border">
              <p className="text-[10px] text-muted-foreground mb-0.5 font-medium uppercase tracking-wide">
                Location
              </p>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                <MapPin size={12} className="text-muted-foreground" />
                {location}
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border">
              <p className="text-[10px] text-muted-foreground mb-0.5 font-medium uppercase tracking-wide">
                Employment Type
              </p>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Briefcase size={12} className="text-muted-foreground" />
                {empType}
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border">
              <p className="text-[10px] text-muted-foreground mb-0.5 font-medium uppercase tracking-wide">
                Posted Date
              </p>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Clock size={12} className="text-muted-foreground" />
                {postedAt}
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border">
              <p className="text-[10px] text-muted-foreground mb-0.5 font-medium uppercase tracking-wide">
                Salary
              </p>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                <DollarSign size={12} className="text-muted-foreground" />
                {salary}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <UserCheck size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Publisher</p>
                <p className="text-xs font-semibold text-foreground truncate">
                  {publisher}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Globe size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Company Website</p>
                {website ? (
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-primary hover:underline truncate flex items-center gap-1"
                  >
                    {website}
                    <ExternalLink size={10} />
                  </a>
                ) : (
                  <p className="text-xs font-semibold text-muted-foreground truncate">
                    No website available
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Full Job Description
            </h3>
            <div className="text-xs text-foreground leading-relaxed whitespace-pre-line bg-muted/20 border border-border rounded-2xl p-4 max-h-[300px] overflow-y-auto">
              {description}
            </div>
          </div>
        </div>

        <div className="shrink-0 p-5 border-t border-border bg-muted/20 flex gap-3">
          <button
            onClick={() => onSave(job)}
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isSaved
              ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              : "border-border text-foreground hover:bg-muted"
              }`}
          >
            <Bookmark size={14} className={isSaved ? "fill-primary" : ""} />
            {isSaved ? "Saved" : "Save Job"}
          </button>

          {applyUrl ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20 cursor-pointer"
            >
              Apply Now
              <ExternalLink size={14} />
            </a>
          ) : (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-bold cursor-not-allowed"
            >
              Apply Unavailable
            </button>
          )}
        </div>
      </div>
    </>
  );
}
