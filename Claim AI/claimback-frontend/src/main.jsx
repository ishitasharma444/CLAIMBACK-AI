import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_BASE = "http://127.0.0.1:8001";

const Icon = ({ name, size = 18, stroke = 1.8 }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    claims: <><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5"/><path d="M9 13h6M9 17h5"/></>,
    vault: <><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 9h18M8 6V4h8v2"/></>,
    route: <><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M8.5 16.5 15.5 8.5"/></>,
    protection: <><path d="M12 3 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    doc: <><path d="M7 3h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    alert: <><path d="M12 3 22 20H2z"/><path d="M12 9v5M12 17h.01"/></>,
    shield: <><path d="M12 3 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
    file: <><path d="M8 3h7l5 5v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M15 3v5h5"/></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></>,
  };

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const navItems = [
  { key: "overview", label: "Overview", icon: "dashboard" },
  { key: "protect", label: "Protect", icon: "protection" },
  { key: "documents", label: "Documents", icon: "doc" },
  { key: "claims", label: "Claims", icon: "claims" },
  { key: "resolution", label: "Resolution", icon: "route" },
];

const productFlow = [
  { title: "Document", subtitle: "Upload every policy, email, invoice, or contract." },
  { title: "Understand", subtitle: "Know what rights, entitlements, and obligations apply." },
  { title: "Protect", subtitle: "Act before the loss happens or the deadline passes." },
  { title: "Claim", subtitle: "If something goes wrong, start a claim with evidence-backed context." },
  { title: "Prove", subtitle: "Strengthen your file with the right supporting documents." },
  { title: "Resolve", subtitle: "Follow the best next steps to close the issue faster." },
];

const benefitCards = [
  { title: "Protect before you claim", text: "Catch exclusions, deadlines, obligations, and risks before they become expensive surprises." },
  { title: "Analyze a document", text: "Turn contracts, policies, and communication into clear coverage insights and next actions." },
  { title: "Evidence collection", text: "Track the records, proof, and documents needed to support your position." },
  { title: "Resolution path", text: "Move from review to action with a practical, consumer-first path to resolution." },
];

