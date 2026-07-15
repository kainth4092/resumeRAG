import api from "../../../services/api";

export const mockInterviewService = {
  getQuestions: (type) =>
    api
      .get(`/mock-interview/questions?type=${encodeURIComponent(type)}`)
      .then((res) => res.data),

  transcribeAudio: (audioBlob, prompt, language = "en") => {
    const formData = new FormData();
    let filename = "recording.webm";
    if (audioBlob && audioBlob.type) {
      if (audioBlob.type.includes("wav")) {
        filename = "recording.wav";
      } else if (
        audioBlob.type.includes("mp4") ||
        audioBlob.type.includes("m4a")
      ) {
        filename = "recording.mp4";
      } else if (audioBlob.type.includes("ogg")) {
        filename = "recording.ogg";
      } else if (
        audioBlob.type.includes("mpeg") ||
        audioBlob.type.includes("mp3")
      ) {
        filename = "recording.mp3";
      }
    }
    formData.append("file", audioBlob, filename);
    if (prompt) {
      formData.append("prompt", prompt);
    }
    if (language) {
      formData.append("language", language);
    }
    return api
      .post("/mock-interview/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  },

  evaluateInterview: (answers) =>
    api
      .post(
        "/mock-interview/evaluate",
        { answers },
        {
          timeout: 150000,
        },
      )
      .then((res) => res.data),

  saveSession: (sessionData) =>
    api.post("/mock-interview/session", sessionData).then((res) => res.data),

  getHistory: () => api.get("/mock-interview/history").then((res) => res.data),

  getSessionDetails: (id) =>
    api.get(`/mock-interview/session/${id}`).then((res) => res.data),
};
