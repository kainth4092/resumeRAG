import api from "../../../services/api";

export const recommendedJobs = (location = "", jobType = "", remote = "") => {
  let url = "/jobs/recommended?";
  if (location) url += `location=${encodeURIComponent(location)}&`;
  if (jobType) url += `employment_type=${encodeURIComponent(jobType)}&`;
  if (remote) url += `remote=${encodeURIComponent(remote)}&`;
  if (url.endsWith("&") || url.endsWith("?")) {
    url = url.slice(0, -1);
  }
  return api.get(url).then((res) => res.data);
};
export const searchJobs = (query, location = "", jobType = "", remote = "") => {
  let url = `/jobs/search?query=${encodeURIComponent(query)}&`;
  if (location) url += `location=${encodeURIComponent(location)}&`;
  if (jobType) url += `employment_type=${encodeURIComponent(jobType)}&`;
  if (remote) url += `remote=${encodeURIComponent(remote)}&`;
  if (url.endsWith("&")) {
    url = url.slice(0, -1);
  }
  return api.get(url).then((res) => res.data);
};

export const getJob = (jobId) => {
  return api.get(`/jobs/${jobId}`).then((res) => res.data);
};

export const saveJob = (job) => {
  return api.post("/jobs/save", job).then((res) => res.data);
};

export const getTrackedJobs = () => {
  return api.get("/tracker/").then((res) => res.data);
};

export const updateJobStatus = (jobId, status) => {
  return api.patch(`/tracker/${jobId}`, { status }).then((res) => res.data);
};

export const deleteTrackedJob = (jobId) => {
  return api.delete(`/tracker/${jobId}`).then((res) => res.data);
};