function App() {
  const [activeView, setActiveView] = useState("overview");
  const [dark, setDark] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("claimback_token") || "");
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Sign in to load your real protection data.");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [uploadForm, setUploadForm] = useState({
    title: "Travel insurance policy",
    document_type: "travel_insurance",
    provider_name: "Indigo",
    description: "",
    file: null,
  });

  const themeClass = dark ? "" : "light";

  const authHeaders = useMemo(() => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  const fetchDashboard = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [profileRes, claimsRes, docsRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/claims`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/protection/documents`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!profileRes.ok || !claimsRes.ok || !docsRes.ok) {
        throw new Error("Your token is no longer valid.");
      }

      const profile = await profileRes.json();
      const claimsData = await claimsRes.json();
      const documentsData = await docsRes.json();

      setUser(profile);
      setClaims(Array.isArray(claimsData) ? claimsData : []);
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
      setStatus("Your protection data is live and connected to the backend.");
    } catch (error) {
      setStatus(error.message || "Unable to load your backend data.");
      setUser(null);
      setClaims([]);
      setDocuments([]);
      setToken("");
      localStorage.removeItem("claimback_token");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("Signing in to your ClaimBack account...");

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      const nextToken = data.access_token;
      localStorage.setItem("claimback_token", nextToken);
      setToken(nextToken);
      setStatus("Logged in. Loading real document and claim data...");
      setAuthForm({ email: "", password: "" });
    } catch (error) {
      setStatus(error.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAndAnalyze = async (event) => {
    event.preventDefault();
    if (!token) {
      setStatus("Login first so the backend can create and analyze the document for you.");
      return;
    }
    if (!uploadForm.file) {
      setStatus("Choose a document before running protection analysis.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", uploadForm.title || "Document review");
      formData.append("document_type", uploadForm.document_type || "policy_document");
      formData.append("provider_name", uploadForm.provider_name || "Provider");
      formData.append("description", uploadForm.description || "");
      formData.append("file", uploadForm.file);

      const createRes = await fetch(`${API_BASE}/api/v1/protection/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const created = await createRes.json();
      if (!createRes.ok) {
        throw new Error(created.detail || "Document upload failed");
      }

      const analyzeRes = await fetch(`${API_BASE}/api/v1/protection/documents/${created.id}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const analysisData = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(analysisData.detail || "Analysis failed");
      }

      setAnalysis(analysisData.analysis || null);
      setStatus("Protection analysis completed. Review the report and next steps below.");
      await fetchDashboard();
    } catch (error) {
      setStatus(error.message || "Could not complete document analysis.");
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    { label: "Active documents", value: documents.length || 0, tone: "violet" },
    { label: "Claims in progress", value: claims.length || 0, tone: "cyan" },
    { label: "Protection score", value: analysis ? `${analysis.protection_score}/100` : "—", tone: "green" },
    { label: "Coverage alerts", value: analysis ? (analysis.exclusions?.length || 0) : 0, tone: "amber" },
  ];

  return (
    <div className={`app-shell ${themeClass}`}>
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">C</div>
          <div>
            <div className="brand-name">CLAIMBACK</div>
            <div className="brand-tag">Before it costs you.</div>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeView === item.key ? "active" : ""}`}
              onClick={() => setActiveView(item.key)}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-label">Product story</div>
          <div className="sidebar-card-copy">Document → Understand → Protect → Claim → Prove → Resolve.</div>
        </div>

        <div className="profile-block">
          {user ? (
            <>
              <div className="avatar-pill">{user.full_name?.charAt(0)?.toUpperCase() || "U"}</div>
              <div>
                <div className="profile-name">{user.full_name || "ClaimBack user"}</div>
                <div className="profile-email">{user.email}</div>
              </div>
            </>
          ) : (
            <>
              <div className="avatar-pill muted">L</div>
              <div>
                <div className="profile-name">Guest mode</div>
                <div className="profile-email">Log in to sync your backend data</div>
              </div>
            </>
          )}
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <div className="eyebrow-text">Consumer protection and claim resolution platform</div>
            <h1>Before it costs you. Know what you’re entitled to.</h1>
          </div>
          <div className="header-actions">
            <button className="ghost-btn" onClick={() => setActiveView("protect")}>Analyze a document</button>
            <button className="theme-btn" onClick={() => setDark((value) => !value)}>
              <Icon name={dark ? "moon" : "sun"} size={14} />
            </button>
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-copy">
            <div className="tag-row">
              <span className="tag">Protection</span>
              <span className="tag">Claims</span>
              <span className="tag">Evidence</span>
            </div>
            <p>
              ClaimBack helps people understand their rights, prepare before a loss, protect what matters,
              and move into claims and resolution with clarity instead of confusion.
            </p>
            <div className="cta-row">
              <button className="primary-btn" onClick={() => setActiveView("protect")}>Protect before you claim</button>
              <button className="secondary-btn" onClick={() => setActiveView("resolution")}>See resolution path</button>
            </div>
          </div>

          <div className="hero-card glass-card">
            <div className="status-bubble">LIVE backend sync</div>
            <div className="hero-metric">
              <div>
                <strong>{documents.length || 0}</strong>
                <span>documents reviewed</span>
              </div>
              <div>
                <strong>{claims.length || 0}</strong>
                <span>claims tracked</span>
              </div>
            </div>
            <div className="hero-mini-stack">
              <div className="mini-pill success">Protection score {analysis ? `${analysis.protection_score}/100` : "—"}</div>
              <div className="mini-pill info">Rights clarified</div>
              <div className="mini-pill warning">Deadlines tracked</div>
            </div>
          </div>
        </section>

        <section className="metrics-grid">
          {metricCards.map((item) => (
            <div key={item.label} className={`metric-card ${item.tone}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel glass-card">
            <div className="panel-header">
              <div>
                <div className="section-kicker">Protection workflow</div>
                <h2>From document to decision.</h2>
              </div>
            </div>

            <div className="story-grid">
              {productFlow.map((item, index) => (
                <div key={item.title} className="story-card">
                  <div className="story-number">0{index + 1}</div>
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel glass-card auth-panel">
            <div className="panel-header">
              <div>
                <div className="section-kicker">Secure access</div>
                <h2>{user ? "Connected" : "Sign in"}</h2>
              </div>
            </div>

            {user ? (
              <div className="user-card">
                <div className="user-badge"><Icon name="shield" size={18} /></div>
                <strong>{user.full_name}</strong>
                <span>{user.email}</span>
                <button
                  className="secondary-btn full-width"
                  onClick={() => {
                    localStorage.removeItem("claimback_token");
                    setToken("");
                    setUser(null);
                    setStatus("Signed out. Login again to continue.");
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleLogin}>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Password"
                    required
                  />
                </label>
                <button className="primary-btn full-width" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Log in with backend"}
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="panel glass-card lower-panel">
          <div className="panel-header">
            <div>
              <div className="section-kicker">What ClaimBack does</div>
              <h2>Built around real backend capabilities.</h2>
            </div>
          </div>

          <div className="benefit-grid">
            {benefitCards.map((card) => (
              <div key={card.title} className="benefit-card">
                <div className="benefit-icon"><Icon name="spark" size={16} /></div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="analysis-grid">
          <div className="panel glass-card">
            <div className="panel-header">
              <div>
                <div className="section-kicker">Analyze a document</div>
                <h2>Protection review</h2>
              </div>
            </div>

            <form className="upload-form" onSubmit={handleUploadAndAnalyze}>
              <div className="field-row">
                <label>
                  <span>Document title</span>
                  <input
                    value={uploadForm.title}
                    onChange={(event) => setUploadForm((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </label>
                <label>
                  <span>Document type</span>
                  <input
                    value={uploadForm.document_type}
                    onChange={(event) => setUploadForm((prev) => ({ ...prev, document_type: event.target.value }))}
                  />
                </label>
              </div>

              <div className="field-row">
                <label>
                  <span>Provider</span>
                  <input
                    value={uploadForm.provider_name}
                    onChange={(event) => setUploadForm((prev) => ({ ...prev, provider_name: event.target.value }))}
                  />
                </label>
                <label>
                  <span>File</span>
                  <input
                    type="file"
                    onChange={(event) => setUploadForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))}
                  />
                </label>
              </div>

              <label>
                <span>Description</span>
                <textarea
                  rows="4"
                  value={uploadForm.description}
                  onChange={(event) => setUploadForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Optional context about the policy, contract, or document"
                />
              </label>

              <button className="primary-btn full-width" type="submit" disabled={loading}>
                {loading ? "Analyzing..." : "Upload and analyze with backend"}
              </button>
            </form>
          </div>

          <div className="panel glass-card report-panel">
            <div className="panel-header">
              <div>
                <div className="section-kicker">Protection report</div>
                <h2>Latest analysis</h2>
              </div>
            </div>

            {analysis ? (
              <div className="report-card">
                <div className="report-score">{analysis.protection_score}/100</div>
                <div className="report-meta">
                  <strong>{analysis.document_type}</strong>
                  <span>{analysis.provider_name || "Provider not specified"}</span>
                </div>

                <div className="list-block">
                  <h3>Key benefits</h3>
                  <ul>
                    {(analysis.key_benefits || []).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>

                <div className="list-block">
                  <h3>Important deadlines</h3>
                  <ul>
                    {(analysis.important_deadlines || []).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>

                <div className="list-block">
                  <h3>Exclusions and risks</h3>
                  <ul>
                    {(analysis.exclusions || []).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <Icon name="file" size={24} />
                <p>{status}</p>
              </div>
            )}
          </div>
        </section>

        <section className="lists-grid">
          <div className="panel glass-card">
            <div className="panel-header">
              <div>
                <div className="section-kicker">Documents</div>
                <h2>Uploaded protection files</h2>
              </div>
            </div>
            <div className="mini-list">
              {documents.length ? documents.map((item) => (
                <div key={item.id} className="mini-item">
                  <div className="mini-icon"><Icon name="doc" size={15} /></div>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.document_type}</span>
                  </div>
                </div>
              )) : <p className="empty-copy">No documents uploaded yet. Use the analysis form above to connect a real policy or document.</p>}
            </div>
          </div>

          <div className="panel glass-card">
            <div className="panel-header">
              <div>
                <div className="section-kicker">Claims</div>
                <h2>Open claims</h2>
              </div>
            </div>
            <div className="mini-list">
              {claims.length ? claims.map((item) => (
                <div key={item.id} className="mini-item">
                  <div className="mini-icon"><Icon name="claims" size={15} /></div>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.status} · {item.category}</span>
                  </div>
                </div>
              )) : <p className="empty-copy">No claims found yet. Create one from the ClaimBack flow after uploading evidence.</p>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);