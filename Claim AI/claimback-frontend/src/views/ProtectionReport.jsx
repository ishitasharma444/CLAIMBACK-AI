import React, { useState } from "react";
import Icon from "../components/Icon.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";

function Section({ title, icon, iconColor, items, emptyText, renderItem, collapsible = true }) {
  const [open, setOpen] = useState(true);
  if (!items?.length && !emptyText) return null;
  return (
    <div className="report-section">
      <button
        className={`report-section-header ${collapsible ? "collapsible" : ""}`}
        onClick={() => collapsible && setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className={`report-section-icon ${iconColor}`}><Icon name={icon} size={16} /></div>
        <span className="report-section-title">{title}</span>
        {items?.length > 0 && <span className="report-section-count">{items.length}</span>}
        {collapsible && <Icon name={open ? "chevronDown" : "chevronRight"} size={15} className="report-chevron" />}
      </button>
      {open && (
        <div className="report-section-body">
          {!items?.length ? (
            <div className="report-empty">{emptyText}</div>
          ) : (
            <ul className="report-list">
              {items.map((item, i) => (
                <li key={i} className="report-list-item">
                  {renderItem ? renderItem(item, i) : <span>{item}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function StringList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="report-list">
      {items.map((item, i) => <li key={i} className="report-list-item"><span className="report-bullet" />{item}</li>)}
    </ul>
  );
}

function DeadlineList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="report-list">
      {items.map((item, i) => (
        <li key={i} className="report-list-item deadline-item">
          <Icon name="clock" size={14} className="deadline-icon" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FindingCard({ finding }) {
  return (
    <div className={`finding-card finding-${finding.severity?.toLowerCase() || "low"}`}>
      <div className="finding-card-header">
        <SeverityBadge severity={finding.severity} />
        {finding.category && <span className="finding-category">{finding.category}</span>}
      </div>
      <div className="finding-title">{finding.title}</div>
      <div className="finding-desc">{finding.description}</div>
      {finding.source_reference && (
        <div className="finding-source"><Icon name="file" size={12} /> {finding.source_reference}</div>
      )}
    </div>
  );
}

function ActionCard({ action }) {
  const priorityIcon = action.priority === "high" || action.priority === "critical" ? "warning" : "arrow";
  return (
    <div className={`action-card action-${action.priority?.toLowerCase() || "medium"}`}>
      <div className="action-header">
        <div className={`action-priority-badge priority-${action.priority?.toLowerCase()}`}>
          <Icon name={priorityIcon} size={12} /> {action.priority || "medium"}
        </div>
      </div>
      <div className="action-title">{action.title}</div>
      <div className="action-desc">{action.description}</div>
    </div>
  );
}

export default function ProtectionReport({ analysis, onBack, onStartClaim }) {
  const score = analysis?.protection_score ?? 0;
  const findings = analysis?.findings_json?.findings || [];
  const actions = analysis?.findings_json?.actions || [];

  return (
    <div className="view-content report-view">
      {/* Top bar */}
      <div className="report-topbar">
        <button className="btn btn-ghost btn-sm" onClick={onBack} id="report-back-btn">
          <Icon name="arrowLeft" size={15} /> New analysis
        </button>
        <button className="btn btn-primary btn-sm" onClick={onStartClaim} id="report-claim-btn">
          <Icon name="claims" size={15} /> Start a claim
        </button>
      </div>

      {/* Score header */}
      <div className="report-hero surface-card">
        <div className="report-score-col">
          <ScoreRing score={score} size={130} strokeWidth={9} />
          <div className="report-score-label">Protection Score</div>
        </div>
        <div className="report-hero-meta">
          <div className="kicker">Protection report</div>
          <h1 className="report-title">
            {analysis?.document_type || "Your document"} analysis
          </h1>
          {analysis?.provider_name && (
            <div className="report-provider"><Icon name="flag" size={14} /> {analysis.provider_name}</div>
          )}
          <div className="report-score-desc">
            {score >= 70
              ? "This document offers strong protection with clear entitlements."
              : score >= 40
              ? "This document offers moderate protection. Review the risks and deadlines carefully."
              : "This document has significant gaps or risks. Take immediate action."}
          </div>
          <div className="report-stat-row">
            <div className="report-stat"><Icon name="checkCircle" size={14} className="text-green" /> {analysis?.key_benefits?.length || 0} benefits</div>
            <div className="report-stat"><Icon name="xCircle" size={14} className="text-red" /> {analysis?.exclusions?.length || 0} exclusions</div>
            <div className="report-stat"><Icon name="clock" size={14} className="text-amber" /> {analysis?.important_deadlines?.length || 0} deadlines</div>
          </div>
        </div>
      </div>

      {/* Report sections */}
      <div className="report-body">

        {/* WHAT YOU GET */}
        <Section
          title="What you get"
          icon="checkCircle"
          iconColor="icon-green"
          items={[...(analysis?.key_benefits || []), ...(analysis?.coverage_entitlements || [])]}
          emptyText="No benefits detected."
          renderItem={(item) => <><span className="report-bullet green-bullet" />{item}</>}
        />

        {/* WHAT CAN GO WRONG */}
        <Section
          title="What can go wrong"
          icon="warning"
          iconColor="icon-red"
          items={[...(analysis?.potential_risks || []), ...(analysis?.exclusions || [])]}
          emptyText="No risks or exclusions detected."
          renderItem={(item) => <><span className="report-bullet red-bullet" />{item}</>}
        />

        {/* FEES & PENALTIES */}
        <Section
          title="Fees & penalties"
          icon="warning"
          iconColor="icon-amber"
          items={analysis?.fees_and_penalties}
          emptyText="No fees or penalties noted."
          renderItem={(item) => <><span className="report-bullet amber-bullet" />{item}</>}
        />

        {/* IMPORTANT DEADLINES */}
        {analysis?.important_deadlines?.length > 0 && (
          <div className="report-section">
            <div className="report-section-header">
              <div className="report-section-icon icon-amber"><Icon name="clock" size={16} /></div>
              <span className="report-section-title">Important deadlines</span>
              <span className="report-section-count">{analysis.important_deadlines.length}</span>
            </div>
            <div className="report-section-body">
              <DeadlineList items={analysis.important_deadlines} />
            </div>
          </div>
        )}

        {/* YOUR OBLIGATIONS */}
        <Section
          title="Your obligations"
          icon="flag"
          iconColor="icon-blue"
          items={analysis?.user_obligations}
          emptyText="No obligations listed."
          renderItem={(item) => <><span className="report-bullet blue-bullet" />{item}</>}
        />

        {/* KEEP THESE READY */}
        <Section
          title="Keep these ready"
          icon="doc"
          iconColor="icon-neutral"
          items={analysis?.required_documentation}
          emptyText="No documentation requirements listed."
          renderItem={(item) => <><span className="report-bullet" />{item}</>}
        />

        {/* PROTECT YOURSELF */}
        <Section
          title="Protect yourself"
          icon="shield"
          iconColor="icon-green"
          items={analysis?.precautions}
          emptyText="No precautions listed."
          renderItem={(item) => <><span className="report-bullet green-bullet" />{item}</>}
        />

        {/* DO THIS NOW */}
        <Section
          title="Do this now"
          icon="alert"
          iconColor="icon-red"
          items={analysis?.immediate_actions}
          emptyText="No immediate actions required."
          renderItem={(item) => <><span className="report-bullet red-bullet" />{item}</>}
          collapsible={false}
        />

        {/* QUESTIONS TO CLARIFY */}
        <Section
          title="Questions to clarify"
          icon="info"
          iconColor="icon-blue"
          items={analysis?.questions_to_clarify}
          emptyText="No clarification questions."
          renderItem={(item) => <><span className="report-bullet blue-bullet" />{item}</>}
        />

        {/* FINDINGS */}
        {findings.length > 0 && (
          <div className="report-section">
            <div className="report-section-header">
              <div className="report-section-icon icon-amber"><Icon name="analysis" size={16} /></div>
              <span className="report-section-title">Detailed findings</span>
              <span className="report-section-count">{findings.length}</span>
            </div>
            <div className="report-section-body findings-grid">
              {findings.map((f, i) => <FindingCard key={i} finding={f} />)}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        {actions.length > 0 && (
          <div className="report-section">
            <div className="report-section-header">
              <div className="report-section-icon icon-green"><Icon name="checkCircle" size={16} /></div>
              <span className="report-section-title">Recommended actions</span>
              <span className="report-section-count">{actions.length}</span>
            </div>
            <div className="report-section-body actions-grid">
              {actions.map((a, i) => <ActionCard key={i} action={a} />)}
            </div>
          </div>
        )}
      </div>

      {/* CTA footer */}
      <div className="report-cta surface-card">
        <div className="report-cta-copy">
          <h2>Something went wrong?</h2>
          <p>If an incident has already occurred, start a claim. Your protection analysis provides context as you build your case.</p>
        </div>
        <button id="report-start-claim-btn" className="btn btn-primary" onClick={onStartClaim}>
          <Icon name="claims" size={16} /> Start a claim <Icon name="arrow" size={16} />
        </button>
      </div>
    </div>
  );
}
