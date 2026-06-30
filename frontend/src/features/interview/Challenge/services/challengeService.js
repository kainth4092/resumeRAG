import api from "../../../../services/api";

export const challengeService = {
  getQuestions: () => api.get("/interview/challenge/questions").then((res) => res.data),
  submitChallenge: (data) => api.post("/interview/challenge/submit", data).then((res) => res.data),
};
