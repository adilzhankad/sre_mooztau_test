import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-solid" | "blue";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
  iconOnly?: boolean;
}

const sizeClass: Record<Size, string> = {
  xs: "btn-xs", sm: "btn-sm", md: "btn-md", lg: "btn-lg", xl: "btn-xl",
};
const iconSizeClass: Record<Size, string> = {
  xs: "btn-icon-xs", sm: "btn-icon-sm", md: "btn-icon-md", lg: "btn-icon-lg", xl: "btn-icon-lg",
};
const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  "danger-solid": "btn-danger-solid",
  blue: "btn-blue",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  children,
  className = "",
  disabled,
  iconOnly = false,
  ...rest
}: Props) {
  const isIconOnly = iconOnly || (!children && (icon || iconRight));
  const sz = isIconOnly ? iconSizeClass[size] : sizeClass[size];

  return (
    <button
      className={`btn ${variantClass[variant]} ${sz} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {icon && <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</span>}
          {children}
          {iconRight && <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{iconRight}</span>}
        </>
      )}
    </button>
  );
}

export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg className="spinner" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
