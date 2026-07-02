import api from "../../../services/api";

export const retrieveInterviewQuestions = (payload) => {
  return api.post("/interview-bank/retrieve", payload);
};

export const getAllInterviewQuestions = (params) => {
  return api.get("/interview-bank", { params });
};

export const createInterviewQuestion = (payload) => {
  return api.post("/interview-bank", payload);
};

export const getInterviewQuestionById = (id) => {
  return api.get(`/interview-bank/${id}`);
};

export const updateInterviewQuestion = (id, payload) => {
  return api.patch(`/interview-bank/${id}`, payload);
};

export const deleteInterviewQuestion = (id) => {
  return api.delete(`/interview-bank/${id}`);
};

export const getInterviewBankMeta = () => {
  return api.get("/interview-bank/meta");
};

export const generateAIAnswer = (payload) => {
  return api.post("/interview-bank/generate-answer", payload);
};

export const toggleBankBookmark = (questionId) => {
  return api.post("/bookmarks/", { question_id: questionId });
};
