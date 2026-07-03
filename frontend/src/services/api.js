import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL =
  configuredApiUrl && !configuredApiUrl.includes("YOUR_RENDER_BACKEND_URL")
    ? configuredApiUrl
    : import.meta.env.DEV
      ? "http://localhost:8000/api"
      : "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;
