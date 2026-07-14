import api from "../../../services/api";

export const uploadResume = (formData) => {
  return api.post("/resume/upload", formData, {
    timeout: 180000,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const setActiveResume = (resumeId) => {
  return api.post(`/resume/${resumeId}/active`).then((res) => res.data);
};

export const getResumes = () => {
  return api.get("/resume").then((res) => res.data);
};

export const getActiveResume = () => {
  return api.get("/resume/active").then((res) => res.data);
};

export const importProfileToResume = () => {
  return api.post("/resume/import-profile");
};

export const updateResume = (resumeId, data) => {
  return api.put(`/resume/${resumeId}`, data).then((res) => res.data);
};

export const getResumeById = (resumeId) => {
  return api.get(`/resume/${resumeId}`).then((res) => res.data);
};

export const deleteResume = (resumeId) => {
  return api.delete(`/resume/${resumeId}`).then((res) => res.data);
};
