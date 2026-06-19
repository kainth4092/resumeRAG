import api from "./api"


export const getProfile = () => api.get("/profile")

export const createProfile = (data) => api.post("/profile", data)

export const updateProfile = (data) => api.put("/profile", data)

export const getComplete = () => api.get("/profile/complete")