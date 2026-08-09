import { api } from "./client.js";

export const claimsApi = {
  /** GET /api/v1/claims */
  list: () => api.get("/api/v1/claims"),

  /** POST /api/v1/claims */
  create: (payload) => api.post("/api/v1/claims", { json: payload }),

  /** GET /api/v1/claims/{claim_id} */
  get: (claim_id) => api.get(`/api/v1/claims/${claim_id}`),

  /** PATCH /api/v1/claims/{claim_id} */
  update: (claim_id, payload) =>
    api.patch(`/api/v1/claims/${claim_id}`, { json: payload }),

  /** DELETE /api/v1/claims/{claim_id} */
  delete: (claim_id) => api.delete(`/api/v1/claims/${claim_id}`),
};
