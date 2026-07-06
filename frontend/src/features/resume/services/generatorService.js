import api from "../../../services/api";

export const analyzeResume = (data) => {
  return api.post("/generator/analyze", data, { timeout: 120000 });
};

export const generateResume = (data) => {
  return api.post("/generator/generate", data, { timeout: 180000 });
};

export const analyzeResumeHealth = (data) => {
  return api.post("/generator/analyze-health", data, { timeout: 120000 });
};

export const improveResumeSection = (data) => {
  return api.post("/generator/improve-section", data, { timeout: 120000 });
};

export const getResumeHealth = (resumeId) => {
  return api.get(`/generator/${resumeId}/health`);
};
