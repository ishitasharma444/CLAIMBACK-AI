import React from "react";

export default function LoadingSpinner({ text = "Loading…", size = "md" }) {
  return (
    <div className={`loading-spinner-wrap loading-${size}`}>
      <div className="loading-ring" />
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
}
