import React, { useEffect, useState } from "react";
import Icon from "../components/Icon.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { protectionApi } from "../api/protection.js";
import { claimsApi } from "../api/claims.js";

export default function Dashboard({ user, navigate }) {
  const [docs, setDocs] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([protectionApi.listDocuments(), claimsApi.list()])
      .then(([d, c]) => { setDocs(Array.isArray(d) ? d : []); setClaims(Array.isArray(c) ? c : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const analyzedDocs = docs.filter(d => d.status === "analyzed");
  const activeClaims = claims.filter(c => !["closed", "rejected"].includes(c.status));

  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <div className="kicker">Welcome back</div>
          <h1 className="view-title">
            {user?.full_name ? `Hello, ${user.full_name.split(" ")[0]}.` : "Your protection dashboard."}
          </h1>
          <p className="view-subtitle">An overview of your documents, claims, and protection status.</p>
        </div>
        <button id="dash-protect-btn" className="btn btn-primary" onClick={() => navigate("protect")}>
          <Icon name="shield" size={16} /> Protect a document
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your protection data…" />
      ) : (
        <>
          {/* Metric tiles */}
          <div className="metrics-row">
            <div className="metric-tile metric-green">
              <div className="metric-value">{docs.length}</div>
              <div className="metric-label">Documents protected</div>
              <Icon name="doc" size={20} className="metric-icon" />
            </div>
            <div className="metric-tile metric-amber">
              <div className="metric-value">{analyzedDocs.length}</div>
              <div className="metric-label">Analyses completed</div>
              <Icon name="analysis" size={20} className="metric-icon" />
            </div>
            <div className="metric-tile metric-blue">
              <div className="metric-value">{activeClaims.length}</div>
              <div className="metric-label">Active claims</div>
              <Icon name="claims" size={20} className="metric-icon" />
            </div>
            <div className="metric-tile metric-neutral">
              <div className="metric-value">{claims.length}</div>
              <div className="metric-label">Total claims</div>
              <Icon name="flag" size={20} className="metric-icon" />
            </div>
          </div>

          {/* Product flow */}
          <div className="flow-section surface-card">
            <div className="section-header">
              <div>
                <div className="kicker">How ClaimBack works</div>
                <h2>From document to decision.</h2>
              </div>
            </div>
            <div className="flow-steps">
              {[
                { icon: "upload", title: "Upload", desc: "Every policy, ticket, invoice or contract.", view: "protect" },
                { icon: "shield", title: "Understand", desc: "Know your rights, entitlements, and obligations.", view: "protect" },
                { icon: "warning", title: "Protect", desc: "Act before the deadline passes.", view: "protect" },
                { icon: "claims", title: "Claim", desc: "Start a claim if something goes wrong.", view: "claims" },
                { icon: "evidence", title: "Prove", desc: "Add supporting evidence.", view: "claims" },
                { icon: "route", title: "Resolve", desc: "Follow the best path to close the issue.", view: "claims" },
              ].map((step, i) => (
                <div key={step.title} className="flow-step" onClick={() => navigate(step.view)} role="button" tabIndex={0} id={`flow-step-${i}`}>
                  <div className="flow-step-num">0{i + 1}</div>
                  <div className="flow-step-icon"><Icon name={step.icon} size={18} /></div>
                  <div className="flow-step-title">{step.title}</div>
                  <div className="flow-step-desc">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent content */}
          <div className="dash-grid">
            {/* Recent documents */}
            <div className="surface-card">
              <div className="section-header">
                <div>
                  <div className="kicker">Protected documents</div>
                  <h2>Recent uploads</h2>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("documents")} id="dash-docs-link">
                  View all <Icon name="chevronRight" size={14} />
                </button>
              </div>
              {docs.length === 0 ? (
                <div className="empty-inline">
                  <Icon name="doc" size={20} />
                  <span>No documents yet. <button className="link-btn" onClick={() => navigate("protect")}>Upload one</button></span>
                </div>
              ) : (
                <div className="item-list">
                  {docs.slice(0, 4).map(doc => (
                    <div key={doc.id} className="item-row" onClick={() => navigate("documents")} role="button" tabIndex={0} id={`dash-doc-${doc.id}`}>
                      <div className="item-icon-wrap">
                        <Icon name="doc" size={16} />
                      </div>
                      <div className="item-body">
                        <div className="item-title">{doc.title}</div>
                        <div className="item-meta">{doc.document_type} {doc.provider_name ? `· ${doc.provider_name}` : ""}</div>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent claims */}
            <div className="surface-card">
              <div className="section-header">
                <div>
                  <div className="kicker">Claims</div>
                  <h2>Your claims</h2>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("claims")} id="dash-claims-link">
                  View all <Icon name="chevronRight" size={14} />
                </button>
              </div>
              {claims.length === 0 ? (
                <div className="empty-inline">
                  <Icon name="claims" size={20} />
                  <span>No claims yet. <button className="link-btn" onClick={() => navigate("claims")}>Start one</button></span>
                </div>
              ) : (
                <div className="item-list">
                  {claims.slice(0, 4).map(claim => (
                    <div key={claim.id} className="item-row" onClick={() => navigate("claims", { claimId: claim.id })} role="button" tabIndex={0} id={`dash-claim-${claim.id}`}>
                      <div className="item-icon-wrap">
                        <Icon name="claims" size={16} />
                      </div>
                      <div className="item-body">
                        <div className="item-title">{claim.title}</div>
                        <div className="item-meta">{claim.category}{claim.potential_amount ? ` · ${claim.currency} ${claim.potential_amount}` : ""}</div>
                      </div>
                      <StatusBadge status={claim.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
