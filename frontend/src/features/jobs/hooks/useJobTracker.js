import { useState, useEffect, useCallback } from "react";
import {
  recommendedJobs,
  searchJobs,
  getJob,
  saveJob,
  getTrackedJobs,
  updateJobStatus,
  deleteTrackedJob,
} from "../services/jobs.service";

export function useJobTracker() {
  const [tab, setTab] = useState("discover");
  const [jobs, setJobs] = useState([]);
  const [trackedJobs, setTrackedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Discover Filters
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [jobType, setJobType] = useState("");
  const [remote, setRemote] = useState("");

  // Application Filters
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  // Add Job Modal
  const [addJobOpen, setAddJobOpen] = useState(false);

  const loadRecommended = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recommendedJobs(location, jobType, remote);
      setJobs(data || []);
    } catch (e) {
      console.error("Failed to load recommended jobs:", e);
    } finally {
      setLoading(false);
    }
  }, [location, jobType, remote]);

  const loadTrackedJobs = useCallback(async () => {
    try {
      const data = await getTrackedJobs();
      setTrackedJobs(data || []);
      window.dispatchEvent(new CustomEvent("tracker-updated", { detail: data?.length || 0 }));
    } catch (e) {
      console.error("Failed to load tracked jobs:", e);
    }
  }, []);

  const handleSearch = useCallback(
    async (queryStr) => {
      if (!queryStr.trim()) {
        loadRecommended();
        return;
      }
      setLoading(true);
      try {
        const data = await searchJobs(queryStr, location, jobType, remote);
        setJobs(data || []);
      } catch (e) {
        console.error("Failed to search jobs:", e);
      } finally {
        setLoading(false);
      }
    },
    [loadRecommended, location, jobType, remote],
  );

  useEffect(() => {
    if (search.trim()) {
      handleSearch(search);
    } else {
      loadRecommended();
    }
  }, [location, jobType, remote, loadRecommended, handleSearch, search]);

  useEffect(() => {
    loadTrackedJobs();
  }, [loadTrackedJobs]);

  const handleViewDetails = useCallback(async (job) => {
    const jobId = job.job_id || job.id;
    setLoading(true);
    try {
      const detailedJob = await getJob(jobId);
      setSelectedJob(detailedJob);
      setDrawerOpen(true);
    } catch (e) {
      console.error("Failed to fetch job details:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveJob = useCallback(
    async (job) => {
      setSaving(true);
      const jobId = job.job_id || job.id;
      try {
        const isSaved = trackedJobs.some((tj) => tj.job_id === jobId);
        if (isSaved) {
          return;
        }

        const payload = {
          job_id: jobId,
          company_name: job.company_name || job.company || "Unknown Company",
          job_title: job.job_title || job.title || "Job Opportunity",
          company_logo: job.company_logo || null,
          location: job.location || "Remote",
          employment_type: job.employment_type || job.type || "Full-time",
          apply_url: job.apply_url || job.jobLink || null,
          posted_at: job.posted_at || job.postedAgo || "Recently",
        };

        await saveJob(payload);
        loadTrackedJobs();
      } catch (e) {
        console.error("Failed to save job:", e);
      } finally {
        setSaving(false);
      }
    },
    [trackedJobs, loadTrackedJobs],
  );

  const handleStatusChange = useCallback(
    async (jobId, newStatus) => {
      try {
        await updateJobStatus(jobId, newStatus);
        loadTrackedJobs();
        setSelectedApp((prev) => {
          if (prev && prev.job_id === jobId) {
            return { ...prev, status: newStatus };
          }
          return prev;
        });
      } catch (e) {
        console.error("Failed to update status:", e);
      }
    },
    [loadTrackedJobs],
  );

  const handleDeleteTracked = useCallback(
    async (jobId) => {
      try {
        await deleteTrackedJob(jobId);
        loadTrackedJobs();
        setSelectedApp((prev) => {
          if (prev && prev.job_id === jobId) {
            return null;
          }
          return prev;
        });
      } catch (e) {
        console.error("Failed to delete tracked job:", e);
      }
    },
    [loadTrackedJobs],
  );

  return {
    tab,
    setTab,
    jobs,
    trackedJobs,
    loading,
    selectedJob,
    setSelectedJob,
    search,
    setSearch,
    drawerOpen,
    setDrawerOpen,
    saving,
    location,
    setLocation,
    experience,
    setExperience,
    jobType,
    setJobType,
    remote,
    setRemote,
    appSearch,
    setAppSearch,
    appStatusFilter,
    setAppStatusFilter,
    selectedApp,
    setSelectedApp,
    menuOpen,
    setMenuOpen,
    addJobOpen,
    setAddJobOpen,
    loadRecommended,
    loadTrackedJobs,
    handleSearch,
    handleViewDetails,
    handleSaveJob,
    handleStatusChange,
    handleDeleteTracked,
  };
}
