import { formatMoney } from "@/lib/order-helpers";
import { IconTrash } from "./Icons";
import type { DraftItem } from "../types";

interface OrderItemProps {
  item: DraftItem;
  index: number;
  onUpdate: (index: number, patch: Partial<DraftItem>) => void;
  onRemove: (index: number) => void;
}

const COLOR_HEX: Record<string, string> = {
  белый: "#FFFFFF",
  "серый-белый": "#D1D5DB",
  серый: "#9CA3AF",
  черный: "#111827",
  красный: "#EF4444",
  синий: "#3B82F6",
  зеленый: "#22C55E",
  желтый: "#FACC15",
  бежевый: "#D4B896",
  коричневый: "#92400E",
  золотой: "#F59E0B",
  серебристый: "#CBD5E1",
};

export function OrderItem({ item, index, onUpdate, onRemove }: OrderItemProps) {
  const qty = Math.max(1, Number(item.quantity) || 1);
  const discountedPrice =
    item.price_per_unit * (1 - item.discount_percent / 100);
  const total = discountedPrice * qty;

  const DEFAULT_COLORS = ["Белый", "Серый", "Серый-белый"];
  const colors = Array.from(
    new Set([...DEFAULT_COLORS, ...(item.available_colors ?? [])]),
  );

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--bg-surface)",
      }}
    >
      {/* Header */}
      <div
        className="row-between"
        style={{
          padding: "10px 14px",
          background: "var(--bg-subtle)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div>
          <p className="text-sm font-semibold text-default">{item.model}</p>
          <p className="text-xs text-secondary">{item.category}</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-icon-sm"
          style={{ color: "var(--danger)" }}
          onClick={() => onRemove(index)}
        >
          <IconTrash />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: 14 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {/* Quantity */}
          <div className="form-group">
            <label className="form-label">Количество</label>
            <div
              className="row"
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                style={{
                  width: 40,
                  height: 36,
                  borderRadius: 0,
                  flexShrink: 0,
                }}
                onClick={() =>
                  onUpdate(index, { quantity: Math.max(1, qty - 1) })
                }
              >
                −
              </button>
              <input
                type="number"
                value={qty}
                onChange={(e) =>
                  onUpdate(index, {
                    quantity: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                style={{
                  flex: 1,
                  height: 36,
                  textAlign: "center",
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  background: "transparent",
                }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                style={{
                  width: 40,
                  height: 36,
                  borderRadius: 0,
                  flexShrink: 0,
                }}
                onClick={() => onUpdate(index, { quantity: qty + 1 })}
              >
                +
              </button>
            </div>
          </div>

          {/* Unit */}
          <div className="form-group">
            <label className="form-label">Ед. изм.</label>
            <input
              className="input"
              value={item.unit}
              readOnly
              style={{
                background: "var(--bg-subtle)",
                color: "var(--text-secondary)",
              }}
            />
          </div>

          {/* Color */}
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">
              Цвет: {item.color || "не выбран"}
            </label>
            <div
              className="row"
              style={{ flexWrap: "wrap", gap: 8, marginTop: 6 }}
            >
              {colors.map((colorValue) => {
                const active = item.color === colorValue;
                const hex = COLOR_HEX[colorValue.toLowerCase()] ?? "#E5E7EB";
                return (
                  <button
                    key={colorValue}
                    type="button"
                    onClick={() =>
                      onUpdate(index, { color: active ? "" : colorValue })
                    }
                    title={colorValue}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: active
                        ? "2px solid var(--brand)"
                        : "1px solid var(--border)",
                      background: hex,
                      cursor: "pointer",
                      boxShadow: active
                        ? "0 0 0 3px rgba(37,99,235,0.2)"
                        : "none",
                      transition: "all var(--t-base)",
                      flexShrink: 0,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Prices */}
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid var(--border-light)",
          }}
        >
          {item.recommended_price > 0 && (
            <div
              className="row-between"
              style={{
                padding: "6px 10px",
                marginBottom: 10,
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <span className="text-xs font-semibold text-secondary">
                Рекомендованная
              </span>
              <span className="text-sm font-semibold text-default tabnum">
                {formatMoney(item.recommended_price)}
              </span>
            </div>
          )}

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <div className="form-group">
              <label className="form-label">Цена за ед.</label>
              <input
                className="input"
                type="number"
                min={0}
                value={item.price_per_unit}
                onChange={(e) =>
                  onUpdate(index, {
                    price_per_unit: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Скидка %</label>
              <input
                className="input"
                type="number"
                min={0}
                max={100}
                value={item.discount_percent}
                onChange={(e) =>
                  onUpdate(index, {
                    discount_percent: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          {item.discount_percent > 0 && (
            <p
              className="text-xs"
              style={{ marginTop: 6, color: "var(--danger)", fontWeight: 600 }}
            >
              Со скидкой: {formatMoney(discountedPrice)}
            </p>
          )}

          <div
            className="row-between"
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px dashed var(--border-light)",
            }}
          >
            <span className="text-xs text-secondary tabnum">
              {qty} × {formatMoney(discountedPrice)}
            </span>
            <span className="text-base font-bold text-default tabnum">
              {formatMoney(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
