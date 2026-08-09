import React, { useState, useRef } from "react";
import Icon from "../components/Icon.jsx";
import { protectionApi } from "../api/protection.js";
import ProtectionReport from "./ProtectionReport.jsx";

const CATEGORIES = [
  { key: "travel", label: "Travel", icon: "flag", doc_type: "travel_document" },
  { key: "insurance", label: "Insurance", icon: "shield", doc_type: "insurance_policy" },
  { key: "banking", label: "Banking", icon: "lock", doc_type: "bank_document" },
  { key: "purchase", label: "Purchase", icon: "doc", doc_type: "purchase_invoice" },
  { key: "warranty", label: "Warranty", icon: "checkCircle", doc_type: "warranty" },
  { key: "loan", label: "Loan", icon: "warning", doc_type: "loan_agreement" },
  { key: "investment", label: "Investment", icon: "analysis", doc_type: "investment_document" },
  { key: "crypto", label: "Crypto", icon: "spark", doc_type: "crypto_document" },
  { key: "other", label: "Other", icon: "file", doc_type: "other" },
];

const ANALYSIS_STEPS = [
  "Reading your document",
  "Finding benefits",
  "Checking exclusions",
  "Detecting deadlines",
  "Finding risks",
  "Building your protection plan",
];

export default function Protect({ navigate }) {
  const [stage, setStage] = useState("intro"); // intro | form | analyzing | report
  const [category, setCategory] = useState(null);
  const [form, setForm] = useState({ title: "", provider_name: "", description: "" });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (f) => {
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select a document file."); return; }
    if (!category) { setError("Please select a document category."); return; }

    setError("");
    setStage("analyzing");
    setAnalysisStep(0);

    // Step animation
    const stepInterval = setInterval(() => {
      setAnalysisStep(s => {
        if (s >= ANALYSIS_STEPS.length - 1) { clearInterval(stepInterval); return s; }
        return s + 1;
      });
    }, 800);

    try {
      const fd = new FormData();
      fd.append("title", form.title || file.name.replace(/\.[^.]+$/, ""));
      fd.append("document_type", category.doc_type);
      fd.append("provider_name", form.provider_name || "");
      fd.append("description", form.description || "");
      fd.append("file", file);

      const doc = await protectionApi.uploadDocument(fd);

      // Ensure at least half the steps have animated before showing analyze
      await new Promise(r => setTimeout(r, 2000));

      const result = await protectionApi.analyzeDocument(doc.id);
      clearInterval(stepInterval);
      setAnalysisStep(ANALYSIS_STEPS.length - 1);
      await new Promise(r => setTimeout(r, 400));
      setAnalysis(result.analysis || result);
      setStage("report");
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.message || "Analysis failed. Please try again.");
      setStage("form");
    }
  };

  // ── INTRO ────────────────────────────────────────────────────────────────
  if (stage === "intro") {
    return (
      <div className="view-content protect-intro">
        <div className="protect-hero">
          <div className="protect-hero-eyebrow">
            <span className="pulse-dot" />
            Protection analysis
          </div>
          <h1>Before it costs you.<br /><em>Know what you're entitled to.</em></h1>
          <p className="protect-hero-sub">
            Upload a policy, ticket, bill, contract or financial document. ClaimBack finds the
            benefits, risks, deadlines and actions hidden inside.
          </p>
          <button id="protect-start-btn" className="btn btn-primary btn-lg" onClick={() => setStage("form")}>
            <Icon name="upload" size={18} /> Analyze a document <Icon name="arrow" size={16} />
          </button>
        </div>

        <div className="protect-capabilities">
          {[
            { icon: "checkCircle", color: "green", title: "What you get", desc: "Benefits, entitlements and coverage mapped clearly." },
            { icon: "warning", color: "amber", title: "Deadlines", desc: "Important dates you must not miss." },
            { icon: "xCircle", color: "red", title: "Risks & exclusions", desc: "What is not covered and what could go wrong." },
            { icon: "flag", color: "blue", title: "Your obligations", desc: "What you must do to maintain your entitlement." },
            { icon: "clock", color: "amber", title: "Immediate actions", desc: "What to do right now to protect yourself." },
            { icon: "info", color: "blue", title: "Questions to clarify", desc: "Things worth asking before you assume coverage." },
          ].map(cap => (
            <div key={cap.title} className="cap-card">
              <div className={`cap-icon cap-${cap.color}`}><Icon name={cap.icon} size={18} /></div>
              <div>
                <div className="cap-title">{cap.title}</div>
                <div className="cap-desc">{cap.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="protect-doc-types">
          <div className="kicker">Works with any of these</div>
          <div className="doc-type-pills">
            {["Flight tickets", "Insurance policies", "Travel cover", "Bank documents", "Loan agreements", "Warranties", "Subscriptions", "Investments", "Contracts", "Purchase invoices"].map(t => (
              <span key={t} className="doc-type-pill">{t}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ANALYZING ────────────────────────────────────────────────────────────
  if (stage === "analyzing") {
    return (
      <div className="view-content">
        <div className="analyzing-wrap">
          <div className="analyzing-ring">
            <div className="analyzing-spinner" />
            <div className="analyzing-icon"><Icon name="shield" size={28} /></div>
          </div>
          <h2 className="analyzing-title">Analyzing your document</h2>
          <p className="analyzing-sub">This usually takes 15–30 seconds.</p>
          <div className="analysis-steps">
            {ANALYSIS_STEPS.map((step, i) => (
              <div key={step} className={`analysis-step ${i <= analysisStep ? "done" : ""} ${i === analysisStep ? "current" : ""}`}>
                <div className="analysis-step-icon">
                  {i < analysisStep ? <Icon name="checkCircle" size={14} /> : <span>{String(i + 1).padStart(2, "0")}</span>}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── REPORT ───────────────────────────────────────────────────────────────
  if (stage === "report" && analysis) {
    return (
      <ProtectionReport
        analysis={analysis}
        onBack={() => { setStage("intro"); setAnalysis(null); setFile(null); setForm({ title: "", provider_name: "", description: "" }); setCategory(null); }}
        onStartClaim={() => navigate("claims")}
      />
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <div className="view-content">
      <div className="view-header">
        <div>
          <button className="btn btn-ghost btn-sm back-btn" onClick={() => setStage("intro")} id="protect-back-btn">
            <Icon name="arrowLeft" size={15} /> Back
          </button>
          <div className="kicker" style={{ marginTop: 12 }}>Protection analysis</div>
          <h1 className="view-title">Upload your document</h1>
        </div>
      </div>

      <form id="protect-upload-form" className="upload-form-layout" onSubmit={handleSubmit}>
        {/* Category picker */}
        <div className="surface-card">
          <div className="form-section-title">What type of document is this?</div>
          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                type="button"
                id={`cat-${cat.key}`}
                className={`category-btn ${category?.key === cat.key ? "selected" : ""}`}
                onClick={() => setCategory(cat)}
              >
                <Icon name={cat.icon} size={20} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* File drop zone */}
        <div className="surface-card">
          <div className="form-section-title">Upload file</div>
          <div
            className={`dropzone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            id="protect-dropzone"
          >
            <input
              ref={fileRef}
              type="file"
              style={{ display: "none" }}
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={e => handleFile(e.target.files?.[0])}
              id="protect-file-input"
            />
            {file ? (
              <div className="dropzone-file">
                <Icon name="file" size={24} />
                <div>
                  <div className="dropzone-filename">{file.name}</div>
                  <div className="dropzone-size">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                  id="protect-remove-file"
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="dropzone-icon"><Icon name="upload" size={28} /></div>
                <div className="dropzone-text">Drop your file here, or click to browse</div>
                <div className="dropzone-hint">PDF, DOC, DOCX, TXT, PNG, JPG accepted</div>
              </>
            )}
          </div>
        </div>

        {/* Document details */}
        <div className="surface-card">
          <div className="form-section-title">Document details</div>
          <div className="form-fields">
            <div className="field-group">
              <label className="field-label" htmlFor="prot-title">Document title</label>
              <input
                id="prot-title"
                className="field-input"
                type="text"
                placeholder="e.g. IndiGo Flight Insurance Policy"
                value={form.title}
                onChange={e => update("title", e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="prot-provider">Provider / issuer</label>
              <input
                id="prot-provider"
                className="field-input"
                type="text"
                placeholder="e.g. ICICI Lombard, HDFC Bank, Amazon"
                value={form.provider_name}
                onChange={e => update("provider_name", e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="prot-desc">Additional context <span className="field-optional">(optional)</span></label>
              <textarea
                id="prot-desc"
                className="field-input field-textarea"
                rows={3}
                placeholder="Any useful context about this document or what you want to understand…"
                value={form.description}
                onChange={e => update("description", e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="form-error" role="alert">
            <Icon name="xCircle" size={16} /> {error}
          </div>
        )}

        <button id="protect-submit-btn" className="btn btn-primary btn-full btn-lg" type="submit">
          <Icon name="shield" size={18} /> Analyze this document
        </button>
      </form>
    </div>
  );
}
