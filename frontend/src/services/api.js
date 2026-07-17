import axios from "axios";

const getBaseURL = () => {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:8000/api";
  }
  return import.meta.env.VITE_API_URL || "/api";
};

const getCache = new Map();
const inFlightRequests = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (
    config.method?.toLowerCase() === "get" &&
    !config.url?.includes("/auth/me")
  ) {
    const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`;
    config.cacheKey = cacheKey;

    const bypassCache =
      config.bypassCache || config.headers?.["x-bypass-cache"] === "true";

    if (!bypassCache) {
      const cached = getCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        config.adapter = () => {
          return Promise.resolve({
            data: cached.data,
            headers: cached.headers,
            status: cached.status,
            statusText: cached.statusText,
            config,
          });
        };
      }
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const config = response.config;
    const method = config.method?.toLowerCase();

    // Clear GET cache when a mutating request (POST, PUT, DELETE, PATCH) is successful
    if (method && ["post", "put", "delete", "patch"].includes(method)) {
      getCache.clear();
      inFlightRequests.clear();
    }

    if (
      config.method?.toLowerCase() === "get" &&
      config.cacheKey &&
      !config.url?.includes("/auth/me")
    ) {
      getCache.set(config.cacheKey, {
        data: response.data,
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    if (error.response && error.response.status === 401) {
      const isAuthRequest =
        config?.url &&
        (config.url.includes("/auth/login") ||
          config.url.includes("/auth/google"));
      if (!isAuthRequest) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        localStorage.removeItem("remember_me");
        localStorage.removeItem("token_expiry");
        sessionStorage.removeItem("session_active");
        api.clearCache();

        const publicPages = ["/", "/login", "/register", "/terms", "/privacy"];
        const currentPath = window.location.pathname;
        if (!publicPages.includes(currentPath)) {
          window.location.href = "/";
        }
      }
      return Promise.reject(error);
    }

    const method = config?.method?.toLowerCase();
    const shouldRetry =
      method === "get" ||
      (method === "post" &&
        (config.url?.includes("/auth/login") ||
          config.url?.includes("/auth/google")));

    if (config && shouldRetry) {
      const isNetworkError = !error.response;
      const status = error.response?.status;
      const retryable =
        !status ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      if (isNetworkError || retryable) {
        config.retryCount = config.retryCount || 0;
        const maxRetries = 2;

        if (config.retryCount < maxRetries) {
          config.retryCount += 1;
          const delay = Math.min(1000 * Math.pow(2, config.retryCount), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return api.request(config);
        }
      }
    }

    return Promise.reject(error);
  },
);

// Add custom request wrappers to support deduplication
const originalGet = api.get;
api.get = function (url, config = {}) {
  const cacheKey = `${url}?${JSON.stringify(config.params || {})}`;
  const bypassCache =
    config.bypassCache || config.headers?.["x-bypass-cache"] === "true";

  if (bypassCache) {
    getCache.delete(cacheKey);
  }

  if (!bypassCache && !url?.includes("/auth/me")) {
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }
  }

  const promise = originalGet
    .call(api, url, config)
    .then((res) => {
      inFlightRequests.delete(cacheKey);
      return res;
    })
    .catch((err) => {
      inFlightRequests.delete(cacheKey);
      throw err;
    });

  if (!bypassCache && !url?.includes("/auth/me")) {
    inFlightRequests.set(cacheKey, promise);
  }

  return promise;
};

api.invalidateCache = (prefix) => {
  [...getCache.keys()].forEach((key) => {
    if (key.startsWith(prefix)) {
      getCache.delete(key);
    }
  });
};

api.clearCache = () => {
  getCache.clear();
  inFlightRequests.clear();
  if (api.defaults.headers.common) {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
