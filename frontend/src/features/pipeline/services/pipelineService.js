import api from "../../../services/api";

/**
 * Pipeline Service for Phase 4: Job Description -> Tailored Resume -> Jobs -> Interview -> Roadmap
 */

export const createPipelineRun = async (data) => {
  const response = await api.post("/pipeline/runs", data);
  return response.data;
};

export const getPipelineRun = async (runId) => {
  const response = await api.get(`/pipeline/runs/${runId}`);
  return response.data;
};

export const listPipelineRuns = async (limit = 10) => {
  const response = await api.get("/pipeline/runs", {
    params: { limit },
  });
  return response.data;
};

export const getRecommendedJobsByResume = async (resumeId) => {
  const response = await api.get("/jobs/recommended", {
    params: { resume_id: resumeId },
  });
  return response.data;
};

export const getInterviewSessionByResume = async (resumeId) => {
  const response = await api.get(`/interview/session-by-resume/${resumeId}`);
  return response.data;
};

export const getRoadmapByResume = async (resumeId) => {
  const response = await api.get("/roadmap", {
    params: { resume_id: resumeId },
  });
  return response.data;
};

export const getResumeById = async (resumeId) => {
  const response = await api.get(`/resumes/${resumeId}`);
  return response.data;
};
