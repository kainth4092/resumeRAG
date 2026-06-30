import api from "../../../services/api"

export const uploadResume = (formData) => {
    return api.post("/resume/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

export const setActiveResume = (resumeId) => {
    return api.post(`/resume/${resumeId}/active`).then((res) => res.data);
}

export const getResumes = () => {
    return api.get("/resume").then((res) => res.data);
}

export const getActiveResume = () => {
    return api.get("/resume/active").then((res) => res.data);
}