import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import { authApi } from "../api/auth.js";
import { tokenStore } from "../api/client.js";

export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await authApi.login(form.email, form.password);
      } else {
        await authApi.register(form.email, form.password, form.full_name);
        await authApi.login(form.email, form.password);
      }
      const user = await authApi.me();
      onAuth(user);
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-mark-large">C</div>
          <div>
            <div className="brand-name-large">CLAIMBACK</div>
            <div className="brand-tag">Consumer protection platform</div>
          </div>
        </div>
        <div className="auth-hero-copy">
          <h1>Before it costs you.<br /><em>Know what you're entitled to.</em></h1>
          <p>Upload any policy, contract, or financial document. ClaimBack surfaces your benefits, risks, deadlines, and obligations — before something goes wrong.</p>
        </div>
        <div className="auth-flow-steps">
          {["Upload document", "Understand it", "Protect yourself", "Start claim if needed", "Add evidence", "Get resolution"].map((s, i) => (
            <div key={s} className="auth-flow-step">
              <span className="auth-flow-num">0{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              id="auth-tab-login"
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => { setTab("login"); setError(""); }}
            >Sign in</button>
            <button
              id="auth-tab-register"
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => { setTab("register"); setError(""); }}
            >Create account</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="auth-form">
            {tab === "register" && (
              <div className="field-group">
                <label className="field-label" htmlFor="field-name">Full name</label>
                <input
                  id="field-name"
                  className="field-input"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.full_name}
                  onChange={e => update("full_name", e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}
            <div className="field-group">
              <label className="field-label" htmlFor="field-email">Email</label>
              <input
                id="field-email"
                className="field-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => update("email", e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="field-password">Password</label>
              <div className="field-pw-wrap">
                <input
                  id="field-password"
                  className="field-input"
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={e => update("password", e.target.value)}
                  required
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <Icon name={showPw ? "eyeOff" : "eye"} size={15} />
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <Icon name="xCircle" size={15} />
                {error}
              </div>
            )}

            <button
              id="auth-submit-btn"
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <><span className="btn-spinner" />{tab === "login" ? "Signing in…" : "Creating account…"}</>
              ) : (
                <>{tab === "login" ? "Sign in" : "Create account"}<Icon name="arrow" size={16} /></>
              )}
            </button>
          </form>

          <p className="auth-switch">
            {tab === "login" ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <button
              className="link-btn"
              onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); }}
            >
              {tab === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
