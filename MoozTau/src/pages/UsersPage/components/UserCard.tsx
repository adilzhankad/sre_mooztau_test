import type { CSSProperties } from "react";

import type { User } from "@/types";
import type { Organization } from "@/types";
import { ROLE_LABELS, ROLE_BADGE } from "../constants/roles";
import { getInitials } from "../utils/getInitials";

interface UserCardProps {
  user: User;
  organizations?: Organization[];
  onToggle: (id: number) => void;
  style?: CSSProperties;
}

export function UserCard({ user, organizations, onToggle, style }: UserCardProps) {
  const orgName = organizations?.find((o) => o.id === user.organization_id)?.name;

  return (
    <div className="ucard" style={style}>
      <div className="ucard-top">
        <div className={`ucard-avatar ucard-avatar--${user.role.toLowerCase()}`}>
          {getInitials(user.full_name)}
          <span className={`ucard-dot ${user.is_active ? "on" : "off"}`} />
        </div>

        <div className="ucard-meta">
          <div className="ucard-name-row">
            <span className="ucard-name">{user.full_name}</span>
            <span className={`ucard-badge ${ROLE_BADGE[user.role] ?? "badge-neutral"}`}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <p className="ucard-phone">{user.phone}</p>
          {orgName && <p className="ucard-org">{orgName}</p>}
        </div>
      </div>

      <div className="ucard-foot">
        <span className="ucard-org-label">{orgName ?? ""}</span>
        <div className="ucard-toggle-wrap">
          <span className="ucard-toggle-lbl">
            {user.is_active ? "Активен" : "Неактивен"}
          </span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={user.is_active}
              onChange={() => onToggle(user.id)}
            />
            <div className="toggle-track" />
          </label>
        </div>
      </div>
    </div>
  );
}
