import api from "../../../services/api";

export const getExperiences = () => api.get("/experience");

export const createExperience = (data) => api.post("/experience", data);

export const updateExperience = (id, data) =>
  api.put(`/experience/${id}`, data);

export const deleteExperience = (id) => api.delete(`/experience/${id}`);
