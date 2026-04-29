import { type HTMLAttributes, type ReactNode } from "react";

/* ── Card ────────────────────────────────────────────────────────────────── */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  noPadding?: boolean;
}

const sizeMap = { sm: " card-sm", md: "", lg: " card-lg", xl: " card-xl" };

export function Card({ children, size = "md", noPadding, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`card${sizeMap[size]}${noPadding ? "" : ""}${className ? " " + className : ""}`}
      style={noPadding ? { padding: 0 } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── CardHeader ──────────────────────────────────────────────────────────── */

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="card-header">
      <span className="card-title">{title}</span>
      {action}
    </div>
  );
}

/* ── InfoRow ─────────────────────────────────────────────────────────────── */

export function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value ?? "—"}</span>
    </div>
  );
}

/* ── SectionDivider ──────────────────────────────────────────────────────── */

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "12px 10px 4px" }}>
      {children}
    </p>
  );
}
