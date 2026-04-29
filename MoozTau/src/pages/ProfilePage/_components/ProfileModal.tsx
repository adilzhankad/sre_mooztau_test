import type { ReactNode } from "react";

interface ProfileModalProps {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

export function ProfileModal({ title, description, children, onClose }: ProfileModalProps) {
  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose} aria-label="Закрыть">
          <CloseIcon />
        </button>
        <div className="profile-modal-header">
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
