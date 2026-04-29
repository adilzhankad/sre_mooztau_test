import { useState } from "react";
import { formatMoney } from "@/lib/order-helpers";
import type { OrderItem, Product } from "@/types";

interface Props {
  items: OrderItem[];
  products?: Product[];
  canEditPrice: boolean;
  priceMap: Map<number, number>;
  onUpdatePrice: (itemId: number, price: number) => void;
  onDeleteItem?: (itemId: number) => void;
  onAddItem?: (item: OrderItem) => void;
}

export function OrderItemsCard({ items, products = [], canEditPrice, priceMap, onUpdatePrice, onDeleteItem, onAddItem }: Props) {
  const [editId, setEditId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Товары</span>
        <div className="row gap-2">
          <span className="badge badge-neutral">{items.length}</span>
          {onAddItem && products.length > 0 && (
            <button
              className="btn btn-secondary btn-xs"
              onClick={() => setShowAdd(v => !v)}
            >
              {showAdd ? "Закрыть" : "+ Добавить"}
            </button>
          )}
        </div>
      </div>

      {/* Add picker */}
      {showAdd && products.length > 0 && (
        <div className="card card-sm" style={{ marginBottom: 12, background: "var(--bg-base)" }}>
          <p className="text-xs text-secondary" style={{ marginBottom: 8 }}>Выберите продукт:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {products.map((p) => (
              <button
                key={p.id}
                className="pill"
                onClick={() => {
                  onAddItem?.({ id: Date.now(), product_id: p.id, model: p.model, category: p.category, quantity: 1, unit: p.unit, length: p.default_length, height: p.default_height, width: p.default_width, color: "—", price_per_unit: 0, total_price: 0 });
                  setShowAdd(false);
                }}
              >
                {p.model}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="stack gap-2">
        {items.map((item) => {
          const recPrice = item.product_id ? priceMap.get(item.product_id) : undefined;
          const isEdit = editId === item.id;

          return (
            <div key={item.id} style={{ border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: 12 }}>
              <div className="row-between" style={{ marginBottom: 6 }}>
                <span className="text-sm font-semibold text-default">{item.model}</span>
                {canEditPrice && (
                  <button
                    className="btn btn-ghost btn-xs"
                    style={{ color: "var(--brand)" }}
                    onClick={() => setEditId(isEdit ? null : item.id)}
                  >
                    {isEdit ? "Закрыть" : "Изменить"}
                  </button>
                )}
              </div>

              <p className="text-xs text-secondary" style={{ marginBottom: 8 }}>
                {item.category} · {item.color}
              </p>

              {isEdit && (
                <div style={{ marginBottom: 10, padding: 10, background: "var(--bg-base)", borderRadius: "var(--radius-sm)" }}>
                  {recPrice && (
                    <p className="text-xs" style={{ color: "var(--success-fg)", marginBottom: 6 }}>
                      Рекомендовано: {formatMoney(recPrice)}
                    </p>
                  )}
                  <input
                    className="input input-sm"
                    type="number"
                    value={item.price_per_unit}
                    onChange={(e) => onUpdatePrice(item.id, Number(e.target.value) || 0)}
                  />
                  {onDeleteItem && (
                    <button
                      className="btn btn-ghost btn-xs"
                      style={{ color: "var(--danger)", marginTop: 8 }}
                      onClick={() => onDeleteItem(item.id)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              )}

              <div className="row-between">
                <span className="text-xs text-secondary">{item.quantity} {item.unit} · {formatMoney(item.price_per_unit)}/шт</span>
                <span className="text-sm font-bold tabnum">{formatMoney(item.total_price)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
