import React from "react";
import Icon from "./Icon.jsx";

export default function EmptyState({ icon = "doc", title, body, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon name={icon} size={24} />
      </div>
      {title && <h3 className="empty-state-title">{title}</h3>}
      {body && <p className="empty-state-body">{body}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick} id={action.id}>
          {action.label}
        </button>
      )}
    </div>
  );
}
