import JobCard from "./JobCard";
import { SkeletonCard } from "./LoadingSkeleton";

export default function JobGrid({
  jobs = [],
  loading = false,
  savedJobIds = new Set(),
  onSave,
  onViewDetails,
  savingJobId = null,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {jobs.map((job) => {
        const jobId = job.job_id || job.id;
        const isSaved = savedJobIds.has(jobId);
        return (
          <JobCard
            key={jobId}
            job={job}
            isSaved={isSaved}
            onSave={onSave}
            onViewDetails={() => onViewDetails(job)}
            saving={savingJobId === jobId}
          />
        );
      })}
    </div>
  );
}
