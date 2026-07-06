import api from "../../../services/api";

export const interviewService = {
  generateInterview: (data) =>
    api.post("/interview/generate", data, { timeout: 180000 }),

  getHistory: () => api.get("/interview/history").then((res) => res.data),

  getSession: (id) => api.get(`/interview/${id}`).then((res) => res.data),

  toggleBookmark: (id) =>
    api.patch(`/interview/bookmark/${id}`).then((res) => res.data),

  deleteSession: (id) => api.delete(`/interview/${id}`).then((res) => res.data),

  getQuestionDetails: (id) =>
    api.post(`/interview/question/${id}/details`).then((res) => res.data),
};

export const generateInterview = (data) =>
  interviewService.generateInterview(data);

export const getInterviewHistory = () => interviewService.getHistory();

export const getInterviewSession = (id) => interviewService.getSession(id);

export const bookmarkQuestion = (id) => interviewService.toggleBookmark(id);

export const deleteInterviewSession = (id) =>
  interviewService.deleteSession(id);

export const getQuestionDetails = (id) =>
  interviewService.getQuestionDetails(id);
