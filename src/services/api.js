import axios from "axios";

const envApiUrlRaw = import.meta.env.VITE_API_URL;
const envApiUrl = String(envApiUrlRaw || "").trim();
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

const PRIMARY_CLOUD_API_URL = "https://divasa-backend-xmvh.onrender.com/api";
const SECONDARY_CLOUD_API_URL = "https://divasa-backend-xmvh.onrender.com/api";

const API_BASE_URL = isLocalhostFrontend
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : envApiUrl
    ? normalizeApiBase(envApiUrl)
    : PRIMARY_CLOUD_API_URL;
const LOCAL_FALLBACK_API_URL = isLocalhostFrontend
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : PRIMARY_CLOUD_API_URL;

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
  (response) => {
    const payload = response?.data;
    if (
      payload &&
      typeof payload === "object" &&
      Object.prototype.hasOwnProperty.call(payload, "success") &&
      Object.prototype.hasOwnProperty.call(payload, "data")
    ) {
      response.data = payload.data;
      response._meta = { success: payload.success, message: payload.message || "" };
    }
    return response;
  },
  async (error) => {
    const config = error?.config || {};
    const isLocalhostFrontend =
      typeof window !== "undefined" &&
      ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const isNetworkError = !error?.response;
    const currentBase = String(config.baseURL || api.defaults.baseURL || "");

    // If API URL points to stale LAN IP in local dev, retry once with localhost backend.
    if (
      isLocalhostFrontend &&
      isNetworkError &&
      !config.__retriedWithLocalFallback &&
      currentBase !== LOCAL_FALLBACK_API_URL
    ) {
      const nextConfig = {
        ...config,
        baseURL: LOCAL_FALLBACK_API_URL,
        __retriedWithLocalFallback: true,
      };
      return api.request(nextConfig);
    }

    // Cloud fallback: retry once with the alternate Render host.
    if (
      !isLocalhostFrontend &&
      isNetworkError &&
      !config.__retriedWithCloudFallback
    ) {
      const primaryHost = PRIMARY_CLOUD_API_URL.replace(/\/api\/?$/, "");
      const nextCloudBase = currentBase.includes(primaryHost)
        ? SECONDARY_CLOUD_API_URL
        : PRIMARY_CLOUD_API_URL;

      const nextConfig = {
        ...config,
        baseURL: nextCloudBase,
        __retriedWithCloudFallback: true,
      };
      return api.request(nextConfig);
    }

    const status = error?.response?.status;
    const wrappedPayload = error?.response?.data;
    const safeErrorData =
      wrappedPayload &&
      typeof wrappedPayload === "object" &&
      Object.prototype.hasOwnProperty.call(wrappedPayload, "success") &&
      Object.prototype.hasOwnProperty.call(wrappedPayload, "message")
        ? { ...wrappedPayload.data, message: wrappedPayload.message }
        : wrappedPayload;
    if (error?.response) {
      error.response.data = safeErrorData;
    }
    const message = String(safeErrorData?.message || "").toLowerCase();

    // Auto-recover from stale/invalid customer token.
    if (status === 401 && (message.includes("token") || message.includes("not authorized"))) {
      clearCustomerAuth();
      window.dispatchEvent(new Event("openLoginModal"));
    }

    return Promise.reject(error);
  }
);

export const getApiBaseUrl = () => api.defaults.baseURL || PRIMARY_CLOUD_API_URL;

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
  const sameOriginPreferredUrl =
    typeof window !== "undefined" ? `${window.location.origin}${preferredPath}` : "";
  const sameOriginRawUrl =
    typeof window !== "undefined" ? `${window.location.origin}${normalizedPath}` : "";

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
  pushUnique(sameOriginPreferredUrl);
  if (normalizedPath !== preferredPath) pushUnique(sameOriginRawUrl);
  return candidates;
};

export const getAssetUrl = (value = "") => {
  return getAssetCandidates(value)[0] || "";
};

export default api;
