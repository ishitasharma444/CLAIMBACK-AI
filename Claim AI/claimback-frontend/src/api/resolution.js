import { api } from "./client.js";

export const resolutionApi = {
  /**
   * GET /api/v1/claims/{claim_id}/resolution
   */
  get: (claim_id) => api.get(`/api/v1/claims/${claim_id}/resolution`),
};
