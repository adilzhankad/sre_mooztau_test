import { IconPlus } from "./Icons";
import { OrderItem } from "./OrderItem";
import type { DraftItem } from "../types";

interface ItemsBlockProps {
  items: DraftItem[];
  onUpdate: (index: number, patch: Partial<DraftItem>) => void;
  onRemove: (index: number) => void;
  onOpenPicker: () => void;
}

export function ItemsBlock({
  items,
  onUpdate,
  onRemove,
  onOpenPicker,
}: ItemsBlockProps) {
  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: 14 }}>
        <div className="row gap-2">
          <p className="card-title" style={{ margin: 0 }}>
            Позиции
          </p>
          {items.length > 0 && (
            <span className="badge badge-neutral">{items.length}</span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onOpenPicker}
          style={{ gap: 5 }}
        >
          <IconPlus /> Добавить
        </button>
      </div>

      {items.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            border: "1.5px dashed var(--border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <p className="text-sm text-secondary">
            Нажмите «Добавить» чтобы выбрать товары
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="stack" style={{ gap: 10 }}>
          {items.map((item, idx) => (
            <OrderItem
              key={item.id}
              item={item}
              index={idx}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
