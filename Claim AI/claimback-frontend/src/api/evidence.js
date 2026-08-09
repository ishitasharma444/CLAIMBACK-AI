import { api } from "./client.js";

export const evidenceApi = {
  /**
   * POST /api/v1/claims/{claim_id}/evidence
   * Sends a single file as FormData.
   */
  upload: (claim_id, file) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post(`/api/v1/claims/${claim_id}/evidence`, { formData: fd });
  },

  /**
   * GET /api/v1/claims/{claim_id}/evidence
   */
  list: (claim_id) => api.get(`/api/v1/claims/${claim_id}/evidence`),

  /**
   * DELETE /api/v1/evidence/{evidence_id}
   */
  delete: (evidence_id) => api.delete(`/api/v1/evidence/${evidence_id}`),
};
