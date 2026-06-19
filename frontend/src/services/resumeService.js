import api from "./api"

export const uploadResume = (formData) => {
    return api.post("/resume/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}