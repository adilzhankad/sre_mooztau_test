import { useEffect, useRef, useState, type ReactNode } from "react";

export interface MultiSelectOption {
  value: string;
  label: string;
  dot?: string;
}

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  width?: number | string;
  countMap?: Record<string, number>;
  searchable?: boolean;
  icon?: ReactNode;
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder,
  width,
  countMap,
  searchable = false,
  icon,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const selectedSet = new Set(selected);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const toggle = (value: string) => {
    if (selectedSet.has(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const filtered = searchable && search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const buttonText =
    selected.length === 0
      ? placeholder ?? label
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label ?? selected[0]
        : `${label}: ${selected.length}`;

  return (
    <div ref={wrapRef} style={{ position: "relative", width }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input"
        style={{
          width: "100%",
          minWidth: 160,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          textAlign: "left",
          color: selected.length ? "var(--text-default)" : "var(--text-muted)",
          fontWeight: selected.length ? 600 : 400,
          paddingRight: 30,
          position: "relative",
        }}
      >
        {icon}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {buttonText}
        </span>
        {selected.length > 0 ? (
          <span
            role="button"
            aria-label="Clear"
            onClick={clear}
            style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 18, height: 18, borderRadius: "50%",
              background: "var(--border-light)", color: "var(--text-muted)",
            }}
          >
            <svg width={9} height={9} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        ) : (
          <svg
            width={11} height={11} fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={2.5}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            minWidth: 240,
            zIndex: 50,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            maxHeight: 320,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {searchable && (
            <div style={{ padding: 8, borderBottom: "1px solid var(--border-light)" }}>
              <input
                autoFocus
                type="text"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-sm"
                style={{ width: "100%" }}
              />
            </div>
          )}
          <div style={{ overflowY: "auto", padding: 4 }}>
            {filtered.length === 0 && (
              <div style={{ padding: "12px 10px", color: "var(--text-muted)", fontSize: 13 }}>
                Ничего не найдено
              </div>
            )}
            {filtered.map((opt) => {
              const checked = selectedSet.has(opt.value);
              const count = countMap?.[opt.value];
              return (
                <label
                  key={opt.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: checked ? "var(--bg-subtle, #f4f5f7)" : "transparent",
                    fontSize: 13,
                  }}
                  onMouseEnter={(e) => {
                    if (!checked) (e.currentTarget as HTMLElement).style.background = "var(--border-light)";
                  }}
                  onMouseLeave={(e) => {
                    if (!checked) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt.value)}
                    style={{ accentColor: "var(--text-default)", cursor: "pointer", margin: 0 }}
                  />
                  {opt.dot && (
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.dot, flexShrink: 0 }} />
                  )}
                  <span style={{ flex: 1, color: "var(--text-default)" }}>{opt.label}</span>
                  {count != null && (
                    <span
                      style={{
                        padding: "1px 7px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        background: "var(--border-light)",
                        color: "var(--text-muted)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div
              style={{
                padding: 8,
                borderTop: "1px solid var(--border-light)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              <span>Выбрано: {selected.length}</span>
              <button
                type="button"
                onClick={() => onChange([])}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-default)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                Сбросить
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
