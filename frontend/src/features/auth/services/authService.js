import api from "../../../services/api";

export const registerUser = (data) => api.post("/auth/register", data);

export const loginUser = (data) => api.post("/auth/login", data);

export const getCurrentUser = () => api.get("/auth/me");

export const googleLoginUser = (data) => api.post("/auth/google", data);

export const forgotPassword = (data) => api.post("/auth/forgot-password", data);

export const resetPassword = (data) => api.post("/auth/reset-password", data);
