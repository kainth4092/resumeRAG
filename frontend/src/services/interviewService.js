import api from "./api";

export const generateInterview = (data) =>
    api.post("/interview/generate", data);

export const evaluateAnswer = (data) =>
    api.post("/interview/evaluate", data);

export const getInterviewHistory = () =>
    api.get("/interview/history");

export const getInterviewSession = (id) =>
    api.get(`/interview/${id}`);

export const bookmarkQuestion = (id) =>
    api.patch(`/interview/bookmark/${id}`);

export const deleteInterviewSession = (id) =>
    api.delete(`/interview/${id}`);