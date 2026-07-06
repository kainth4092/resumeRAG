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

// In-memory cache and in-flight request deduplication
const getCache = new Map();
const inFlightRequests = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // 15 seconds default timeout
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Cache GET requests
  if (config.method?.toLowerCase() === "get") {
    const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`;
    config.cacheKey = cacheKey;

    const bypassCache = config.bypassCache || config.headers?.["x-bypass-cache"] === "true";

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
    if (config.method?.toLowerCase() === "get" && config.cacheKey) {
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
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_info");
      window.location.href = "/";
      return Promise.reject(error);
    }

    // Auto-retry for GET requests on network/server errors
    if (config && config.method?.toLowerCase() === "get") {
      const isNetworkError = !error.response;
      const isServerError = error.response && error.response.status >= 500;

      if (isNetworkError || isServerError) {
        config.retryCount = config.retryCount || 0;
        const maxRetries = 2;

        if (config.retryCount < maxRetries) {
          config.retryCount += 1;
          const backoffDelay = config.retryCount * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          return api(config);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Add custom request wrappers to support deduplication
const originalGet = api.get;
api.get = function (url, config = {}) {
  const cacheKey = `${url}?${JSON.stringify(config.params || {})}`;
  const bypassCache = config.bypassCache || config.headers?.["x-bypass-cache"] === "true";

  if (bypassCache) {
    getCache.delete(cacheKey);
  }

  if (!bypassCache) {
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }
  }

  const promise = originalGet.call(api, url, config)
    .then((res) => {
      inFlightRequests.delete(cacheKey);
      return res;
    })
    .catch((err) => {
      inFlightRequests.delete(cacheKey);
      throw err;
    });

  if (!bypassCache) {
    inFlightRequests.set(cacheKey, promise);
  }

  return promise;
};

export default api;
