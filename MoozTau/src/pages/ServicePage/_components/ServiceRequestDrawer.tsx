import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ServiceMaster, ServiceRequest, ServiceRequestStatus, ServiceRequestUpdate } from "@/types";
import { SERVICE_STATUS_LABELS, SERVICE_STATUS_OPTIONS, SERVICE_ALLOWED_NEXT } from "../constants";

interface Props {
  item: ServiceRequest;
  masters: ServiceMaster[];
  isMaster: boolean;
  isManager: boolean;
  isUpdating: boolean;
  onClose: () => void;
  onUpdate: (payload: ServiceRequestUpdate) => void;
}

export function ServiceRequestDrawer({
  item, masters, isMaster, isManager, isUpdating, onClose, onUpdate,
}: Props) {
  const [visit, setVisit] = useState<string>(item.visit_date ? toLocalInputValue(item.visit_date) : "");
  const [resolution, setResolution] = useState<string>(item.resolution_notes ?? "");

  useEffect(() => {
    setVisit(item.visit_date ? toLocalInputValue(item.visit_date) : "");
    setResolution(item.resolution_notes ?? "");
  }, [item.id, item.visit_date, item.resolution_notes]);

  function setStatus(s: ServiceRequestStatus) {
    onUpdate({ status: s });
  }
  function setMaster(id: number | null) {
    onUpdate({ assigned_master_id: id });
  }
  function saveVisit() {
    onUpdate({ visit_date: visit ? new Date(visit).toISOString() : null });
  }
  function saveResolution() {
    onUpdate({ resolution_notes: resolution || null });
  }

  const node = (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 100%)",
          background: "var(--bg-base)",
          height: "100%",
          overflowY: "auto",
          boxShadow: "-12px 0 32px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 18px",
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-light)",
            position: "sticky", top: 0, zIndex: 5,
          }}
        >
          <div className="row-between" style={{ alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.3 }}>
                {item.ticket_number}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: "var(--text-default)" }}>
                {item.product_name}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "var(--bg-subtle)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-default)",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="stack" style={{ padding: 16, gap: 12 }}>
          {/* Client */}
          <Card title="Клиент">
            <Row label="Имя" value={item.client_name} />
            <Row label="Телефон" value={
              <a href={`tel:${item.client_phone}`} style={{ color: "var(--text-brand)", textDecoration: "none" }}>
                {item.client_phone}
              </a>
            } />
            {item.serial_number && <Row label="SN" value={item.serial_number} />}
            {item.organization_name && <Row label="Организация" value={item.organization_name} />}
            {item.warranty_case && (
              <div
                style={{
                  marginTop: 8,
                  padding: "6px 10px", borderRadius: 999,
                  background: "#dcfce7", color: "#15803d",
                  fontSize: 12, fontWeight: 700,
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >🛡 Гарантийный случай</div>
            )}
          </Card>

          {/* Issue */}
          <Card title="Проблема">
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-default)", lineHeight: 1.5 }}>
              {item.issue}
            </p>
          </Card>

          {/* Master assignment */}
          {(isManager || isMaster) && (
            <Card title="Мастер">
              {isManager ? (
                <select
                  className="input"
                  value={item.assigned_master_id ?? ""}
                  onChange={(e) => setMaster(e.target.value ? Number(e.target.value) : null)}
                  disabled={isUpdating}
                  style={{ width: "100%" }}
                >
                  <option value="">— не назначен —</option>
                  {masters.map((m) => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              ) : item.assigned_master_id ? (
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-default)", fontWeight: 600 }}>
                  🧰 {item.assigned_master_name ?? "Назначен"}
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                  Мастер ещё не назначен.
                </p>
              )}
            </Card>
          )}

          {/* Visit date — master/manager only */}
          {(isMaster || isManager) && (
            <Card title="Дата визита">
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text-muted)" }}>
                {isMaster
                  ? "Согласуйте с клиентом и поставьте дату визита."
                  : "Дату обычно выставляет мастер. Менеджер может поправить."}
              </p>
              <div className="row gap-2">
                <input
                  className="input"
                  type="datetime-local"
                  value={visit}
                  onChange={(e) => setVisit(e.target.value)}
                  disabled={isUpdating}
                  style={{ flex: 1, minWidth: 200 }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={saveVisit}
                  disabled={isUpdating || visit === (item.visit_date ? toLocalInputValue(item.visit_date) : "")}
                >
                  Сохранить
                </button>
              </div>
            </Card>
          )}

          {/* Status */}
          <Card title="Статус">
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {SERVICE_STATUS_OPTIONS.map((s) => {
                const active = item.status === s;
                const allowed = active || SERVICE_ALLOWED_NEXT[item.status]?.includes(s);
                if (!allowed) return null;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    disabled={isUpdating || active}
                    style={{
                      background: active ? "var(--text-default)" : "var(--bg-surface)",
                      color: active ? "var(--bg-surface)" : "var(--text-default)",
                      border: active ? "none" : "1px solid var(--border)",
                      padding: "6px 12px",
                      borderRadius: 999,
                      fontSize: 12, fontWeight: 700,
                      cursor: active ? "default" : "pointer",
                      opacity: isUpdating ? 0.6 : 1,
                    }}
                  >
                    {SERVICE_STATUS_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Resolution notes */}
          {(isMaster || isManager) && (
            <Card title="Решение мастера">
              <textarea
                className="input"
                style={{ width: "100%", minHeight: 110 }}
                placeholder="Что было сделано? Запчасти, рекомендации, итог."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                disabled={isUpdating}
              />
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={saveResolution}
                disabled={isUpdating || resolution === (item.resolution_notes ?? "")}
              >
                Сохранить решение
              </button>
            </Card>
          )}

          <Card title="Метаданные">
            <Row label="Создал" value={item.created_by_name || `#${item.created_by_id}`} />
            <Row label="Создана" value={new Date(item.created_at).toLocaleString("ru-RU")} />
            <Row label="Обновлена" value={new Date(item.updated_at).toLocaleString("ru-RU")} />
            {item.order_id && <Row label="Заказ" value={`#${item.order_id}`} />}
          </Card>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="card"
      style={{
        padding: 14,
      }}
    >
      <p style={{
        margin: "0 0 10px", fontSize: 11, fontWeight: 700,
        letterSpacing: 0.3, textTransform: "uppercase",
        color: "var(--text-muted)",
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        padding: "4px 0",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span style={{ color: "var(--text-default)", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
