import { memo } from "react";
import { MapPin, Clock, Bookmark, Eye, Briefcase } from "lucide-react";
import { getLogoColor } from "../utils/jobs.utils";

function JobCard({ job, isSaved, onSave, onViewDetails, saving, loadingDetails }) {
  const companyName = job.company_name || job.company || "Unknown Company";
  const jobTitle = job.job_title || job.title || "Job Opportunity";
  const location = job.location || "Remote";
  const empType = job.employment_type || job.type || "Full-time";
  const postedAt = job.posted_at || job.postedAgo || "Recently";
  const logoUrl = job.company_logo || null;

  const firstLetter = companyName.charAt(0).toUpperCase();
  const logoBgColor = getLogoColor(companyName);

  return (
    <div
      onClick={loadingDetails ? null : onViewDetails}
      className={`bg-card border border-border rounded-2xl p-5 hover:shadow-(--shadow-md) hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group flex flex-col justify-between min-h-[190px] ${loadingDetails ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
    >
      <div>
        <div className="flex items-start gap-3 mb-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="w-11 h-11 rounded-2xl shrink-0 object-contain bg-muted border border-border"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm"
            style={{
              backgroundColor: logoBgColor,
              display: logoUrl ? "none" : "flex",
            }}
          >
            {firstLetter}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
              {jobTitle}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {companyName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-muted-foreground/75" />
            {location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase size={12} className="text-muted-foreground/75" />
            {empType}
          </span>
          <span className="flex items-center gap-1 ml-auto text-[11px]">
            <Clock size={12} className="text-muted-foreground/75" />
            {postedAt}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
        <button
          disabled={loadingDetails}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loadingDetails ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Eye size={12} />
              View Details
            </>
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave(job);
          }}
          disabled={saving}
          className={`px-3 py-2 flex items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${isSaved
            ? "bg-primary/10 border-primary/30 text-primary"
            : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
            }`}
          title={isSaved ? "Saved" : "Save Job"}
        >
          <Bookmark size={14} className={isSaved ? "fill-primary" : ""} />
        </button>
      </div>
    </div>
  );
}

export default memo(JobCard);
