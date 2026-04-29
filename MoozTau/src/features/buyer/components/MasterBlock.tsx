import type { BuyerOrder } from "@/types";
import { fullDate } from "../lib/format";

interface Props {
  order: BuyerOrder;
}

export function MasterBlock({ order }: Props) {
  const isMatching = order.delivery_mode === "matching";
  const masterAssigned = isMatching && !!order.master_id;

  // Standard delivery: show manager card if available
  if (!isMatching) {
    const hasManager = Boolean(order.manager_name || order.manager_phone);
    if (!hasManager) return null;
    const letter = (order.manager_name || "М").charAt(0).toUpperCase();
    return (
      <ContactCard
        title="Ваш менеджер"
        name={order.manager_name || "Менеджер MoozTau"}
        phone={order.manager_phone ?? null}
        letter={letter}
      />
    );
  }

  // Matching mode: show master if assigned, else show "matching in progress" pill
  if (masterAssigned) {
    const letter = (order.master_name || "М").charAt(0).toUpperCase();
    return (
      <ContactCard
        title="Ваш мастер"
        name={order.master_name || "Мастер MoozTau"}
        phone={order.master_phone ?? null}
        letter={letter}
        subtitle={
          order.master_selected_at
            ? `Назначен ${fullDate(order.master_selected_at)}`
            : undefined
        }
      />
    );
  }

  return (
    <section className="buyer-surface" style={{ padding: 16 }}>
      <h2 className="buyer-text" style={{ margin: 0, fontSize: 14, fontWeight: 900 }}>
        Подбор мастера
      </h2>
      <p
        className="buyer-muted"
        style={{ marginTop: 8, marginBottom: 0, fontSize: 13, lineHeight: 1.5 }}
      >
        Идёт поиск мастера для вашей доставки. Как только он будет найден — он
        появится в этой карточке.
      </p>
      {order.matching_started_at && (
        <p
          className="buyer-muted"
          style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}
        >
          Подбор запущен: {fullDate(order.matching_started_at)}
        </p>
      )}
    </section>
  );
}

function ContactCard({
  title,
  name,
  phone,
  letter,
  subtitle,
}: {
  title: string;
  name: string;
  phone: string | null;
  letter: string;
  subtitle?: string;
}) {
  return (
    <section className="buyer-surface" style={{ padding: 16 }}>
      <h2 className="buyer-text" style={{ margin: 0, fontSize: 14, fontWeight: 900 }}>
        {title}
      </h2>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          borderRadius: 22,
          background: "var(--buyer-surface-alt)",
          border: "1px solid rgba(26, 34, 45, 0.06)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            background: "linear-gradient(135deg, #155B75 0%, #0A6C8E 100%)",
            color: "white",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          {letter}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="buyer-text" style={{ fontSize: 14, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </div>
          {phone && (
            <a
              href={`tel:${phone}`}
              style={{
                display: "inline-block",
                marginTop: 4,
                fontSize: 12,
                fontWeight: 800,
                color: "var(--buyer-info)",
                textDecoration: "none",
              }}
            >
              {phone}
            </a>
          )}
          {subtitle && (
            <div className="buyer-muted" style={{ marginTop: 4, fontSize: 11 }}>
              {subtitle}
            </div>
          )}
        </div>

        {phone && (
          <a
            href={`tel:${phone}`}
            aria-label="Позвонить"
            className="buyer-btn buyer-btn-soft"
            style={{ minHeight: 42, padding: "0 14px", flexShrink: 0 }}
          >
            Связаться
          </a>
        )}
      </div>
    </section>
  );
}
