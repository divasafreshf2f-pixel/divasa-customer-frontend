import axios from "axios";

const envApiUrlRaw = import.meta.env.VITE_API_URL;
const envApiUrl = String(envApiUrlRaw || "").replace(/divasa-backend-xmvh\.onrender\.com/gi, "divasa-backend-xwvh.onrender.com");
const isProd = Boolean(import.meta.env.PROD);
const isLocalhostFrontend =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);
const isPrivateDevHost = /localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\./i.test(
  String(envApiUrl || "")
);
const normalizeApiBase = (url) => {
  const raw = String(url || "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const shouldForceHttps = /onrender\.com/i.test(withProtocol) || (isProd && !isPrivateDevHost);
  const secure = shouldForceHttps ? withProtocol.replace(/^http:\/\//i, "https://") : withProtocol;
  return /\/api$/i.test(secure) ? secure : `${secure}/api`;
};

const API_BASE_URL =
  envApiUrl
    ? normalizeApiBase(envApiUrl)
    : isLocalhostFrontend
      ? `${window.location.protocol}//${window.location.hostname}:5000/api`
      : "https://divasa-backend-xwvh.onrender.com/api";
const LOCAL_FALLBACK_API_URL = isLocalhostFrontend
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : "https://divasa-backend-xwvh.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const clearCustomerAuth = () => {
  localStorage.removeItem("divasa_token");
  localStorage.removeItem("customerToken");
  localStorage.removeItem("token");
  localStorage.removeItem("divasa_user");
  window.dispatchEvent(new Event("userUpdated"));
};

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("divasa_token") ||
    localStorage.getItem("customerToken") ||
    localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config || {};
    const isLocalhostFrontend =
      typeof window !== "undefined" &&
      ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const isNetworkError = !error?.response;

    // If API URL points to stale LAN IP in local dev, retry once with localhost backend.
    if (
      isLocalhostFrontend &&
      isNetworkError &&
      !config.__retriedWithLocalFallback &&
      (config.baseURL || api.defaults.baseURL) !== LOCAL_FALLBACK_API_URL
    ) {
      const nextConfig = {
        ...config,
        baseURL: LOCAL_FALLBACK_API_URL,
        __retriedWithLocalFallback: true,
      };
      return api.request(nextConfig);
    }

    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || "").toLowerCase();

    // Auto-recover from stale/invalid customer token.
    if (status === 401 && (message.includes("token") || message.includes("not authorized"))) {
      clearCustomerAuth();
      window.dispatchEvent(new Event("openLoginModal"));
    }

    return Promise.reject(error);
  }
);

export const getApiBaseUrl = () => api.defaults.baseURL || "https://divasa-backend-xwvh.onrender.com/api";

export const getApiHost = () => getApiBaseUrl().replace(/\/api\/?$/, "");

export const resolveImagePath = (value = "") => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return (
      value.image ||
      value.imageUrl ||
      value.productImage ||
      value.productImageUrl ||
      ""
    );
  }
  return "";
};

export const getAssetCandidates = (value = "") => {
  const path = resolveImagePath(value);
  if (!path) return [];
  if (/^(https?:\/\/|blob:|data:)/i.test(path)) return [path];

  const cleanPath = String(path).trim();
  const looksLikeBareFilename =
    !cleanPath.startsWith("/") &&
    !cleanPath.includes("/") &&
    /\.(png|jpe?g|webp|gif|avif|bmp|svg)$/i.test(cleanPath);

  const preferredPath = looksLikeBareFilename
    ? `/uploads/products/${cleanPath}`
    : (cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`);

  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  const candidates = [];

  const pushUnique = (url) => {
    if (url && !candidates.includes(url)) candidates.push(url);
  };

  const apiHostUrl = `${getApiHost()}${preferredPath}`;
  const apiHostRawUrl = `${getApiHost()}${normalizedPath}`;

  const isLocalBrowser =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);

  // In local dev, prefer localhost backend first because Home already works with this path.
  if (isLocalBrowser) {
    const localUrl = `${window.location.protocol}//${window.location.hostname}:5000${preferredPath}`;
    pushUnique(localUrl);
    if (normalizedPath !== preferredPath) {
      const localRawUrl = `${window.location.protocol}//${window.location.hostname}:5000${normalizedPath}`;
      pushUnique(localRawUrl);
    }
    pushUnique(apiHostUrl);
    if (normalizedPath !== preferredPath) pushUnique(apiHostRawUrl);
    return candidates;
  }

  pushUnique(apiHostUrl);
  if (normalizedPath !== preferredPath) pushUnique(apiHostRawUrl);
  return candidates;
};

export const getAssetUrl = (value = "") => {
  return getAssetCandidates(value)[0] || "";
};

export default api;
