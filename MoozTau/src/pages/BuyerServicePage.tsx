import { useNavigate } from "react-router-dom";
import { useBuyerServiceRequests } from "@/hooks/useBuyer";
import { formatBuyerDateTime, getBuyerPortalTheme } from "@/lib/buyer-portal";
import { useThemeStore } from "@/stores/theme-store";

const STATUS_TONE: Record<string, { fg: string; bg: string }> = {
  new: { fg: "#155B75", bg: "#DDECF2" },
  in_progress: { fg: "#A15C07", bg: "#F8E7C7" },
  waiting_parts: { fg: "#7A5AF8", bg: "#EEE5FF" },
  completed: { fg: "#027A48", bg: "#DDF3E7" },
  cancelled: { fg: "#667085", bg: "#EEF0F3" },
};

export function BuyerServicePage() {
  const navigate = useNavigate();
  const { data, isLoading } = useBuyerServiceRequests();
  const isDark = useThemeStore((s) => s.mode === "dark");
  const theme = getBuyerPortalTheme(isDark);

  const requests = data ?? [];
  const activeCount = requests.filter(
    (request) => request.status !== "completed" && request.status !== "cancelled",
  ).length;

  return (
    <div
      style={{
        minHeight: "100dvh",
        padding: "calc(var(--safe-top, 0px) + 18px) 16px 30px",
        background: theme.pageBg,
        fontFamily: "var(--buyer-font-body)",
      }}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 30,
            background: theme.heroBg,
            border: theme.border,
            boxShadow: theme.shadow,
            color: theme.heroText,
            padding: "22px 20px 20px",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -52,
              top: -92,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: theme.heroGlow,
            }}
          />

          <div style={{ position: "relative", display: "grid", gap: 16 }}>
            <div>
              <p style={heroEyebrowStyle(theme)}>Гарантия и помощь</p>
              <h1 style={{ margin: "6px 0 0", fontSize: 30, lineHeight: 1.03, fontWeight: 900, letterSpacing: -1 }}>
                Сервисный центр
              </h1>
              <p style={{ margin: "10px 0 0", maxWidth: 520, fontSize: 14, lineHeight: 1.65, color: theme.heroMuted }}>
                Создавайте заявки, следите за мастером и храните всю сервисную историю рядом с заказами.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 10,
              }}
            >
              <HeroMetric label="Активные" value={String(activeCount)} note="Открытые заявки" />
              <HeroMetric label="Всего" value={String(requests.length)} note="Вся история обращений" />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => navigate("/buyer/service/new")}
                style={primaryActionStyle}
              >
                Новая заявка
              </button>
              <button
                type="button"
                onClick={() => navigate("/buyer/orders")}
                style={secondaryActionStyle}
              >
                Открыть заказы
              </button>
            </div>
          </div>
        </section>

        {isLoading ? (
          <section style={{ display: "grid", gap: 12 }}>
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                style={{
                  background: theme.surface,
                  border: theme.border,
                  boxShadow: theme.shadow,
                  borderRadius: 28,
                  padding: 16,
                }}
              >
                <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: "62%", height: 20, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: "100%", height: 60, borderRadius: 16 }} />
              </div>
            ))}
          </section>
        ) : requests.length > 0 ? (
          <section style={{ display: "grid", gap: 12 }}>
            {requests.map((request) => {
              const tone = STATUS_TONE[request.status] ?? { fg: theme.muted, bg: theme.surfaceMuted };
              return (
                <article
                  key={request.id}
                  style={{
                    background: theme.surface,
                    border: theme.border,
                    boxShadow: theme.shadow,
                    borderRadius: 28,
                    padding: 16,
                    display: "grid",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: theme.muted }}>
                        {request.ticket_number}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 900, color: theme.text }}>
                        {request.product_name}
                      </p>
                      {request.serial_number && (
                        <p style={{ margin: "5px 0 0", fontSize: 13, color: theme.muted }}>
                          Серийный номер: {request.serial_number}
                        </p>
                      )}
                    </div>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: 30,
                        padding: "0 10px",
                        borderRadius: 999,
                        background: tone.bg,
                        color: tone.fg,
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {request.status_label ?? request.status}
                    </span>
                  </div>

                  <div
                    style={{
                      borderRadius: 20,
                      background: theme.surfaceAlt,
                      padding: 14,
                      border: theme.border,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: theme.text }}>
                      {request.issue}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {request.visit_date && (
                      <MetaBadge label={`Визит: ${formatBuyerDateTime(request.visit_date)}`} theme={theme} />
                    )}
                    {request.warranty_case && <MetaBadge label="Гарантийный случай" theme={theme} tone="success" />}
                    {request.assigned_master_name && <MetaBadge label={`Мастер: ${request.assigned_master_name}`} theme={theme} />}
                  </div>

                  {request.resolution_notes && (
                    <div
                      style={{
                        borderRadius: 20,
                        padding: 14,
                        background: theme.successSoft,
                        color: theme.text,
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: theme.success }}>
                        КОММЕНТАРИЙ МАСТЕРА
                      </p>
                      <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.6 }}>
                        {request.resolution_notes}
                      </p>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: theme.muted }}>
                      Создана {formatBuyerDateTime(request.created_at)}
                    </span>
                    {request.assigned_master_phone ? (
                      <a
                        href={`tel:${request.assigned_master_phone}`}
                        style={{
                          textDecoration: "none",
                          minHeight: 42,
                          padding: "0 16px",
                          borderRadius: 999,
                          background: theme.accent,
                          color: theme.accentContrast,
                          fontSize: 13,
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        Позвонить мастеру
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section
            style={{
              background: theme.surface,
              border: theme.border,
              boxShadow: theme.shadow,
              borderRadius: 28,
              padding: "42px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 24,
                margin: "0 auto 16px",
                background: theme.accentSoft,
                color: theme.accentDeep,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconToolbox />
            </div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: theme.text }}>Сервисных заявок пока нет</p>
            <p style={{ margin: "8px auto 0", maxWidth: 360, fontSize: 14, lineHeight: 1.6, color: theme.muted }}>
              Если нужен ремонт, выезд мастера или вопрос по гарантии, создайте заявку отсюда.
            </p>
          </section>
        )}
      </div>
    </div>
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
      <p style={heroMetricLabelStyle}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 900, letterSpacing: -0.7 }}>{value}</p>
      <p style={{ margin: "3px 0 0", fontSize: 12, lineHeight: 1.45, color: "rgba(255, 255, 255, 0.72)" }}>{note}</p>
    </div>
  );
}

