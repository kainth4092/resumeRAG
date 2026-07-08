import api from "../../../services/api";

export const getProfile = () => api.get("/profile");

export const createProfile = (data) => api.post("/profile", data);

export const updateProfile = (data) => api.put("/profile", data);

export const getComplete = () => api.get("/profile/complete");

export const extractProfileFromResume = (resumeId) =>
  api.post(
    "/profile/extract-from-resume",
    { resume_id: resumeId },
    { timeout: 180000 },
  );
