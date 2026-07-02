import api from "../../../services/api";

export const analyzeResume = (data) => {
  return api.post("/generator/analyze", data);
};

export const generateResume = (data) => {
  return api.post("/generator/generate", data);
};

export const analyzeResumeHealth = (data) => {
  return api.post("/generator/analyze-health", data);
};

export const improveResumeSection = (data) => {
  return api.post("/generator/improve-section", data);
};

export const getResumeHealth = (resumeId) => {
  return api.get(`/generator/${resumeId}/health`);
};
