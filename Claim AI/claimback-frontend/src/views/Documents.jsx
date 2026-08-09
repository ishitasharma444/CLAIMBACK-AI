import React, { useEffect, useState } from "react";
import Icon from "../components/Icon.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { protectionApi } from "../api/protection.js";

function DocRow({ doc, onSelect, selected }) {
  return (
    <div
      id={`doc-row-${doc.id}`}
      className={`doc-row ${selected ? "selected" : ""}`}
      onClick={() => onSelect(doc)}
      role="button"
      tabIndex={0}
    >
      <div className="doc-row-icon"><Icon name="doc" size={18} /></div>
      <div className="doc-row-body">
        <div className="doc-row-title">{doc.title}</div>
        <div className="doc-row-meta">
          <span>{doc.document_type}</span>
          {doc.provider_name && <span>· {doc.provider_name}</span>}
          <span>· {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </div>
      <div className="doc-row-right">
        <StatusBadge status={doc.status} />
        <Icon name="chevronRight" size={16} className="doc-row-chevron" />
      </div>
    </div>
  );
}

function AnalysisSummary({ analysis }) {
  const score = analysis?.protection_score ?? 0;
  return (
    <div className="analysis-summary surface-card">
      <div className="analysis-summary-top">
        <ScoreRing score={score} size={90} strokeWidth={7} />
        <div className="analysis-summary-meta">
          <div className="kicker">Protection score</div>
          <div className="analysis-summary-type">{analysis?.document_type}</div>
          {analysis?.provider_name && <div className="analysis-summary-provider">{analysis.provider_name}</div>}
          <div className="analysis-summary-date">
            {analysis?.created_at ? new Date(analysis.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}
          </div>
        </div>
      </div>
      <div className="analysis-summary-stats">
        {[
          { label: "Benefits", count: analysis?.key_benefits?.length || 0, color: "green" },
          { label: "Risks", count: (analysis?.potential_risks?.length || 0) + (analysis?.exclusions?.length || 0), color: "red" },
          { label: "Deadlines", count: analysis?.important_deadlines?.length || 0, color: "amber" },
          { label: "Actions", count: analysis?.immediate_actions?.length || 0, color: "red" },
        ].map(s => (
          <div key={s.label} className={`analysis-stat analysis-stat-${s.color}`}>
            <div className="analysis-stat-num">{s.count}</div>
            <div className="analysis-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Documents({ navigate }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await protectionApi.listDocuments();
      setDocs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSelect = async (doc) => {
    setSelected(doc);
    setAnalyses([]);
    if (doc.status !== "uploaded") {
      setAnalysesLoading(true);
      try {
        const data = await protectionApi.getDocumentAnalyses(doc.id);
        setAnalyses(Array.isArray(data) ? data : []);
      } catch (_) {}
      finally { setAnalysesLoading(false); }
    }
  };

  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <div className="kicker">My protected documents</div>
          <h1 className="view-title">Document library</h1>
          <p className="view-subtitle">All documents you've uploaded for protection analysis.</p>
        </div>
        <button id="docs-add-btn" className="btn btn-primary" onClick={() => navigate("protect")}>
          <Icon name="plus" size={16} /> Analyze a document
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your documents…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : docs.length === 0 ? (
        <EmptyState
          icon="doc"
          title="No documents yet"
          body="Upload your first policy, contract, or financial document to understand your rights and entitlements."
          action={{ label: "Analyze a document", onClick: () => navigate("protect"), id: "docs-empty-action" }}
        />
      ) : (
        <div className="docs-layout">
          {/* Documents list */}
          <div className="docs-list-col">
            <div className="surface-card no-pad">
              {docs.map(doc => (
                <DocRow key={doc.id} doc={doc} selected={selected?.id === doc.id} onSelect={handleSelect} />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="docs-detail-col">
            {!selected ? (
              <div className="surface-card">
                <EmptyState icon="doc" title="Select a document" body="Click a document to view its analysis history." />
              </div>
            ) : (
              <div>
                <div className="surface-card doc-detail-header">
                  <div className="doc-detail-title">{selected.title}</div>
                  <div className="doc-detail-meta">
                    {selected.document_type} {selected.provider_name ? `· ${selected.provider_name}` : ""}
                  </div>
                  <div className="doc-detail-badges">
                    <StatusBadge status={selected.status} />
                    <span className="doc-detail-size">{(selected.file_size / 1024).toFixed(1)} KB · {selected.mime_type}</span>
                  </div>
                </div>

                {analysesLoading ? (
                  <LoadingSpinner text="Loading analyses…" />
                ) : analyses.length === 0 ? (
                  <div className="surface-card">
                    <EmptyState
                      icon="analysis"
                      title="No analysis yet"
                      body="This document hasn't been analyzed yet."
                      action={{ label: "Analyze now", onClick: () => navigate("protect"), id: "doc-analyze-action" }}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="kicker" style={{ marginBottom: 12, marginTop: 8 }}>
                      {analyses.length} {analyses.length === 1 ? "analysis" : "analyses"}
                    </div>
                    {analyses.map(a => (
                      <AnalysisSummary key={a.id} analysis={a} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
