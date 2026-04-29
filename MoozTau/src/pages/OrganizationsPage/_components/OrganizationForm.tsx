import { formatPhone } from "@/lib/phone-mask";
import type { OrgType } from "@/types";

import { ORG_TYPE_LABELS } from "../constants";
import type { OrganizationFormValues } from "../types";

type OrganizationFormProps = {
  form: OrganizationFormValues;
  submitLabel: string;
  title: string;
  description: string;
  isPending: boolean;
  onChange: (next: OrganizationFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function OrganizationForm({
  form,
  submitLabel,
  title,
  description,
  isPending,
  onChange,
  onSubmit,
  onCancel,
}: OrganizationFormProps) {
  const isDisabled = isPending || !form.name.trim();

  return (
    <div className="orgs-form-card">
      <div className="orgs-form-head">
        <div>
          <h2 className="orgs-form-title">{title}</h2>
          <p className="orgs-form-description">{description}</p>
        </div>
        <button className="orgs-ghost-btn" type="button" onClick={onCancel}>
          Закрыть
        </button>
      </div>

      <div className="orgs-form-grid">
        <label className="orgs-field">
          <span className="orgs-field-label">Название</span>
          <input
            className="orgs-input"
            type="text"
            value={form.name}
            placeholder="Например, MoozTau Алматы"
            onChange={(event) => onChange({ ...form, name: event.target.value })}
          />
        </label>

        <label className="orgs-field">
          <span className="orgs-field-label">Тип</span>
          <select
            className="orgs-input"
            value={form.org_type}
            onChange={(event) =>
              onChange({ ...form, org_type: event.target.value as OrgType })
            }
          >
            {Object.entries(ORG_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="orgs-field">
          <span className="orgs-field-label">Телефон</span>
          <input
            className="orgs-input"
            type="tel"
            value={form.contact_phone ?? ""}
            placeholder="+7 (700) 123-45-67"
            onChange={(event) =>
              onChange({
                ...form,
                contact_phone: formatPhone(event.target.value),
              })
            }
          />
        </label>

        <label className="orgs-field">
          <span className="orgs-field-label">Email</span>
          <input
            className="orgs-input"
            type="email"
            value={form.contact_email ?? ""}
            placeholder="contact@mooztau.kz"
            onChange={(event) =>
              onChange({ ...form, contact_email: event.target.value })
            }
          />
        </label>

        <label className="orgs-field orgs-field--full">
          <span className="orgs-field-label">Адрес</span>
          <input
            className="orgs-input"
            type="text"
            value={form.address ?? ""}
            placeholder="Город, улица, дом"
            onChange={(event) => onChange({ ...form, address: event.target.value })}
          />
        </label>

        <label className="orgs-field">
          <span className="orgs-field-label">Регион</span>
          <input
            className="orgs-input"
            type="text"
            value={form.region ?? ""}
            placeholder="Алматы"
            onChange={(event) => onChange({ ...form, region: event.target.value })}
          />
        </label>
      </div>

      <div className="orgs-form-actions">
        <button className="orgs-ghost-btn" type="button" onClick={onCancel}>
          Отмена
        </button>
        <button
          className="orgs-primary-btn"
          type="button"
          onClick={onSubmit}
          disabled={isDisabled}
        >
          {isPending ? "Сохраняем..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
