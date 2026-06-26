import api from "../../../services/api"

export const analyzeResume = (data) => {
    return api.post("/generator/analyze", data)
}

export const generateResume = (data) => {
    return api.post("/generator/generate", data)
}