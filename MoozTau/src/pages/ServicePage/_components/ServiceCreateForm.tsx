import type { ServiceMaster, ServiceRequestCreate } from "@/types";

interface ServiceCreateFormProps {
  value: ServiceRequestCreate;
  masters: ServiceMaster[];
  isPending: boolean;
  onChange: (value: ServiceRequestCreate) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function ServiceCreateForm({
  value,
  masters,
  isPending,
  onChange,
  onSubmit,
  onClose,
}: ServiceCreateFormProps) {
  const valid =
    !!value.client_name &&
    !!value.client_phone &&
    !!value.product_name &&
    !!value.issue;

  return (
    <section className="card" style={{ padding: 16 }}>
      <div className="row-between" style={{ marginBottom: 12, alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase" }}>
            Менеджер · ручное создание
          </p>
          <h3 style={{ margin: "2px 0 0", fontSize: 18 }}>Новая сервисная заявка</h3>
          <p className="text-xs text-secondary" style={{ margin: "4px 0 0" }}>
            Дату визита назначит мастер после согласования с клиентом.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>
          Закрыть
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        <Field label="Клиент" required>
          <input
            className="input"
            placeholder="ФИО"
            value={value.client_name}
            onChange={(e) => onChange({ ...value, client_name: e.target.value })}
          />
        </Field>
        <Field label="Телефон" required>
          <input
            className="input"
            placeholder="+7 (...) ... .. .."
            value={value.client_phone}
            onChange={(e) => onChange({ ...value, client_phone: e.target.value })}
          />
        </Field>
        <Field label="Товар" required>
          <input
            className="input"
            placeholder="Например, Кулер MoozTau"
            value={value.product_name}
            onChange={(e) => onChange({ ...value, product_name: e.target.value })}
          />
        </Field>
        <Field label="Серийный номер">
          <input
            className="input"
            placeholder="SN на корпусе"
            value={value.serial_number ?? ""}
            onChange={(e) => onChange({ ...value, serial_number: e.target.value || null })}
          />
        </Field>
        <Field label="ID заказа (опционально)">
          <input
            className="input"
            type="number"
            placeholder="например, 123"
            value={value.order_id ?? ""}
            onChange={(e) => onChange({ ...value, order_id: e.target.value ? Number(e.target.value) : null })}
          />
        </Field>
        <Field label="Назначить мастера (опционально)">
          <select
            className="input"
            value={value.assigned_master_id ?? ""}
            onChange={(e) => onChange({ ...value, assigned_master_id: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">— оставить без мастера —</option>
            {masters.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </select>
        </Field>
        <label
          className="row"
          style={{
            alignItems: "center", gap: 10,
            padding: "10px 12px",
            background: "var(--bg-base)",
            border: "1px solid var(--border-light)",
            borderRadius: 10,
            cursor: "pointer",
            gridColumn: "1 / -1",
          }}
        >
          <input
            type="checkbox"
            checked={value.warranty_case ?? false}
            onChange={(e) => onChange({ ...value, warranty_case: e.target.checked })}
          />
          <span className="text-sm font-semibold text-default">🛡 Гарантийный случай</span>
        </label>
        <Field label="Описание проблемы" required>
          <textarea
            className="input"
            placeholder="Что случилось, симптомы, жалобы клиента"
            style={{ minHeight: 110, width: "100%" }}
            value={value.issue}
            onChange={(e) => onChange({ ...value, issue: e.target.value })}
          />
        </Field>
      </div>

      <div className="row" style={{ justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>
          Отмена
        </button>
        <button
          className="btn btn-primary btn-md"
          onClick={onSubmit}
          disabled={isPending || !valid}
        >
          {isPending ? "Создаём…" : "Создать заявку"}
        </button>
      </div>
    </section>
  );
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="stack"
      style={{ gap: 4, gridColumn: label === "Описание проблемы" ? "1 / -1" : undefined }}
    >
      <label className="text-xs font-semibold text-secondary">
        {label}{required && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
      {children}
    </div>
  );
}
