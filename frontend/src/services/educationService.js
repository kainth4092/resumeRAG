import api from "./api";

export const getEducation = () => api.get("/education");

export const createEducation = (data) => api.post("/education", data);

export const updateEducation = (id, data) => api.put(`/education/${id}`, data);

export const deleteEducation = (id) => api.delete(`/education/${id}`);
