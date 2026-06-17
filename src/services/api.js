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

const PRIMARY_CLOUD_API_URL = "https://divasa-backend-xwvh.onrender.com/api";
const SECONDARY_CLOUD_API_URL = "https://divasa-backend-xwvh.onrender.com/api";

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

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".jfif"];

const safeDecode = (value = "") => {
  try {
    return decodeURI(String(value || ""));
  } catch {
    return String(value || "");
  }
};

const normalizeImagePath = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(blob:|data:)/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return encodeURI(raw);

  return safeDecode(raw)
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+/, "")
    .replace(/^uploads\/uploads\//i, "uploads/")
    .replace(/^uploads\/products\/products\//i, "uploads/products/")
    .replace(/^uploads\/categories\/categories\//i, "uploads/categories/")
    .replace(/^uploads\/banners\/banners\//i, "uploads/banners/");
};

const addVariantFamily = (candidates, candidatePath) => {
  if (!candidatePath) return;

  const trimmed = String(candidatePath)
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  if (!trimmed) return;

  const segments = trimmed.split("/").filter(Boolean);
  const fileName = segments[segments.length - 1] || "";
  const folder = segments.length > 1 ? segments.slice(0, -1).join("/") : "";
  const extMatch = fileName.match(/\.[^.]+$/);

  const push = (candidate) => {
    const normalized = String(candidate || "").trim().replace(/\\/g, "/").replace(/\/{2,}/g, "/");
    if (!normalized) return;
    candidates.add(normalized.startsWith("/") ? normalized : `/${normalized}`);
  };

  push(trimmed);

  if (extMatch) {
    const baseName = fileName.slice(0, -extMatch[0].length);
    IMAGE_EXTENSIONS.forEach((altExt) => {
      if (altExt === extMatch[0].toLowerCase()) return;
      push(folder ? `${folder}/${baseName}${altExt}` : `${baseName}${altExt}`);
    });
    return;
  }

  IMAGE_EXTENSIONS.forEach((altExt) => {
    push(folder ? `${folder}/${fileName}${altExt}` : `${fileName}${altExt}`);
  });
};

export const resolveImagePath = (value = "") => {
  if (!value) return "";
  if (typeof value === "string") return normalizeImagePath(value);
  if (typeof value === "object") {
    return normalizeImagePath(
      value.image ||
      value.imageUrl ||
      value.productImage ||
      value.productImageUrl ||
      value.thumbnail ||
      value.url ||
      ""
    );
  }
  return "";
};

const buildPathVariants = (cleanPath = "") => {
  const pathValue = normalizeImagePath(cleanPath);
  if (!pathValue) return [];

  const noQuery = pathValue.replace(/[?#].*$/, "");
  const segments = noQuery.split("/").filter(Boolean);
  const fileName = segments[segments.length - 1] || "";
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const isFileOnly = segments.length === 1;
  const candidates = new Set();

  addVariantFamily(candidates, noQuery);

  if (isFileOnly) {
    addVariantFamily(candidates, `uploads/products/${noQuery}`);
    addVariantFamily(candidates, `uploads/categories/${noQuery}`);
    addVariantFamily(candidates, `uploads/banners/${noQuery}`);
    addVariantFamily(candidates, `uploads/${noQuery}`);
  }

  if (noQuery.startsWith("products/")) {
    addVariantFamily(candidates, `uploads/${noQuery}`);
    addVariantFamily(candidates, `uploads/products/${fileName}`);
  }
  if (noQuery.startsWith("categories/")) {
    addVariantFamily(candidates, `uploads/categories/${fileName}`);
  }
  if (noQuery.startsWith("banners/")) {
    addVariantFamily(candidates, `uploads/banners/${fileName}`);
  }
  if (noQuery.startsWith("uploads/") && !noQuery.startsWith("uploads/products/") && !noQuery.startsWith("uploads/categories/") && !noQuery.startsWith("uploads/banners/")) {
    addVariantFamily(candidates, noQuery);
  }
  if (noQuery.startsWith("uploads/products/")) {
    addVariantFamily(candidates, noQuery);
  }

  const timestampKey = encodeURIComponent(fileName || baseName || noQuery);
  return [...candidates].map((candidate) => {
    const valueWithQuery = candidate.startsWith("/") ? candidate : `/${candidate}`;
    return encodeURI(`${valueWithQuery}${valueWithQuery.includes("?") ? "&" : "?"}v=${timestampKey}`);
  });
};

export const getAssetCandidates = (value = "") => {
  const path = resolveImagePath(value);
  if (!path) return [];
  if (/^(https?:\/\/|blob:|data:)/i.test(path)) return [encodeURI(path)];

  const candidatePaths = buildPathVariants(path);
  const candidates = [];
  const pushUnique = (url) => {
    if (url && !candidates.includes(url)) candidates.push(url);
  };

  const apiHost = getApiHost();
  const isLocalBrowser =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const localHost = typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : "";
  const sameOrigin = typeof window !== "undefined" ? window.location.origin : "";

  candidatePaths.forEach((candidatePath) => {
    const cleanedPath = candidatePath.replace(/^\/+/, "");
    if (isLocalBrowser && localHost) {
      pushUnique(`${localHost}/${cleanedPath}`);
      pushUnique(`${sameOrigin}/${cleanedPath}`);
    }
    pushUnique(`${apiHost}/${cleanedPath}`);
  });

  return candidates.map((candidate) => encodeURI(candidate.replace(/\/{2,}/g, "/").replace(":/", "://")));
};

export const getAssetUrl = (value = "") => getAssetCandidates(value)[0] || "";

export default api;
