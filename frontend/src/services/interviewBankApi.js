import api from "./api";

export const retrieveInterviewQuestions = (payload) => {
  return api.post("/interview-bank/retrieve", payload);
};

export const getAllInterviewQuestions = (params) => {
  return api.get("/interview-bank", { params });
};

export const createInterviewQuestion = (payload) => {
  return api.post("/interview-bank", payload);
};

export const updateInterviewQuestion = (id, payload) => {
  return api.patch(`/interview-bank/${id}`, payload);
};

export const deleteInterviewQuestion = (id) => {
  return api.delete(`/interview-bank/${id}`);
};
