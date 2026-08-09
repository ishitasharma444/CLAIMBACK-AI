import { api, tokenStore } from "./client.js";

export const authApi = {
  /**
   * POST /api/v1/auth/register
   */
  register: (email, password, full_name) =>
    api.post("/api/v1/auth/register", { json: { email, password, full_name } }),

  /**
   * POST /api/v1/auth/login
   * Returns: { access_token, refresh_token, token_type }
   */
  login: async (email, password) => {
    const data = await api.post("/api/v1/auth/login", {
      json: { email, password },
    });
    tokenStore.setTokens(data.access_token, data.refresh_token);
    return data;
  },

  /**
   * GET /api/v1/auth/me
   */
  me: () => api.get("/api/v1/auth/me"),

  /**
   * POST /api/v1/auth/refresh
   */
  refresh: (refresh_token) =>
    api.post("/api/v1/auth/refresh", { json: { refresh_token } }),

  /**
   * Clear all stored tokens (logout).
   */
  logout: () => {
    tokenStore.clear();
  },
};
