import api from "../../../services/api";

export const mockInterviewService = {
  getQuestions: (type) =>
    api
      .get(`/mock-interview/questions?type=${encodeURIComponent(type)}`)
      .then((res) => res.data),

  transcribeAudio: (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    return api
      .post("/mock-interview/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  },

  evaluateInterview: (answers) =>
    api.post("/mock-interview/evaluate", { answers }).then((res) => res.data),

  saveSession: (sessionData) =>
    api.post("/mock-interview/session", sessionData).then((res) => res.data),

  getHistory: () => api.get("/mock-interview/history").then((res) => res.data),

  getSessionDetails: (id) =>
    api.get(`/mock-interview/session/${id}`).then((res) => res.data),
};
