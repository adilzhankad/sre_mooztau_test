import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import type { InventoryItem, Product } from "@/types";
import type { InventoryFormState } from "../types";
import { buildInventorySummary, getInventoryStatusLabel, getInventoryStatusTone } from "../utils";
import { EditGlyph, InventoryGlyph, PlusGlyph, TrashGlyph } from "./FactoryIcons";

interface Props {
  items: InventoryItem[];
  isLoading: boolean;
  canManageInventory: boolean;
  products: Product[];
  factories: string[];
  form: InventoryFormState;
  editingItemId: number | null;
  isSubmitting: boolean;
  isDeleting: boolean;
  onFormChange: (patch: Partial<InventoryFormState>) => void;
  onEdit: (item: InventoryItem) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: number) => void;
}

export function FactoryInventoryPanel({
  items,
  isLoading,
  canManageInventory,
  products,
  factories,
  form,
  editingItemId,
  isSubmitting,
  isDeleting,
  onFormChange,
  onEdit,
  onSubmit,
  onCancelEdit,
  onDelete,
}: Props) {
  const summary = useMemo(() => buildInventorySummary(items), [items]);
  const selectedProduct = products.find((product) => product.id === form.product_id);

  return (
    <section className="factory-section" id="factory-inventory-panel">
      <div className="factory-section__head">
        <div>
          <p className="factory-section__eyebrow">Склад</p>
          <h2 className="factory-section__title">Запасы и оперативное управление</h2>
        </div>
        <div className="factory-section__meta">{summary.totalUnits} единиц</div>
      </div>

      <div className="factory-inventory-top">
        <article className="factory-summary-card">
          <span className="factory-summary-card__icon"><InventoryGlyph /></span>
          <div>
            <p className="factory-summary-card__value">{summary.totalPositions}</p>
            <p className="factory-summary-card__label">складских позиций</p>
          </div>
        </article>
        <article className="factory-summary-card">
          <p className="factory-summary-card__value">{summary.reservedUnits}</p>
          <p className="factory-summary-card__label">зарезервировано</p>
        </article>
        <article className="factory-summary-card">
          <p className="factory-summary-card__value">{summary.shippedUnits}</p>
          <p className="factory-summary-card__label">уже отгружено</p>
        </article>
      </div>

      {canManageInventory && (
        <div className="factory-admin-panel">
          <div className="factory-admin-panel__head">
            <div>
              <p className="factory-section__eyebrow">CRUD</p>
              <h3 className="factory-admin-panel__title">
                {editingItemId ? "Редактирование складской записи" : "Новая складская запись"}
              </h3>
            </div>
            {editingItemId ? (
              <Button variant="secondary" size="sm" onClick={onCancelEdit}>
                Сбросить
              </Button>
            ) : null}
          </div>

          <div className="factory-admin-grid">
            <label className="factory-field">
              <span className="label">Фабрика</span>
              <select
                className="input"
                value={form.factory}
                onChange={(event) => onFormChange({ factory: event.target.value })}
              >
                <option value="">Выберите площадку</option>
                {factories.map((factory) => (
                  <option key={factory} value={factory}>
                    {factory}
                  </option>
                ))}
              </select>
            </label>

            <label className="factory-field factory-admin-grid__wide">
              <span className="label">Продукт</span>
              <select
                className="input"
                value={form.product_id || ""}
                onChange={(event) => {
                  const productId = Number(event.target.value);
                  const product = products.find((candidate) => candidate.id === productId);
                  onFormChange({
                    product_id: productId,
                    model: product?.model ?? "",
                  });
                }}
              >
                <option value="">Выберите продукт</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.model} - {product.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="factory-field">
              <span className="label">Модель</span>
              <input
                className="input"
                value={form.model}
                onChange={(event) => onFormChange({ model: event.target.value })}
                placeholder="Например, MT-250"
              />
            </label>

            <label className="factory-field">
              <span className="label">Цвет</span>
              <input
                className="input"
                value={form.color}
                onChange={(event) => onFormChange({ color: event.target.value })}
                placeholder="Белый"
              />
            </label>

            <label className="factory-field">
              <span className="label">Количество</span>
              <input
                className="input"
                type="number"
                min="0"
                value={form.quantity}
                onChange={(event) => onFormChange({ quantity: Number(event.target.value) })}
              />
            </label>

            <label className="factory-field">
              <span className="label">Статус</span>
              <select
                className="input"
                value={form.status}
                onChange={(event) => onFormChange({ status: event.target.value })}
              >
                <option value="in_stock">На складе</option>
                <option value="reserved">Зарезервировано</option>
                <option value="shipped">Отгружено</option>
              </select>
            </label>
          </div>

          {selectedProduct ? (
            <p className="text-xs text-secondary">
              Выбран продукт: <span className="font-semibold text-default">{selectedProduct.name}</span>
            </p>
          ) : null}

          <div className="factory-admin-panel__actions">
            <Button
              size="md"
              loading={isSubmitting}
              onClick={onSubmit}
              icon={editingItemId ? <EditGlyph /> : <PlusGlyph />}
              disabled={!form.product_id || !form.model || !form.factory}
            >
              {editingItemId ? "Сохранить изменения" : "Создать запись"}
            </Button>
            <p className="text-xs text-secondary">
              Полный CRUD на этой панели доступен только пользователю с ролью `SUPER_ADMIN`.
            </p>
          </div>
        </div>
      )}

      <div className="factory-inventory-list">
        {isLoading
          ? [1, 2, 3].map((item) => (
              <div key={item} className="factory-inventory-card">
                <div className="skeleton" style={{ width: 140, height: 16, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: 90, height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 120, height: 12 }} />
              </div>
            ))
          : items.map((item) => {
              const tone = getInventoryStatusTone(item.status);

              return (
                <article key={item.id} className="factory-inventory-card">
                  <div className="factory-inventory-card__head">
                    <div>
                      <p className="factory-inventory-card__title">{item.model}</p>
                      <p className="factory-inventory-card__subhead">
                        {item.factory} • #{item.id}
                      </p>
                    </div>
                    <span
                      className="factory-inventory-card__status"
                      style={{ background: tone.background, color: tone.color }}
                    >
                      {getInventoryStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="factory-inventory-card__body">
                    <span className="factory-chip">{item.color || "Без цвета"}</span>
                    <span className="factory-chip factory-chip--strong">{item.quantity} шт</span>
                  </div>

                  {canManageInventory ? (
                    <div className="factory-inventory-card__actions">
                      <Button variant="secondary" size="sm" icon={<EditGlyph />} onClick={() => onEdit(item)}>
                        Изменить
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<TrashGlyph />}
                        onClick={() => onDelete(item.id)}
                        disabled={isDeleting}
                      >
                        Удалить
                      </Button>
                    </div>
                  ) : null}
                </article>
              );
            })}
      </div>

      {!isLoading && items.length === 0 && (
        <div className="empty-state fade-up" style={{ padding: "52px 16px" }}>
          <p className="text-sm font-semibold text-default" style={{ marginBottom: 4 }}>
            По текущим фильтрам склад пуст
          </p>
          <p className="text-xs text-secondary">
            Попробуй сменить площадку или статус склада.
          </p>
        </div>
      )}
    </section>
  );
}
