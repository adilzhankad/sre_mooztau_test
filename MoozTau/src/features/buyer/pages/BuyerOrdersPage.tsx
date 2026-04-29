import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBuyerOrders } from "@/hooks/useBuyer";
import { deriveStage, needsBuyerAction, type BuyerStage } from "../lib/stage";
import { OrderCard } from "../components/OrderCard";

type Tab = "action" | "active" | "archive";

const ACTIVE: BuyerStage[] = ["created", "matching", "master_selected", "approved", "in_progress"];
const ARCHIVE: BuyerStage[] = ["completed", "closed", "cancelled"];

export function BuyerOrdersPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch, isFetching } = useBuyerOrders();
  const orders = data ?? [];
  const [tab, setTab] = useState<Tab>("action");
  const [q, setQ] = useState("");

  const withStage = useMemo(
    () => orders.map((order) => ({ order, stage: deriveStage(order) })),
    [orders],
  );

  const counts = useMemo(() => {
    const c = { action: 0, active: 0, archive: 0 };
    withStage.forEach(({ stage }) => {
      if (needsBuyerAction(stage)) c.action += 1;
      else if (ACTIVE.includes(stage)) c.active += 1;
      else if (ARCHIVE.includes(stage)) c.archive += 1;
    });
    return c;
  }, [withStage]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return withStage
      .filter(({ stage }) =>
        tab === "action"
          ? needsBuyerAction(stage)
          : tab === "active"
            ? ACTIVE.includes(stage)
            : ARCHIVE.includes(stage),
      )
      .filter(({ order }) => {
        if (!needle) return true;
        const hay = [
          order.order_number,
          order.delivery_address || "",
          ...(order.items || []).map((i) => `${i.model} ${i.category}`),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      })
      .map(({ order }) => order);
  }, [withStage, tab, q]);

  return (
    <div className="buyer-page">
      <div style={{ display: "grid", gap: 16 }}>
        <section className="buyer-hero">
          <div className="buyer-hero-glow" />

          <div style={{ position: "relative", display: "grid", gap: 16 }}>
            <div>
              <p className="buyer-hero-eyebrow">Заказы</p>
              <h1 className="buyer-hero-title">Мои заказы</h1>
              <p className="buyer-hero-desc">
                Статусы, оплата и документы — всё по вашим заказам в одном месте.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              <HeroMetric label="Требует действий" value={String(counts.action)} note="Ждут подтверждения" />
              <HeroMetric label="Активные" value={String(counts.active)} note="В работе и подборе" />
              <HeroMetric label="Архив" value={String(counts.archive)} note="Завершённые" />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" onClick={() => refetch()} className="buyer-btn buyer-btn-secondary">
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 20 20" width={18} height={18} fill="currentColor">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10 3a7 7 0 016.32 4H14a1 1 0 100 2h5a1 1 0 001-1V3a1 1 0 10-2 0v1.35A9 9 0 103 10h2a7 7 0 015-7z"
                    />
                  </svg>
                </span>
                {isFetching ? "Обновляем…" : "Обновить"}
              </button>
              <button type="button" onClick={() => navigate("/buyer/service")} className="buyer-btn buyer-btn-soft">
                Сервис и гарантия
              </button>
            </div>
          </div>
        </section>

        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
          <TabBtn active={tab === "action"} badge={counts.action} tone="warning" onClick={() => setTab("action")}>
            Требует действий
          </TabBtn>
          <TabBtn active={tab === "active"} badge={counts.active} onClick={() => setTab("active")}>
            Активные
          </TabBtn>
          <TabBtn active={tab === "archive"} badge={counts.archive} onClick={() => setTab("archive")}>
            Архив
          </TabBtn>
        </div>

        <label
          className="buyer-surface"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
          }}
        >
          <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} className="buyer-muted">
            <circle cx={11} cy={11} r={7} />
            <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Номер или товар"
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 14,
              color: "var(--buyer-text)",
            }}
          />
        </label>

        {error && (
          <div
            className="buyer-surface"
            style={{
              padding: 14,
              background: "var(--buyer-danger-soft)",
              color: "var(--buyer-danger)",
              border: "1px solid rgba(181, 71, 8, 0.2)",
            }}
          >
            Не удалось загрузить заказы. Попробуйте обновить страницу.
          </div>
        )}

        {isLoading && orders.length === 0 ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <Empty tab={tab} searching={Boolean(q.trim())} />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} onOpen={(id) => navigate(`/buyer/orders/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  badge,
  tone = "neutral",
  onClick,
  children,
}: {
  active: boolean;
  badge: number;
  tone?: "neutral" | "warning";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const bg = active ? "var(--buyer-accent-soft)" : "var(--buyer-surface)";
  const fg = active ? "var(--buyer-accent-deep)" : "var(--buyer-text)";
  const border = active ? "rgba(166, 202, 57, 0.26)" : "rgba(26, 34, 45, 0.08)";
  const badgeBg =
    active ? "rgba(255, 255, 255, 0.26)"
    : tone === "warning" ? "var(--buyer-warning-soft)"
    : "var(--buyer-surface-muted)";
  const badgeFg =
    active ? "var(--buyer-hero-text)"
    : tone === "warning" ? "var(--buyer-warning)"
    : "var(--buyer-muted)";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${border}`,
        background: bg,
        color: fg,
        minHeight: 40,
        padding: "0 14px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontSize: 13,
        fontWeight: 900,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
      {badge > 0 && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 22,
            minWidth: 22,
            padding: "0 8px",
            borderRadius: 999,
            background: badgeBg,
            color: badgeFg,
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function HeroMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: 14,
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8, color: "rgba(255, 255, 255, 0.72)" }}>
        {label}
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 900, letterSpacing: -0.7 }}>{value}</p>
      <p style={{ margin: "3px 0 0", fontSize: 12, lineHeight: 1.45, color: "rgba(255, 255, 255, 0.72)" }}>{note}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="buyer-surface"
          style={{
            height: 120,
            background: "var(--buyer-surface-alt)",
          }}
        />
      ))}
    </div>
  );
}

function Empty({ tab, searching }: { tab: Tab; searching: boolean }) {
  const msg = searching
    ? "Ничего не найдено"
    : tab === "action"
      ? "Все заказы подтверждены — действий не требуется"
      : tab === "active"
        ? "Нет активных заказов"
        : "Архив пуст";

  return (
    <div className="buyer-surface" style={{ padding: "42px 24px", textAlign: "center" }}>
      <p className="buyer-muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
        {msg}
      </p>
    </div>
  );
}

