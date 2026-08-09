import React, { useEffect, useState, useRef } from "react";
import Icon from "../components/Icon.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { claimsApi } from "../api/claims.js";
import { evidenceApi } from "../api/evidence.js";
import { analysisApi } from "../api/analysis.js";
import { resolutionApi } from "../api/resolution.js";

/* ─── Evidence Tab ─────────────────────────────────────────────────── */
function EvidenceTab({ claimId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try { setItems(await evidenceApi.list(claimId) || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [claimId]);

  const upload = async (file) => {
    setUploading(true);
    setError("");
    try {
      const result = await evidenceApi.upload(claimId, file);
      setItems(prev => [result, ...prev]);
    } catch (e) {
      setError(e.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await evidenceApi.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      setError(e.message || "Delete failed.");
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="tab-content">
      <div className="tab-section-title">
        <h2>Evidence collection</h2>
        <p>What proof do you have? Upload documents, screenshots, emails, or receipts that support your claim.</p>
      </div>

      {/* Upload zone */}
      <div
        className={`dropzone evidence-dropzone ${dragOver ? "drag-over" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        id="evidence-dropzone"
      >
        <input
          ref={fileRef}
          type="file"
          style={{ display: "none" }}
          id="evidence-file-input"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
        />
        {uploading ? (
          <div className="evidence-uploading">
            <span className="btn-spinner" style={{ width: 24, height: 24 }} />
            <span>Uploading…</span>
          </div>
        ) : (
          <>
            <div className="dropzone-icon"><Icon name="upload" size={26} /></div>
            <div className="dropzone-text">Drop files here or click to upload</div>
            <div className="dropzone-hint">Receipts, emails, screenshots, PDFs</div>
          </>
        )}
      </div>

      {error && <div className="form-error" role="alert"><Icon name="xCircle" size={15} /> {error}</div>}

      {loading ? (
        <LoadingSpinner text="Loading evidence…" />
      ) : items.length === 0 ? (
        <EmptyState icon="evidence" title="No evidence uploaded" body="Add files that support your claim — the stronger your evidence, the better your analysis." />
      ) : (
        <div className="evidence-list">
          {items.map(item => (
            <div key={item.id} id={`evidence-item-${item.id}`} className="evidence-item">
              <div className="evidence-item-icon"><Icon name="file" size={18} /></div>
              <div className="evidence-item-body">
                <div className="evidence-item-name">{item.filename}</div>
                <div className="evidence-item-meta">
                  {formatSize(item.file_size)} · {item.mime_type} · {item.evidence_type}
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <button
                className="btn btn-icon btn-ghost-danger"
                onClick={() => handleDelete(item.id)}
                aria-label="Delete evidence"
                id={`evidence-delete-${item.id}`}
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Analysis Tab ──────────────────────────────────────────────────── */
function AnalysisTab({ claimId }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try { setAnalyses(await analysisApi.history(claimId) || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [claimId]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError("");
    try {
      const result = await analysisApi.analyze(claimId);
      const newAnalysis = result.analysis || result;
      setAnalyses(prev => [newAnalysis, ...prev]);
    } catch (e) {
      setError(e.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const Metric = ({ label, value, color }) => (
    <div className={`analysis-metric analysis-metric-${color}`}>
      <div className="analysis-metric-val">{value}<span className="analysis-metric-max">/100</span></div>
      <div className="analysis-metric-label">{label}</div>
    </div>
  );

  return (
    <div className="tab-content">
      <div className="tab-section-title">
        <h2>Claim analysis</h2>
        <p>AI-powered analysis evaluates your claim's strength, evidence quality, and rejection risk.</p>
      </div>

      <button
        id="run-analysis-btn"
        className="btn btn-primary"
        onClick={runAnalysis}
        disabled={analyzing}
      >
        {analyzing ? (
          <><span className="btn-spinner" /> Analyzing your claim…</>
        ) : (
          <><Icon name="analysis" size={16} /> Run claim analysis</>
        )}
      </button>

      {error && <div className="form-error" role="alert"><Icon name="xCircle" size={15} /> {error}</div>}

      {loading ? (
        <LoadingSpinner text="Loading analysis history…" />
      ) : analyses.length === 0 ? (
        <EmptyState icon="analysis" title="No analysis yet" body="Run an analysis to evaluate your claim strength and evidence." />
      ) : (
        <div className="analyses-list">
          {analyses.map((a, i) => (
            <div key={a.id} id={`analysis-result-${a.id}`} className="analysis-result surface-card">
              <div className="analysis-result-header">
                <span className="analysis-result-label">Analysis {analyses.length - i}</span>
                <span className="analysis-result-date">{new Date(a.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="analysis-metrics-grid">
                <Metric label="Claim strength" value={a.claim_strength} color={a.claim_strength >= 70 ? "green" : a.claim_strength >= 40 ? "amber" : "red"} />
                <Metric label="Evidence completeness" value={a.evidence_completeness} color={a.evidence_completeness >= 70 ? "green" : a.evidence_completeness >= 40 ? "amber" : "red"} />
                <Metric label="Policy match" value={a.policy_match} color={a.policy_match >= 70 ? "green" : a.policy_match >= 40 ? "amber" : "red"} />
                <Metric label="Factual consistency" value={a.factual_consistency} color={a.factual_consistency >= 70 ? "green" : a.factual_consistency >= 40 ? "amber" : "red"} />
                <Metric label="Rejection risk" value={a.rejection_risk} color={a.rejection_risk >= 60 ? "red" : a.rejection_risk >= 30 ? "amber" : "green"} />
              </div>
              {a.findings_json?.findings?.length > 0 && (
                <div className="analysis-findings">
                  <div className="analysis-findings-title">Findings</div>
                  {a.findings_json.findings.map((f, fi) => (
                    <div key={fi} className={`finding-row finding-row-${f.severity?.toLowerCase() || "low"}`}>
                      <SeverityBadge severity={f.severity} />
                      <div>
                        <div className="finding-row-title">{f.title}</div>
                        <div className="finding-row-desc">{f.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Resolution Tab ────────────────────────────────────────────────── */
function ResolutionTab({ claimId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await resolutionApi.get(claimId);
      setData(res);
    } catch (e) {
      setError(e.message || "Failed to load resolution.");
    } finally {
      setLoading(false);
    }
  };

  const steps = data?.steps || [];

  return (
    <div className="tab-content">
      <div className="tab-section-title">
        <h2>Resolution path</h2>
        <p>What should you do next? Follow these steps to work toward resolution.</p>
      </div>

      {!data && !loading && (
        <button id="resolution-load-btn" className="btn btn-primary" onClick={load}>
          <Icon name="route" size={16} /> Generate resolution path
        </button>
      )}

      {loading && <LoadingSpinner text="Generating your resolution plan…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {steps.length > 0 && (
        <div className="resolution-steps">
          {steps.map((step, i) => (
            <div key={step.id || i} id={`resolution-step-${step.step_number || i}`} className="resolution-step-card">
              <div className="resolution-step-num">{String(step.step_number || i + 1).padStart(2, "0")}</div>
              <div className="resolution-step-body">
                <div className="resolution-step-title">{step.title}</div>
                <div className="resolution-step-desc">{step.description}</div>
                {(step.destination_name || step.destination_url) && (
                  <div className="resolution-step-dest">
                    <Icon name="arrowUpRight" size={13} />
                    {step.destination_url ? (
                      <a href={step.destination_url} target="_blank" rel="noopener noreferrer" className="link-btn">{step.destination_name || step.destination_url}</a>
                    ) : (
                      <span>{step.destination_name}</span>
                    )}
                  </div>
                )}
                {step.expected_time && (
                  <div className="resolution-step-time"><Icon name="clock" size={13} /> {step.expected_time}</div>
                )}
              </div>
              <div className="resolution-step-status"><StatusBadge status={step.status} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main ClaimDetail View ─────────────────────────────────────────── */
export default function ClaimDetail({ claimId, navigate }) {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await claimsApi.get(claimId);
      setClaim(data);
      setEditForm({ title: data.title, description: data.description, status: data.status });
    } catch (e) {
      setError(e.message || "Failed to load claim.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [claimId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await claimsApi.update(claimId, editForm);
      setClaim(updated);
      setEditing(false);
    } catch (e) {
      alert(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this claim? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await claimsApi.delete(claimId);
      navigate("claims");
    } catch (e) {
      alert(e.message || "Failed to delete.");
      setDeleting(false);
    }
  };

  const TABS = [
    { key: "overview", label: "Overview", icon: "dashboard" },
    { key: "evidence", label: "Evidence", icon: "evidence" },
    { key: "analysis", label: "Analysis", icon: "analysis" },
    { key: "resolution", label: "Resolution", icon: "route" },
  ];

  if (loading) return <div className="view-content"><LoadingSpinner text="Loading claim…" /></div>;
  if (error) return <div className="view-content"><ErrorState message={error} onRetry={load} /></div>;
  if (!claim) return null;

  return (
    <div className="view-content">
      {/* Back + header */}
      <div className="claim-detail-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("claims")} id="claim-back-btn">
          <Icon name="arrowLeft" size={15} /> All claims
        </button>
        <div className="claim-detail-title-row">
          <div>
            <h1 className="view-title">{claim.title}</h1>
            <div className="claim-detail-meta">
              <StatusBadge status={claim.status} />
              <span className="claim-detail-cat">{claim.category?.replace(/_/g, " ")}</span>
              {claim.potential_amount != null && (
                <span className="claim-detail-amount">{claim.currency} {Number(claim.potential_amount).toLocaleString()}</span>
              )}
              {claim.claim_strength != null && (
                <span className="claim-strength-pill">{claim.claim_strength}% strength</span>
              )}
            </div>
          </div>
          <div className="claim-detail-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(!editing)} id="claim-edit-btn">
              <Icon name="spark" size={14} /> {editing ? "Cancel" : "Edit"}
            </button>
            <button className="btn btn-ghost btn-sm btn-danger" onClick={handleDelete} disabled={deleting} id="claim-delete-btn">
              <Icon name="trash" size={14} /> {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="surface-card claim-edit-card">
          <div className="form-fields">
            <div className="field-group">
              <label className="field-label" htmlFor="edit-title">Title</label>
              <input id="edit-title" className="field-input" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="edit-status">Status</label>
              <select id="edit-status" className="field-input field-select" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                {["draft", "submitted", "under_review", "approved", "rejected", "closed"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="edit-desc">Description</label>
              <textarea id="edit-desc" className="field-input field-textarea" rows={3} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setEditing(false)} id="edit-cancel-btn">Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="edit-save-btn">
              {saving ? <><span className="btn-spinner" /> Saving…</> : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.key}
            id={`claim-tab-${t.key}`}
            className={`tab-btn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="tab-content">
          <div className="claim-overview-grid">
            <div className="surface-card">
              <div className="kicker">Claim details</div>
              <div className="claim-detail-field">
                <span>Created</span>
                <strong>{new Date(claim.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
              </div>
              <div className="claim-detail-field">
                <span>Last updated</span>
                <strong>{new Date(claim.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
              </div>
              <div className="claim-detail-field">
                <span>Status</span>
                <StatusBadge status={claim.status} />
              </div>
              <div className="claim-detail-field">
                <span>Category</span>
                <strong>{claim.category?.replace(/_/g, " ")}</strong>
              </div>
              {claim.potential_amount != null && (
                <div className="claim-detail-field">
                  <span>Potential value</span>
                  <strong className="claim-amount-big">{claim.currency} {Number(claim.potential_amount).toLocaleString()}</strong>
                </div>
              )}
              {claim.claim_strength != null && (
                <div className="claim-detail-field">
                  <span>Claim strength</span>
                  <strong>{claim.claim_strength}%</strong>
                </div>
              )}
            </div>
            <div className="surface-card">
              <div className="kicker">Description</div>
              <p className="claim-overview-desc">{claim.description}</p>
            </div>
          </div>
          <div className="claim-next-steps surface-card">
            <div className="kicker">Next steps</div>
            <div className="next-steps-row">
              <div className="next-step" onClick={() => setTab("evidence")} role="button" tabIndex={0} id="next-step-evidence">
                <Icon name="evidence" size={20} />
                <div>
                  <div className="next-step-title">Add evidence</div>
                  <div className="next-step-desc">Upload supporting documents, receipts, and screenshots.</div>
                </div>
                <Icon name="chevronRight" size={16} />
              </div>
              <div className="next-step" onClick={() => setTab("analysis")} role="button" tabIndex={0} id="next-step-analysis">
                <Icon name="analysis" size={20} />
                <div>
                  <div className="next-step-title">Analyze claim</div>
                  <div className="next-step-desc">AI evaluates strength, evidence quality, and rejection risk.</div>
                </div>
                <Icon name="chevronRight" size={16} />
              </div>
              <div className="next-step" onClick={() => setTab("resolution")} role="button" tabIndex={0} id="next-step-resolution">
                <Icon name="route" size={20} />
                <div>
                  <div className="next-step-title">Get resolution</div>
                  <div className="next-step-desc">Follow actionable steps toward closing your claim.</div>
                </div>
                <Icon name="chevronRight" size={16} />
              </div>
            </div>
          </div>
        </div>
      )}
      {tab === "evidence" && <EvidenceTab claimId={claimId} />}
      {tab === "analysis" && <AnalysisTab claimId={claimId} />}
      {tab === "resolution" && <ResolutionTab claimId={claimId} />}
    </div>
  );
}
