import React from "react";

const config = {
  low: { label: "Low", cls: "severity-low" },
  medium: { label: "Medium", cls: "severity-medium" },
  high: { label: "High", cls: "severity-high" },
  critical: { label: "Critical", cls: "severity-critical" },
};

export default function SeverityBadge({ severity }) {
  const s = severity?.toLowerCase() || "low";
  const { label, cls } = config[s] || config.low;
  return <span className={`severity-badge ${cls}`}>{label}</span>;
}
