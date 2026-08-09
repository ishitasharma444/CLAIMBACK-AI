/**
 * Base API client — reads VITE_API_URL, attaches auth headers,
 * handles 401 with token refresh, and returns parsed JSON.
 */

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8003";

const TOKEN_KEY = "cb_access_token";
const REFRESH_KEY = "cb_refresh_token";

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEY) || "",
  getRefresh: () => localStorage.getItem(REFRESH_KEY) || "",
  setTokens: (access, refresh) => {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

let refreshPromise = null;

async function attemptRefresh() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) throw new Error("No refresh token");
    const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      tokenStore.clear();
      throw new Error("Session expired. Please sign in again.");
    }
    const data = await res.json();
    tokenStore.setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export class ApiError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function parseError(res) {
  let detail = `HTTP ${res.status}`;
  try {
    const body = await res.json();
    detail = body.detail || body.message || JSON.stringify(body);
  } catch (_) {}
  return new ApiError(res.status, detail, detail);
}

/**
 * Core request function. Pass `isRetry=true` to prevent infinite refresh loops.
 */
async function request(path, options = {}, isRetry = false) {
  const { formData, json, method = "GET", ...rest } = options;

  const headers = { ...rest.headers };
  const access = tokenStore.getAccess();
  if (access) headers["Authorization"] = `Bearer ${access}`;

  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (formData) {
    // Do NOT set Content-Type — browser sets multipart boundary automatically
    body = formData;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body,
  });

  if (res.status === 401 && !isRetry) {
    try {
      await attemptRefresh();
      return request(path, options, true);
    } catch (_) {
      tokenStore.clear();
      window.dispatchEvent(new CustomEvent("cb:logout"));
      throw new ApiError(401, "Your session has expired. Please sign in again.", "unauthorized");
    }
  }

  if (res.status === 204) return null;

  if (!res.ok) {
    throw await parseError(res);
  }

  return res.json();
}

export const api = {
  get: (path, opts) => request(path, { method: "GET", ...opts }),
  post: (path, opts) => request(path, { method: "POST", ...opts }),
  patch: (path, opts) => request(path, { method: "PATCH", ...opts }),
  delete: (path, opts) => request(path, { method: "DELETE", ...opts }),
};
