import api from "./api";

export const retrieveInterviewQuestions = (payload) => {
    return api.post("/api/interview-bank/retrieve", payload);
};

export const getAllInterviewQuestions = () => {
    return api.get("/api/interview-bank");
};

export const createInterviewQuestion = (payload) => {
    return api.post("/api/interview-bank", payload);
};

export const updateInterviewQuestion = (id, payload) => {
    return api.patch(`/api/interview-bank/${id}`, payload);
};

export const deleteInterviewQuestion = (id) => {
    return api.delete(`/api/interview-bank/${id}`);
};