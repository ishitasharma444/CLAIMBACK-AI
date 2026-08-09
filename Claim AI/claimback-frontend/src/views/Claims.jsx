import React, { useEffect, useState } from "react";
import Icon from "../components/Icon.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { claimsApi } from "../api/claims.js";

const CATEGORIES = ["flight_delay", "flight_cancellation", "insurance_rejection", "bank_dispute", "refund_denial", "product_defect", "warranty_claim", "loan_dispute", "subscription", "other"];

function ClaimModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "", category: "other", description: "",
    potential_amount: "", currency: "INR", status: "draft",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        potential_amount: form.potential_amount ? parseFloat(form.potential_amount) : null,
        claim_strength: null,
      };
      const claim = await claimsApi.create(payload);
      onCreated(claim);
    } catch (err) {
      setError(err.message || "Failed to create claim.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal surface-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">New claim</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close" id="modal-close"><Icon name="x" size={18} /></button>
        </div>
        <form id="claim-create-form" onSubmit={handleSubmit}>
          <div className="form-fields">
            <div className="field-group">
              <label className="field-label" htmlFor="claim-title">Claim title</label>
              <input id="claim-title" className="field-input" required minLength={3} maxLength={255} placeholder="e.g. Flight delay compensation claim" value={form.title} onChange={e => update("title", e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="claim-cat">Category</label>
              <select id="claim-cat" className="field-input field-select" value={form.category} onChange={e => update("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="claim-desc">Description</label>
              <textarea id="claim-desc" className="field-input field-textarea" required minLength={10} rows={3} placeholder="Describe what happened and what you're claiming…" value={form.description} onChange={e => update("description", e.target.value)} />
            </div>
            <div className="field-row-two">
              <div className="field-group">
                <label className="field-label" htmlFor="claim-amount">Potential amount</label>
                <input id="claim-amount" className="field-input" type="number" min="0" step="0.01" placeholder="0.00" value={form.potential_amount} onChange={e => update("potential_amount", e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="claim-currency">Currency</label>
                <select id="claim-currency" className="field-input field-select" value={form.currency} onChange={e => update("currency", e.target.value)}>
                  {["INR", "USD", "EUR", "GBP", "AED"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          {error && <div className="form-error"><Icon name="xCircle" size={15} /> {error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="claim-cancel-btn">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="claim-create-submit">
              {loading ? <><span className="btn-spinner" /> Creating…</> : <>Create claim <Icon name="arrow" size={15} /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClaimCard({ claim, onClick }) {
  return (
    <div id={`claim-card-${claim.id}`} className="claim-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="claim-card-header">
        <div className="claim-card-title">{claim.title}</div>
        <StatusBadge status={claim.status} />
      </div>
      <div className="claim-card-meta">
        <span className="claim-card-category">{claim.category?.replace(/_/g, " ")}</span>
        {claim.potential_amount != null && (
          <span className="claim-card-amount">{claim.currency} {Number(claim.potential_amount).toLocaleString()}</span>
        )}
      </div>
      <div className="claim-card-desc">{claim.description?.slice(0, 120)}{claim.description?.length > 120 ? "…" : ""}</div>
      <div className="claim-card-footer">
        <span className="claim-card-date">{new Date(claim.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        {claim.claim_strength != null && (
          <span className="claim-strength-pill">{claim.claim_strength}% strength</span>
        )}
        <Icon name="chevronRight" size={14} className="claim-card-arrow" />
      </div>
    </div>
  );
}

export default function Claims({ navigate }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await claimsApi.list();
      setClaims(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load claims.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreated = (claim) => {
    setShowModal(false);
    setClaims(prev => [claim, ...prev]);
    navigate("claim-detail", { claimId: claim.id });
  };

  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <div className="kicker">Claims management</div>
          <h1 className="view-title">Your claims</h1>
          <p className="view-subtitle">Track, manage, and progress your claims through evidence collection and resolution.</p>
        </div>
        <button id="claims-new-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> New claim
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading claims…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : claims.length === 0 ? (
        <EmptyState
          icon="claims"
          title="No claims yet"
          body="Start a claim when something goes wrong. You can add evidence and get AI-powered analysis to support your position."
          action={{ label: "Create your first claim", onClick: () => setShowModal(true), id: "claims-empty-action" }}
        />
      ) : (
        <div className="claims-grid">
          {claims.map(claim => (
            <ClaimCard key={claim.id} claim={claim} onClick={() => navigate("claim-detail", { claimId: claim.id })} />
          ))}
        </div>
      )}

      {showModal && <ClaimModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
    </div>
  );
}
