import React from "react";

/**
 * Animated SVG score ring.
 * score: 0–100
 * Color: green ≥70, amber 40–69, red <40
 */
export default function ScoreRing({ score, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(score ?? 0, 0), 100);
  const offset = circumference - (pct / 100) * circumference;

  const color =
    pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--amber)" : "var(--red)";

  const label =
    pct >= 70 ? "Strong" : pct >= 40 ? "Moderate" : "Weak";

  return (
    <div className="score-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="score-ring-inner">
        <span className="score-ring-number" style={{ color }}>{pct}</span>
        <span className="score-ring-label">{label}</span>
      </div>
    </div>
  );
}
