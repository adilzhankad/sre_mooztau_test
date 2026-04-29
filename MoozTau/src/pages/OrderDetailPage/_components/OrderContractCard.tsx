import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  generateContract,
  uploadContractScan,
  downloadContract,
  downloadContractScan,
  notifyClientContractReady,
} from "@/api/orders";
import { QUERY_KEYS } from "@/constants";
import { useAuthStore } from "@/stores/auth-store";
import { useUpdateOrder } from "@/hooks/useOrders";
import type { Order, OrderUpdate } from "@/types";

type ContractStatus = "missing" | "created" | "scanned" | "signed";

interface Props {
  order: Order;
  orderId: number;
  clientPhone: string;
  hasContract: boolean;
  contractStatus: ContractStatus;
  scannedAt?: string | null;
  signedAt?: string | null;
  signedIp?: string | null;
  signedUserAgent?: string | null;
  autoOpenVerify?: boolean;
}

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.heic";
const MAX_SIZE_MB = 25;

function maskPhone(phone: string) {
  if (!phone || phone.length < 5) return phone;
  return phone.slice(0, -4).replace(/./g, "*") + phone.slice(-4);
}

function formatDateTime(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function OrderContractCard({
  order,
  orderId,
  clientPhone,
  hasContract,
  contractStatus,
  scannedAt,
  signedAt,
  signedIp,
  signedUserAgent,
  autoOpenVerify = false,
}: Props) {
  const role = useAuthStore((s) => s.role);
  const isManager =
    role === "SUPER_ADMIN" || role === "DEALER_ADMIN" || role === "DEALER_MANAGER";

  const initialStatus: ContractStatus =
    contractStatus ?? (hasContract ? "created" : "missing");

  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateOrder = useUpdateOrder(orderId);

  const [status, setStatus] = useState<ContractStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifySaving, setVerifySaving] = useState(false);

  useEffect(() => {
    setStatus(contractStatus ?? (hasContract ? "created" : "missing"));
  }, [contractStatus, hasContract]);

  // Авто-открываем верификатор, если пришли с CreateOrderPage с флагом
  useEffect(() => {
    if (autoOpenVerify && initialStatus === "missing" && isManager) {
      setVerifyOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenVerify, initialStatus, isManager]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const refreshOrder = () =>
    qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders, orderId] });

  async function handleCreate(patch?: OrderUpdate) {
    setLoading(true);
    setError(null);
    try {
      if (patch && Object.keys(patch).length > 0) {
        setVerifySaving(true);
        await updateOrder.mutateAsync(patch);
      }
      await generateContract(orderId);
      setStatus("created");
      setVerifyOpen(false);
      showToast("Договор сгенерирован");
      refreshOrder();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Не удалось сгенерировать договор");
    } finally {
      setLoading(false);
      setVerifySaving(false);
    }
  }

  async function handleDownloadDoc() {
    setLoading(true);
    try {
      await downloadContract(orderId);
    } catch {
      showToast("Не удалось скачать договор");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadScan() {
    setLoading(true);
    try {
      await downloadContractScan(orderId);
    } catch {
      showToast("Не удалось скачать скан");
    } finally {
      setLoading(false);
    }
  }

  async function handleNotifyClient() {
    setLoading(true);
    setError(null);
    try {
      await notifyClientContractReady(orderId);
      showToast("Клиенту отправлено SMS-уведомление");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Не удалось отправить уведомление");
    } finally {
      setLoading(false);
    }
  }

  function handlePickFile() {
    setError(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Файл больше ${MAX_SIZE_MB} МБ`);
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(file.name);
    try {
      const res = await uploadContractScan(orderId, file);
      setStatus((res.contract_status as ContractStatus) || "scanned");
      showToast("Скан загружен");
      refreshOrder();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Не удалось загрузить файл");
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }

  const toastRoot = document.getElementById("toast-root");

  return (
    <div className="card">
      {/* ── Header ── */}
      <div className="row-between">
        <div className="row gap-3">
          <div style={{
            width: 34, height: 34, borderRadius: "var(--radius-md)",
            background: "var(--bg-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-secondary)", flexShrink: 0,
          }}>
            <ContractIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-default">Договор</p>
            <p className="text-xs text-secondary">
              {status === "missing" && "Не сгенерирован"}
              {status === "created" && "Сгенерирован — нужен скан с подписью компании"}
              {status === "scanned" && "Скан загружен — ожидает подписи клиента (SMS)"}
              {status === "signed" && "Подписан клиентом"}
            </p>
          </div>
        </div>

        <StatusPill status={status} />
      </div>

      {/* ── Steps ── */}
      <div className="stack" style={{ marginTop: 12, gap: 10 }}>
        {/* Step 1: generate */}
        <Step
          n={1}
          title="Сгенерировать договор"
          done={status !== "missing"}
        >
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            {status === "missing" && isManager && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setVerifyOpen(true)}
                disabled={loading}
              >
                Проверить данные и сгенерировать
              </button>
            )}
            {status !== "missing" && (
              <button className="btn btn-secondary btn-sm" onClick={handleDownloadDoc} disabled={loading}>
                Скачать .docx
              </button>
            )}
          </div>
          {verifyOpen && status === "missing" && (
            <ContractDataVerifier
              order={order}
              busy={loading || verifySaving}
              onCancel={() => setVerifyOpen(false)}
              onConfirm={(patch) => handleCreate(patch)}
            />
          )}
        </Step>

        {/* Step 2: upload scan */}
        {status !== "missing" && (
          <Step
            n={2}
            title="Распечатать → подписать и поставить печать → загрузить скан"
            done={status === "scanned" || status === "signed"}
          >
            {(status === "scanned" || status === "signed") && (
              <p className="text-xs text-secondary" style={{ marginBottom: 6 }}>
                Загружено: {formatDateTime(scannedAt)}
              </p>
            )}
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              {(status === "scanned" || status === "signed") && (
                <button className="btn btn-secondary btn-sm" onClick={handleDownloadScan} disabled={loading}>
                  Скачать скан
                </button>
              )}
              {isManager && status !== "signed" && (
                <button
                  className={status === "created" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                  onClick={handlePickFile}
                  disabled={loading}
                >
                  {status === "scanned" ? "Заменить скан" : "Загрузить скан"}
                </button>
              )}
              {isManager && status === "scanned" && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleNotifyClient}
                  disabled={loading}
                  title="Отправить клиенту SMS, что договор подписан компанией и готов к подписанию"
                >
                  📩 Отправить клиенту
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {uploadProgress && (
              <p className="text-xs text-secondary" style={{ marginTop: 6 }}>
                Загружается: {uploadProgress}
              </p>
            )}
            <p className="text-xs text-tertiary" style={{ marginTop: 6 }}>
              PDF, JPG, PNG, WEBP или HEIC. До {MAX_SIZE_MB} МБ.
            </p>
          </Step>
        )}

        {/* Step 3: client SMS — клиент подписывает САМ из своего кабинета */}
        {(status === "scanned" || status === "signed") && (
          <Step
            n={3}
            title="Подпись клиента по SMS"
            done={status === "signed"}
          >
            {status === "signed" ? (
              <div className="stack gap-1">
                <p className="text-xs text-secondary">
                  Подписано: {formatDateTime(signedAt)}
                </p>
                {signedIp && (
                  <p className="text-xs text-secondary">
                    IP-адрес: <span className="font-semibold text-default">{signedIp}</span>
                  </p>
                )}
                {signedUserAgent && (
                  <p
                    className="text-xs text-tertiary"
                    style={{ wordBreak: "break-word" }}
                    title={signedUserAgent}
                  >
                    {signedUserAgent}
                  </p>
                )}
              </div>
            ) : (
              <div className="stack gap-2">
                <div
                  style={{
                    padding: "9px 12px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span className="text-xs text-secondary">Телефон клиента</span>
                  <span className="text-sm font-semibold text-default">
                    {clientPhone ? maskPhone(clientPhone) : "—"}
                  </span>
                </div>
                <p className="text-xs text-secondary" style={{ margin: 0 }}>
                  Клиент подпишет договор сам из личного кабинета — запросит SMS-код,
                  введёт его и подтвердит. Мы зафиксируем дату, IP-адрес и устройство клиента.
                </p>
              </div>
            )}
          </Step>
        )}

        {error && <p className="text-xs" style={{ color: "var(--error)" }}>{error}</p>}
      </div>

      {/* ── Toast ── */}
      {toast && toastRoot && createPortal(
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "var(--sidebar-bg)", color: "#fff",
          padding: "9px 16px", borderRadius: 999,
          fontSize: 13, fontWeight: 600,
          boxShadow: "var(--shadow-lg)", zIndex: 9999,
        }}>
          {toast}
        </div>,
        toastRoot,
      )}
    </div>
  );
}

/* ── Verification before generating contract ─────────────────────────────── */

interface VerifyField {
  key: keyof OrderUpdate;
  label: string;
  required: boolean;
  validate?: (value: string) => string | null;
  hint?: string;
  placeholder?: string;
}

function ContractDataVerifier({
  order,
  busy,
  onCancel,
  onConfirm,
}: {
  order: Order;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (patch: OrderUpdate) => void;
}) {
  const isCompany = order.client_type === "company";

  const fields: VerifyField[] = useMemo(() => {
    const list: VerifyField[] = [
      {
        key: "client_name",
        label: isCompany ? "Название компании" : "ФИО клиента",
        required: true,
      },
      {
        key: "client_phone",
        label: "Телефон клиента",
        required: true,
        placeholder: "+7XXXXXXXXXX",
        validate: (v) => {
          const digits = v.replace(/\D/g, "");
          if (digits.length < 10) return "Слишком короткий номер";
          if (digits.length > 12) return "Слишком длинный номер";
          return null;
        },
        hint: "Будет использован для SMS-кода подписания",
      },
      {
        key: "client_iin",
        label: isCompany ? "БИН (12 цифр)" : "ИИН (12 цифр)",
        required: true,
        validate: (v) => {
          const digits = v.replace(/\D/g, "");
          if (digits.length !== 12) return "Должно быть ровно 12 цифр";
          return null;
        },
      },
      {
        key: "delivery_address",
        label: "Адрес доставки",
        required: true,
      },
      {
        key: "client_region",
        label: "Регион / город",
        required: false,
      },
    ];
    if (isCompany) {
      list.push(
        { key: "company_director", label: "Директор", required: true },
        { key: "company_legal_address", label: "Юр. адрес", required: false },
        { key: "company_bank_name", label: "Банк", required: false },
        { key: "company_iik", label: "ИИК", required: false },
        { key: "company_bik", label: "БИК", required: false },
      );
    }
    return list;
  }, [isCompany]);

  const initial = useMemo(() => {
    const obj: Record<string, string> = {};
    for (const f of fields) {
      const v = (order as any)[f.key];
      obj[f.key as string] = v == null ? "" : String(v);
    }
    return obj;
  }, [fields, order]);

  const [values, setValues] = useState<Record<string, string>>(initial);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  const errors: Record<string, string | null> = {};
  for (const f of fields) {
    const v = (values[f.key as string] || "").trim();
    if (f.required && !v) {
      errors[f.key as string] = "Заполните поле";
    } else if (v && f.validate) {
      errors[f.key as string] = f.validate(v);
    } else {
      errors[f.key as string] = null;
    }
  }
  const hasErrors = Object.values(errors).some((e) => !!e);

  function handleConfirm() {
    if (hasErrors) return;
    const patch: OrderUpdate = {};
    for (const f of fields) {
      const v = (values[f.key as string] || "").trim();
      const cur = (order as any)[f.key];
      const curStr = cur == null ? "" : String(cur);
      if (v !== curStr) (patch as any)[f.key] = v;
    }
    onConfirm(patch);
  }

  return (
    <div
      style={{
        marginTop: 10,
        padding: 12,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: "var(--bg-surface)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
          Проверьте данные перед генерацией
        </p>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: "2px 8px", borderRadius: 999,
          background: hasErrors ? "#fee2e2" : "#dcfce7",
          color: hasErrors ? "#b91c1c" : "#15803d",
        }}>
          {hasErrors ? "Есть ошибки" : "Готово"}
        </span>
      </div>
      <p className="text-xs text-secondary" style={{ margin: "0 0 10px" }}>
        Эти поля попадут в .docx и в SMS-подписание. Исправьте сейчас — после
        генерации придётся пересоздавать договор.
      </p>

      <div className="stack" style={{ gap: 8 }}>
        {fields.map((f) => {
          const err = errors[f.key as string];
          const value = values[f.key as string] ?? "";
          return (
            <div key={f.key as string} className="stack" style={{ gap: 3 }}>
              <label className="text-xs font-semibold text-secondary">
                {f.label}{f.required && <span style={{ color: "#dc2626" }}> *</span>}
              </label>
              <input
                type="text"
                value={value}
                placeholder={f.placeholder}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [f.key as string]: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${err ? "#dc2626" : "var(--border)"}`,
                  fontSize: 14,
                  background: "var(--bg-base)",
                  color: "var(--text-default)",
                }}
              />
              {err ? (
                <span className="text-xs" style={{ color: "#dc2626" }}>{err}</span>
              ) : f.hint ? (
                <span className="text-xs text-tertiary">{f.hint}</span>
              ) : null}
            </div>
          );
        })}

        <div
          style={{
            display: "flex", justifyContent: "space-between",
            padding: "8px 10px", borderRadius: "var(--radius-md)",
            background: "var(--bg-subtle)",
            marginTop: 4,
          }}
        >
          <span className="text-xs text-secondary">Сумма к договору</span>
          <span className="text-sm font-bold text-default">
            {new Intl.NumberFormat("ru-RU").format(Number(order.final_amount || 0))} ₸
          </span>
        </div>
      </div>

      <div className="row gap-2" style={{ marginTop: 12, justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onCancel}
          disabled={busy}
        >
          Отмена
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleConfirm}
          disabled={busy || hasErrors}
        >
          {busy ? "Сохранение…" : "Всё верно — сгенерировать"}
        </button>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  done,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-light)",
        background: done ? "rgba(34,197,94,0.06)" : "var(--bg-base)",
      }}
    >
      <div className="row" style={{ alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            width: 22, height: 22, borderRadius: "50%",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: done ? "#22c55e" : "var(--border-light)",
            color: done ? "#fff" : "var(--text-secondary)",
            fontWeight: 700, fontSize: 12,
          }}
        >
          {done ? "✓" : n}
        </span>
        <span className="text-sm font-semibold text-default" style={{ flex: 1 }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: ContractStatus }) {
  const map: Record<ContractStatus, { label: string; bg: string; color: string }> = {
    missing:  { label: "Не создан",   bg: "var(--border-light)", color: "var(--text-muted)" },
    created:  { label: "Сгенерирован", bg: "#dbeafe",           color: "#1d4ed8" },
    scanned:  { label: "Скан загружен", bg: "#fef3c7",           color: "#a16207" },
    signed:   { label: "Подписан",    bg: "#dcfce7",           color: "#15803d" },
  };
  const cfg = map[status] ?? map.missing;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 700,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

function ContractIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
