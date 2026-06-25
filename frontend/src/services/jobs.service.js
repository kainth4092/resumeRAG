import api from "./api";

export const recommendedJobs = () => {
  return api.get("/jobs/recommended").then((res) => res.data);
};
export const searchJobs = (query) => {
  return api.get(`/jobs/search?query=${encodeURIComponent(query)}`).then((res) => res.data);
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
