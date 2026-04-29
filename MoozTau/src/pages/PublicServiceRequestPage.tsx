import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreatePublicServiceRequest } from "@/hooks/useService";
import { useBuyerOrders } from "@/hooks/useBuyer";
import { formatPhone, rawPhone } from "@/lib/phone-mask";
import { useAuthStore } from "@/stores/auth-store";
import type { PublicServiceRequestCreate } from "@/types";

export function PublicServiceRequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = useAuthStore((state) => state.role);
  const fullName = useAuthStore((state) => state.fullName);
  const isClientAuthenticated = role === "BUYER" || role === "USER";

  // Заказы покупателя — нужны для выбора товара из списка
  const { data: buyerOrders } = useBuyerOrders();

  const initialState = useMemo<PublicServiceRequestCreate>(
    () => ({
      client_name: isClientAuthenticated ? fullName ?? "" : "",
      client_phone: "+7",
      email: "",
      order_id: searchParams.get("orderId") ? Number(searchParams.get("orderId")) : null,
      product_name: searchParams.get("product") ?? "",
      serial_number: "",
      issue: "",
      warranty_case: false,
      visit_date: null,
    }),
    [searchParams, isClientAuthenticated, fullName],
  );

  const [form, setForm] = useState<PublicServiceRequestCreate>(initialState);
  const mutation = useCreatePublicServiceRequest();

  // Когда выбрали заказ и в нём один товар — автоподставляем
  useEffect(() => {
    if (!isClientAuthenticated || !form.order_id || !buyerOrders) return;
    const order = buyerOrders.find((o) => o.id === form.order_id);
    if (order && order.items.length === 1 && !form.product_name) {
      setForm((prev) => ({ ...prev, product_name: order.items[0].model }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.order_id, buyerOrders]);

  const selectedOrder = useMemo(
    () => buyerOrders?.find((o) => o.id === form.order_id),
    [buyerOrders, form.order_id],
  );

  async function handleSubmit() {
    await mutation.mutateAsync({
      ...form,
      client_phone: rawPhone(form.client_phone),
    });
  }

  const result = mutation.data;

  return (
    <div style={{ minHeight: "100dvh", background: "#FAFAF9" }}>
      {/* Header */}
      <div
        style={{
          padding: "calc(var(--safe-top, 0px) + 12px) 20px 14px",
          background: "#fff",
          borderBottom: "1px solid #ECECEA",
          position: "sticky", top: 0, zIndex: 30,
        }}
      >
        <div className="row-between" style={{ alignItems: "center" }}>
          <button
            onClick={() => navigate(isClientAuthenticated ? "/buyer/service" : "/login")}
            aria-label="Назад"
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#F3F4F6", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#111",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div style={{ textAlign: "center", flex: 1 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF", fontWeight: 600, letterSpacing: 0.3 }}>
              СЕРВИС
            </p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111" }}>
              Новая заявка
            </p>
          </div>
          <div style={{ width: 36 }} />
        </div>
      </div>

      <div className="stack" style={{ padding: "12px 16px 24px", gap: 10, maxWidth: 720, margin: "0 auto" }}>
        {mutation.isSuccess && result ? (
          <div
            style={{
              borderRadius: 14,
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.25)",
              padding: 16,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "#22C55E", color: "#fff",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, marginBottom: 10,
            }}>✓</div>
            <h3 style={{ margin: 0, fontSize: 18, color: "#15803d" }}>Заявка создана</h3>
            <p className="text-sm text-default" style={{ margin: "8px 0 0" }}>
              Номер заявки: <strong>{result.request.ticket_number}</strong>
            </p>
            <p className="text-sm text-secondary" style={{ margin: "4px 0 0" }}>
              Вход в кабинет: {result.login_phone}
            </p>
            {result.account_created && result.temporary_password ? (
              <p className="text-sm text-default" style={{ margin: "8px 0 0" }}>
                Временный пароль: <strong>{result.temporary_password}</strong>
              </p>
            ) : (
              <p className="text-xs text-secondary" style={{ margin: "8px 0 0" }}>
                Аккаунт уже существовал. Используйте свой пароль.
              </p>
            )}
            <div className="row" style={{ gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate(isClientAuthenticated ? "/buyer/service" : "/login")}
              >
                {isClientAuthenticated ? "Мои заявки" : "Войти в кабинет"}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  mutation.reset();
                  setForm(initialState);
                }}
              >
                Ещё одна заявка
              </button>
            </div>
          </div>
        ) : (
          <>
            {mutation.isError && (
              <div style={{
                padding: 12, borderRadius: 10,
                background: "#FEE2E2", color: "#B91C1C", fontSize: 14,
              }}>
                {mutation.error instanceof Error ? mutation.error.message : "Не удалось создать заявку"}
              </div>
            )}

            {/* Контактные данные */}
            <div className="card">
              <p className="text-xs font-semibold text-secondary" style={{ margin: "0 0 10px" }}>
                Контакты
              </p>
              <div className="stack" style={{ gap: 10 }}>
                <Field label="Имя" required>
                  <input
                    className="input"
                    placeholder="Как к вам обращаться"
                    value={form.client_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, client_name: e.target.value }))}
                  />
                </Field>
                <Field label="Телефон" required>
                  <input
                    className="input"
                    placeholder="+7 (700) 123-45-67"
                    value={form.client_phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, client_phone: formatPhone(e.target.value) }))}
                  />
                </Field>
                {!isClientAuthenticated && (
                  <Field label="Email">
                    <input
                      className="input"
                      placeholder="чтобы получать обновления"
                      value={form.email ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </Field>
                )}
              </div>
            </div>

            {/* Что и из какого заказа */}
            <div className="card">
              <p className="text-xs font-semibold text-secondary" style={{ margin: "0 0 10px" }}>
                По какому товару
              </p>

              {isClientAuthenticated && buyerOrders && buyerOrders.length > 0 ? (
                <>
                  <Field label="Заказ">
                    <select
                      className="input"
                      value={form.order_id ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          order_id: e.target.value ? Number(e.target.value) : null,
                          product_name: "",
                        }))
                      }
                    >
                      <option value="">— не привязывать к заказу —</option>
                      {buyerOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.order_number} · {o.items[0]?.model ?? "—"}
                          {o.items.length > 1 ? ` +${o.items.length - 1}` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {selectedOrder && selectedOrder.items.length > 0 && (
                    <Field label="Товар из заказа" required>
                      <div className="stack" style={{ gap: 6 }}>
                        {selectedOrder.items.map((it, idx) => {
                          const checked = form.product_name === it.model;
                          return (
                            <label
                              key={idx}
                              style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: 10,
                                border: `1.5px solid ${checked ? "#3B82F6" : "var(--border-light)"}`,
                                background: checked ? "rgba(59,130,246,0.06)" : "var(--bg-base)",
                                borderRadius: 10,
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="radio"
                                name="orderItem"
                                checked={checked}
                                onChange={() =>
                                  setForm((prev) => ({ ...prev, product_name: it.model }))
                                }
                              />
                              {((it as any).image_url) ? (
                                <img
                                  src={(it as any).image_url}
                                  alt={it.model}
                                  style={{
                                    width: 40, height: 40, objectFit: "cover",
                                    borderRadius: 8, border: "1px solid var(--border-light)",
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: 40, height: 40, borderRadius: 8,
                                  background: "var(--bg-subtle)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 18,
                                }}>📦</div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
                                  {it.model}
                                </p>
                                <p className="text-xs text-secondary" style={{ margin: 0 }}>
                                  {it.color || "—"} · {it.quantity} {it.unit}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </Field>
                  )}

                  {!selectedOrder && (
                    <Field label="Название товара" required>
                      <input
                        className="input"
                        placeholder="Например, Кулер MoozTau"
                        value={form.product_name}
                        onChange={(e) => setForm((prev) => ({ ...prev, product_name: e.target.value }))}
                      />
                    </Field>
                  )}
                </>
              ) : (
                <Field label="Название товара" required>
                  <input
                    className="input"
                    placeholder="Например, Кулер MoozTau"
                    value={form.product_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, product_name: e.target.value }))}
                  />
                </Field>
              )}

              <Field label="Серийный номер (если есть)">
                <input
                  className="input"
                  placeholder="на корпусе, обычно сзади"
                  value={form.serial_number ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, serial_number: e.target.value || null }))}
                />
              </Field>

              <label
                className="row"
                style={{
                  alignItems: "center", gap: 10,
                  padding: 10, marginTop: 10,
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.warranty_case ?? false}
                  onChange={(e) => setForm((prev) => ({ ...prev, warranty_case: e.target.checked }))}
                />
                <div>
                  <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
                    🛡 Гарантийный случай
                  </p>
                  <p className="text-xs text-secondary" style={{ margin: 0 }}>
                    Поломка в пределах гарантийного срока
                  </p>
                </div>
              </label>
            </div>

            {/* Описание проблемы */}
            <div className="card">
              <p className="text-xs font-semibold text-secondary" style={{ margin: "0 0 10px" }}>
                Опишите проблему
              </p>
              <textarea
                className="input"
                placeholder="Что случилось? Когда заметили? Какие звуки/запахи/симптомы?"
                style={{ minHeight: 110, width: "100%" }}
                value={form.issue}
                onChange={(e) => setForm((prev) => ({ ...prev, issue: e.target.value }))}
              />
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18 }}>📅</span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111" }}>
                    Дату визита назначит мастер
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#92400E" }}>
                    После принятия заявки мастер свяжется с вами и согласует
                    удобное время.
                  </p>
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary btn-xl"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={
                mutation.isPending ||
                !form.client_name ||
                !form.client_phone ||
                !form.product_name ||
                !form.issue
              }
              onClick={handleSubmit}
            >
              {mutation.isPending ? "Отправляем…" : "Отправить заявку"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="stack" style={{ gap: 4, marginTop: 6 }}>
      <label className="text-xs font-semibold text-secondary">
        {label}{required && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
      {children}
    </div>
  );
}
