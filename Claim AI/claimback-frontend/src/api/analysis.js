import { api } from "./client.js";

export const analysisApi = {
  /**
   * POST /api/v1/claims/{claim_id}/analyze
   */
  analyze: (claim_id) =>
    api.post(`/api/v1/claims/${claim_id}/analyze`),

  /**
   * GET /api/v1/claims/{claim_id}/analysis
   */
  history: (claim_id) =>
    api.get(`/api/v1/claims/${claim_id}/analysis`),
};
