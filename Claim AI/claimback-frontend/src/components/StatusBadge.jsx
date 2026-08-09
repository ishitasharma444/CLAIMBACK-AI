import React from "react";

const config = {
  draft: { label: "Draft", cls: "status-draft" },
  submitted: { label: "Submitted", cls: "status-submitted" },
  under_review: { label: "Under Review", cls: "status-review" },
  approved: { label: "Approved", cls: "status-approved" },
  rejected: { label: "Rejected", cls: "status-rejected" },
  closed: { label: "Closed", cls: "status-closed" },
  uploaded: { label: "Uploaded", cls: "status-uploaded" },
  analyzed: { label: "Analyzed", cls: "status-analyzed" },
  pending: { label: "Pending", cls: "status-draft" },
  completed: { label: "Completed", cls: "status-approved" },
  active: { label: "Active", cls: "status-submitted" },
};

export default function StatusBadge({ status }) {
  const key = status?.toLowerCase() || "draft";
  const { label, cls } = config[key] || { label: status || "—", cls: "status-draft" };
  return <span className={`status-badge ${cls}`}>{label}</span>;
}
