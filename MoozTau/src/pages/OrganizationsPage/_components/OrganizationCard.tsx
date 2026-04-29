import type { CSSProperties } from "react";

import type { Organization } from "@/types";

import { ORG_TYPE_BADGE_CLASS, ORG_TYPE_LABELS } from "../constants";

type OrganizationCardProps = {
  organization: Organization;
  canManage: boolean;
  isBusy: boolean;
  onEdit: (organization: Organization) => void;
  onToggleActive: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
  style?: CSSProperties;
};

export function OrganizationCard({
  organization,
  canManage,
  isBusy,
  onEdit,
  onToggleActive,
  onDelete,
  style,
}: OrganizationCardProps) {
  return (
    <article className={`orgs-card${!organization.is_active ? " orgs-card--inactive" : ""}`} style={style}>
      <div className="orgs-card-head">
        <div className="orgs-card-title-wrap">
          <div className="orgs-card-title-row">
            <h3 className="orgs-card-title">{organization.name}</h3>
            <span className={ORG_TYPE_BADGE_CLASS[organization.org_type]}>
              {ORG_TYPE_LABELS[organization.org_type]}
            </span>
          </div>
          <div className="orgs-card-meta">
            <span className={`orgs-status-dot${organization.is_active ? " is-on" : ""}`} />
            <span>{organization.is_active ? "Активна" : "Выключена"}</span>
            {organization.region ? <span>• {organization.region}</span> : null}
          </div>
        </div>

        {canManage ? (
          <div className="orgs-card-actions">
            <button className="orgs-ghost-btn" type="button" disabled={isBusy} onClick={() => onEdit(organization)}>
              Изменить
            </button>
            <button className="orgs-ghost-btn" type="button" disabled={isBusy} onClick={() => onToggleActive(organization)}>
              {organization.is_active ? "Деактивировать" : "Активировать"}
            </button>
            <button className="orgs-danger-btn" type="button" disabled={isBusy} onClick={() => onDelete(organization)}>
              Удалить
            </button>
          </div>
        ) : null}
      </div>

      <div className="orgs-card-body">
        {organization.address ? (
          <div className="orgs-info-block">
            <span className="orgs-info-label">Адрес</span>
            <p className="orgs-info-value">{organization.address}</p>
          </div>
        ) : null}

        {organization.contact_phone || organization.contact_email ? (
          <div className="orgs-contact-row">
            {organization.contact_phone ? (
              <span className="orgs-contact-pill">{organization.contact_phone}</span>
            ) : null}
            {organization.contact_email ? (
              <span className="orgs-contact-pill">{organization.contact_email}</span>
            ) : null}
          </div>
        ) : (
          <p className="orgs-muted-text">Контакты пока не заполнены.</p>
        )}
      </div>
    </article>
  );
}
