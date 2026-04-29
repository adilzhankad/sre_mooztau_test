import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQCChecklist, useSaveQCChecklist, usePassQC, useRejectQC } from "@/hooks/useQC";
import { useFactoryOrder } from "@/hooks/useFactory";
import type { QCChecklistCreate, RejectionCategory } from "@/types";

const REJECTION_CATEGORIES: { value: RejectionCategory; label: string }[] = [
  { value: "appearance", label: "Внешний вид" },
  { value: "completeness", label: "Комплектность" },
  { value: "dimensions", label: "Размеры" },
  { value: "color", label: "Цвет" },
  { value: "packaging", label: "Упаковка" },
  { value: "unit", label: "Агрегат" },
  { value: "other", label: "Другое" },
];

type RadioField = "appearance" | "completeness" | "dimensions_match" | "color_match" | "packaging";

const RADIO_FIELDS: { key: RadioField; label: string; options: { value: string; label: string }[] }[] = [
  { key: "appearance", label: "Внешний вид (царапины, вмятины)", options: [{ value: "ok", label: "OK" }, { value: "defect", label: "Дефект" }] },
  { key: "completeness", label: "Комплектность (все компоненты)", options: [{ value: "ok", label: "OK" }, { value: "incomplete", label: "Неполная" }] },
  { key: "dimensions_match", label: "Размеры соответствуют заказу", options: [{ value: "ok", label: "OK" }, { value: "mismatch", label: "Расхождение" }] },
  { key: "color_match", label: "Цвет соответствует заказу", options: [{ value: "ok", label: "OK" }, { value: "mismatch", label: "Расхождение" }] },
  { key: "packaging", label: "Упаковка", options: [{ value: "ok", label: "OK" }, { value: "damaged", label: "Повреждена" }] },
];

export function QCChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const navigate = useNavigate();

  const { data: order } = useFactoryOrder(orderId);
  const { data: existing } = useQCChecklist(orderId);
  const saveMutation = useSaveQCChecklist(orderId);
  const passMutation = usePassQC(orderId);
  const rejectMutation = useRejectQC(orderId);

  const [form, setForm] = useState<QCChecklistCreate>({
    appearance: existing?.appearance ?? "ok",
    completeness: existing?.completeness ?? "ok",
    dimensions_match: existing?.dimensions_match ?? "ok",
    color_match: existing?.color_match ?? "ok",
    serial_number: existing?.serial_number ?? "",
    packaging: existing?.packaging ?? "ok",
    unit_test: existing?.unit_test ?? null,
    photo_urls: existing?.photo_urls ?? "",
    notes: existing?.notes ?? "",
  });

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectCategory, setRejectCategory] = useState<RejectionCategory>("appearance");

  function setField<K extends keyof QCChecklistCreate>(key: K, value: QCChecklistCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    await saveMutation.mutateAsync(form);
  }

  async function handlePass() {
    if (!form.serial_number.trim()) {
      alert("Укажите серийный номер");
      return;
    }
    if (!form.photo_urls.trim()) {
      alert("Добавьте хотя бы одно фото");
      return;
    }
    await saveMutation.mutateAsync(form);
    await passMutation.mutateAsync();
    navigate("/qc");
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert("Укажите причину возврата");
      return;
    }
    await saveMutation.mutateAsync(form);
    await rejectMutation.mutateAsync({
      rejection_reason: rejectReason,
      rejection_category: rejectCategory,
    });
    navigate("/qc");
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate("/qc")}>
          &larr; Назад
        </button>
        <h2 className="text-lg font-bold text-default" style={{ margin: 0 }}>
          QC Проверка {order ? `— ${order.order_number}` : ""}
        </h2>
      </div>

      {/* Order info */}
      {order && (
        <div className="card" style={{ margin: "12px 16px 0" }}>
          <p className="text-sm font-bold text-default" style={{ margin: "0 0 6px" }}>
            Клиент: {order.client_name}
          </p>
          {order.items.map((item, i) => (
            <p key={i} className="text-xs text-secondary" style={{ margin: "2px 0" }}>
              {item.model} — {item.color}, {item.quantity} {item.unit}
              {item.height && item.width ? ` (${item.height}x${item.width})` : ""}
            </p>
          ))}
        </div>
      )}

      {/* Checklist form */}
      <div className="card stack" style={{ margin: "12px 16px", gap: 14 }}>
        {RADIO_FIELDS.map((field) => (
          <div key={field.key}>
            <p className="text-xs font-semibold text-default" style={{ margin: "0 0 6px" }}>
              {field.label} *
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {field.options.map((opt) => (
                <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name={field.key}
                    checked={form[field.key] === opt.value}
                    onChange={() => setField(field.key, opt.value as any)}
                  />
                  <span className="text-xs text-default">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Serial number */}
        <div>
          <p className="text-xs font-semibold text-default" style={{ margin: "0 0 6px" }}>
            Маркировка и серийный номер *
          </p>
          <input
            className="input"
            placeholder="SN-2026-XXXXX"
            value={form.serial_number}
            onChange={(e) => setField("serial_number", e.target.value)}
          />
        </div>

        {/* Unit test */}
        <div>
          <p className="text-xs font-semibold text-default" style={{ margin: "0 0 6px" }}>
            Тест работы агрегата
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { value: "ok", label: "OK" },
              { value: "not_working", label: "Не работает" },
              { value: "not_applicable", label: "Н/П" },
            ].map((opt) => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="unit_test"
                  checked={form.unit_test === opt.value}
                  onChange={() => setField("unit_test", opt.value as any)}
                />
                <span className="text-xs text-default">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div>
          <p className="text-xs font-semibold text-default" style={{ margin: "0 0 6px" }}>
            Фото готовой продукции * (URL через запятую)
          </p>
          <input
            className="input"
            placeholder="/media/qc/photo1.jpg,/media/qc/photo2.jpg"
            value={form.photo_urls}
            onChange={(e) => setField("photo_urls", e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-semibold text-default" style={{ margin: "0 0 6px" }}>
            Примечания
          </p>
          <textarea
            className="input"
            rows={3}
            placeholder="Комментарии..."
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: "0 16px 24px", display: "flex", gap: 10 }}>
        <button
          className="btn btn-secondary"
          style={{ flex: 1 }}
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          Сохранить
        </button>
        <button
          className="btn"
          style={{
            flex: 1,
            background: "#10B981",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={handlePass}
          disabled={passMutation.isPending}
        >
          QC Пройден
        </button>
        <button
          className="btn"
          style={{
            flex: 1,
            background: "#EF4444",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => setShowRejectModal(true)}
          disabled={rejectMutation.isPending}
        >
          Вернуть
        </button>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 16,
          }}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="card stack"
            style={{ maxWidth: 420, width: "100%", gap: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-default" style={{ margin: 0 }}>
              Вернуть на доработку
            </h3>

            <div>
              <p className="text-xs font-semibold text-default" style={{ margin: "0 0 6px" }}>
                Категория брака *
              </p>
              <select
                className="input"
                value={rejectCategory}
                onChange={(e) => setRejectCategory(e.target.value as RejectionCategory)}
              >
                {REJECTION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-default" style={{ margin: "0 0 6px" }}>
                Причина возврата *
              </p>
              <textarea
                className="input"
                rows={3}
                placeholder="Опишите причину..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowRejectModal(false)}
              >
                Отмена
              </button>
              <button
                className="btn btn-sm"
                style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer" }}
                onClick={handleReject}
                disabled={rejectMutation.isPending}
              >
                Вернуть на доработку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
