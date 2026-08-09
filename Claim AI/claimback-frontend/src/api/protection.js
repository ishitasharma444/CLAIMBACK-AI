import { api } from "./client.js";

export const protectionApi = {
  /**
   * POST /api/v1/protection/documents
   * Expects FormData: title, document_type, provider_name, description, file
   */
  uploadDocument: (formData) =>
    api.post("/api/v1/protection/documents", { formData }),

  /**
   * GET /api/v1/protection/documents
   */
  listDocuments: () => api.get("/api/v1/protection/documents"),

  /**
   * POST /api/v1/protection/documents/{document_id}/analyze
   */
  analyzeDocument: (document_id) =>
    api.post(`/api/v1/protection/documents/${document_id}/analyze`),

  /**
   * GET /api/v1/protection/documents/{document_id}/analysis
   * Returns: list of DocumentAnalysisRead
   */
  getDocumentAnalyses: (document_id) =>
    api.get(`/api/v1/protection/documents/${document_id}/analysis`),

  /**
   * GET /api/v1/protection/analysis/{document_analysis_id}
   * Returns: DocumentAnalysisRead
   */
  getAnalysis: (document_analysis_id) =>
    api.get(`/api/v1/protection/analysis/${document_analysis_id}`),
};
