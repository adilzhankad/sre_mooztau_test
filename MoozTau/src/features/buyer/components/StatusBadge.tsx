import { STAGE_LABEL, STAGE_TONE, type BuyerStage } from "../lib/stage";

interface Props {
  stage: BuyerStage;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ stage, size = "md", className = "" }: Props) {
  const t = STAGE_TONE[stage];
  const padding =
    size === "lg" ? "6px 12px"
    : size === "sm" ? "2px 8px"
    : "4px 10px";
  const fontSize =
    size === "lg" ? 14
    : size === "sm" ? 11
    : 12;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        fontWeight: 800,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.border}`,
        padding,
        fontSize,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: t.dot,
          flexShrink: 0,
        }}
      />
      {STAGE_LABEL[stage]}
    </span>
  );
}
