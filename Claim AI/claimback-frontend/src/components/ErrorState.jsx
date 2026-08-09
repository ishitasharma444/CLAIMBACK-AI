import React from "react";
import Icon from "./Icon.jsx";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        <Icon name="xCircle" size={22} />
      </div>
      <p className="error-state-msg">{message || "Something went wrong."}</p>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry} id="error-retry-btn">
          <Icon name="refresh" size={14} /> Try again
        </button>
      )}
    </div>
  );
}
