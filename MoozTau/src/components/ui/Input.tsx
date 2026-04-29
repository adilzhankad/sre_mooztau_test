import { type InputHTMLAttributes, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  inputSize?: "sm" | "md" | "lg";
}

export function Input({
  label,
  error,
  hint,
  icon,
  trailing,
  className = "",
  id,
  inputSize = "md",
  style,
  ...rest
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const sizeClass = inputSize === "sm" ? " input-sm" : inputSize === "lg" ? " input-lg" : "";

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">{label}</label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: 9,
              display: "flex",
              alignItems: "center",
              color: "var(--text-muted)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`input${sizeClass}${error ? " input-error" : ""} ${className}`}
          style={{
            paddingLeft: icon ? 32 : undefined,
            paddingRight: trailing ? 32 : undefined,
            ...style,
          }}
          {...rest}
        />
        {trailing && (
          <span
            style={{
              position: "absolute",
              right: 9,
              display: "flex",
              alignItems: "center",
            }}
          >
            {trailing}
          </span>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="text-sm text-muted">{hint}</span>}
    </div>
  );
}

interface SearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxWidth?: number | string;
  style?: React.CSSProperties;
  inputRef?: React.Ref<HTMLInputElement>;
}

export function SearchInput({ value, onChange, placeholder, maxWidth, style, inputRef }: SearchProps) {
  const { t } = useTranslation();

  return (
    <div className="search-wrap" style={{ maxWidth, flex: maxWidth ? undefined : 1, ...style }}>
      <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={2} style={{ flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder ?? t("common.search")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: 1,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
