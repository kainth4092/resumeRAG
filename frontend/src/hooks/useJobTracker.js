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
import { exportToCSV } from "../utils/jobs.utils";

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
      const data = await recommendedJobs();
      setJobs(data || []);
    } catch (e) {
      // Failed silently
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTrackedJobs = useCallback(async () => {
    try {
      const data = await getTrackedJobs();
      setTrackedJobs(data || []);
    } catch (e) {
      // Failed silently
    }
  }, []);

  // Fetch Recommended and Tracked Jobs on mount
  useEffect(() => {
    loadRecommended();
    loadTrackedJobs();
  }, [loadRecommended, loadTrackedJobs]);

  const handleSearch = useCallback(async (queryStr) => {
    if (!queryStr.trim()) {
      loadRecommended();
      return;
    }
    setLoading(true);
    try {
      const data = await searchJobs(queryStr);
      setJobs(data || []);
    } catch (e) {
      // Failed silently
    } finally {
      setLoading(false);
    }
  }, [loadRecommended]);

  const handleViewDetails = useCallback(async (job) => {
    const jobId = job.job_id || job.id;
    setLoading(true);
    try {
      const detailedJob = await getJob(jobId);
      setSelectedJob(detailedJob);
      setDrawerOpen(true);
    } catch (e) {
      // Failed silently
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveJob = useCallback(async (job) => {
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
      // Failed silently
    } finally {
      setSaving(false);
    }
  }, [trackedJobs, loadTrackedJobs]);

  const handleStatusChange = useCallback(async (jobId, newStatus) => {
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
      // Failed silently
    }
  }, [loadTrackedJobs]);

  const handleDeleteTracked = useCallback(async (jobId) => {
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
      // Failed silently
    }
  }, [loadTrackedJobs]);

  const handleExportCSV = useCallback(() => {
    exportToCSV(trackedJobs);
  }, [trackedJobs]);

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
    handleExportCSV,
  };
}
