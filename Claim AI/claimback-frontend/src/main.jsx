import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import Icon from "./components/Icon.jsx";
import AuthPage from "./views/AuthPage.jsx";
import Dashboard from "./views/Dashboard.jsx";
import Protect from "./views/Protect.jsx";
import Documents from "./views/Documents.jsx";
import Claims from "./views/Claims.jsx";
import ClaimDetail from "./views/ClaimDetail.jsx";

import { authApi } from "./api/auth.js";
import { tokenStore } from "./api/client.js";

const NAV_ITEMS = [
  { key: "dashboard", label: "Overview", icon: "dashboard" },
  { key: "protect", label: "Protect", icon: "shield" },
  { key: "documents", label: "Documents", icon: "doc" },
  { key: "claims", label: "Claims", icon: "claims" },
];

function Sidebar({ activeView, navigate, user, onLogout, collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-mark">C</div>
        {!collapsed && (
          <div className="brand-text">
            <div className="brand-name">CLAIMBACK</div>
            <div className="brand-tag">Before it costs you.</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            id={`nav-${item.key}`}
            className={`nav-item ${activeView === item.key || (activeView === "claim-detail" && item.key === "claims") ? "active" : ""}`}
            onClick={() => navigate(item.key)}
            title={collapsed ? item.label : undefined}
          >
            <Icon name={item.icon} size={17} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* Collapse toggle */}
        <button
          className="nav-item collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          id="sidebar-collapse-btn"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name={collapsed ? "chevronRight" : "arrowLeft"} size={15} />
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Profile */}
        {user && (
          <div className={`sidebar-profile ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar-avatar" title={user.full_name || user.email}>
              {(user.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
            </div>
            {!collapsed && (
              <div className="sidebar-profile-info">
                <div className="sidebar-profile-name">{user.full_name || "User"}</div>
                <div className="sidebar-profile-email">{user.email}</div>
              </div>
            )}
            {!collapsed && (
              <button className="btn btn-icon" onClick={onLogout} title="Sign out" id="logout-btn">
                <Icon name="logout" size={15} />
              </button>
            )}
          </div>
        )}
        {user && collapsed && (
          <button className="nav-item" onClick={onLogout} title="Sign out" id="logout-btn-collapsed">
            <Icon name="logout" size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}

function Topbar({ user, activeView, navigate, onLogout, onMenuToggle }) {
  const viewLabels = {
    dashboard: "Overview",
    protect: "Protect",
    documents: "Documents",
    claims: "Claims",
    "claim-detail": "Claim details",
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn btn-icon topbar-menu" onClick={onMenuToggle} id="mobile-menu-btn" aria-label="Toggle menu">
          <Icon name="menu" size={18} />
        </button>
        <div className="topbar-page">{viewLabels[activeView] || "ClaimBack"}</div>
      </div>
      <div className="topbar-right">
        {user ? (
          <>
            <div className="topbar-user">
              <div className="topbar-avatar">{(user.full_name?.[0] || "U").toUpperCase()}</div>
              <span className="topbar-name">{user.full_name}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onLogout} id="topbar-logout-btn">
              <Icon name="logout" size={14} /> Sign out
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [hydrating, setHydrating] = useState(true);
  const [view, setView] = useState("dashboard");
  const [navParams, setNavParams] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Hydrate user on load
  useEffect(() => {
    const token = tokenStore.getAccess();
    if (!token) { setHydrating(false); return; }
    authApi.me()
      .then(u => setUser(u))
      .catch(() => { tokenStore.clear(); })
      .finally(() => setHydrating(false));
  }, []);

  // Listen for logout events from the API client (token expiry)
  useEffect(() => {
    const handler = () => { setUser(null); setView("dashboard"); };
    window.addEventListener("cb:logout", handler);
    return () => window.removeEventListener("cb:logout", handler);
  }, []);

  const navigate = (target, params = {}) => {
    setView(target);
    setNavParams(params);
    setMobileSidebarOpen(false);
  };

  const handleAuth = (u) => {
    setUser(u);
    setView("dashboard");
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setView("dashboard");
  };

  if (hydrating) {
    return (
      <div className="hydrating">
        <div className="brand-mark" style={{width: 48, height: 48, fontSize: 28}}>C</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <div className={`app-shell ${mobileSidebarOpen ? "mobile-open" : ""}`}>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="mobile-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <Sidebar
        activeView={view}
        navigate={navigate}
        user={user}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className={`main-area ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Topbar
          user={user}
          activeView={view}
          navigate={navigate}
          onLogout={handleLogout}
          onMenuToggle={() => setMobileSidebarOpen(o => !o)}
        />

        <main className="main-content">
          {view === "dashboard" && <Dashboard user={user} navigate={navigate} />}
          {view === "protect" && <Protect navigate={navigate} />}
          {view === "documents" && <Documents navigate={navigate} />}
          {view === "claims" && <Claims navigate={navigate} />}
          {view === "claim-detail" && (
            <ClaimDetail claimId={navParams.claimId} navigate={navigate} />
          )}
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);