function MetaBadge({
  label,
  theme,
  tone,
}: {
  label: string;
  theme: ReturnType<typeof getBuyerPortalTheme>;
  tone?: "success";
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 30,
        padding: "0 10px",
        borderRadius: 999,
        background: tone === "success" ? theme.successSoft : theme.surfaceMuted,
        color: tone === "success" ? theme.success : theme.muted,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

const heroEyebrowStyle = (theme: ReturnType<typeof getBuyerPortalTheme>) => ({
  margin: 0,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 1.1,
  textTransform: "uppercase" as const,
  color: theme.heroMuted,
});

const heroMetricLabelStyle = {
  margin: 0,
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase" as const,
  letterSpacing: 0.8,
  color: "rgba(255, 255, 255, 0.72)",
};

const primaryActionStyle = {
  minHeight: 46,
  padding: "0 16px",
  borderRadius: 999,
  border: "none",
  background: "#A6CA39",
  color: "#111827",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
} as const;

const secondaryActionStyle = {
  minHeight: 46,
  padding: "0 16px",
  borderRadius: 999,
  border: "1px solid rgba(255, 255, 255, 0.14)",
  background: "rgba(255, 255, 255, 0.08)",
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
} as const;

function IconToolbox() {
  return (
    <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={7} width={18} height={11} rx={2} />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}
