import React from "react";

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--font-tertiary)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 5,
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  background: "var(--white)",
  border: "1.5px solid var(--border-light)",
  borderRadius: 10,
  padding: "0 12px",
  fontSize: 14,
  color: "var(--font-primary)",
  outline: "none",
  boxSizing: "border-box",
};

export const readonlyInput: React.CSSProperties = {
  ...inputStyle,
  color: "var(--font-tertiary)",
  cursor: "default",
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 32,
};

export const baseCard = (color: {
  accent: string;
  light: string;
  border: string;
}): React.CSSProperties => ({
  background: color.light,
  borderRadius: 16,
  border: `1.5px solid ${color.border}`,
  padding: "18px 16px",
  boxShadow: `0 2px 8px ${color.accent}18`,
});

export const blockTitle = (color: { accent: string }): React.CSSProperties => ({
  fontSize: 13,
  fontWeight: 800,
  color: color.accent,
  margin: "0 0 14px",
  letterSpacing: "-0.2px",
  display: "flex",
  alignItems: "center",
  gap: 7,
});

export const blockDot = (color: {
  accent: string;
  light: string;
}): React.CSSProperties => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: color.accent,
  flexShrink: 0,
  boxShadow: `0 0 0 3px ${color.light}`,
});
