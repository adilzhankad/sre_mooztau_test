import { useState } from "react";
import { useInventory, useCreateInventory } from "@/hooks/useFactory";
import { useProducts } from "@/hooks/useProducts";
import { useManufacturers } from "@/hooks/useOrders";
import type { InventoryCreate } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  in_stock: "На складе",
  reserved: "Зарезервировано",
  shipped: "Отгружено",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  in_stock: "badge badge-success",
  reserved: "badge badge-warning",
  shipped: "badge badge-info",
};

export function InventoryPage() {
  const { data: items, isLoading } = useInventory();
  const { data: products } = useProducts({ is_active: true });
  const { data: manufacturersList = [] } = useManufacturers();
  const createItem = useCreateInventory();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [factoryFilter, setFactoryFilter] = useState("");
  const [form, setForm] = useState<InventoryCreate>({
    factory: "",
    product_id: 0,
    model: "",
    color: "",
    quantity: 0,
  });

  const handleProductSelect = (productId: number) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      setForm({ ...form, product_id: product.id, model: product.model });
    }
  };

  const handleCreate = async () => {
    if (!form.product_id || !form.model) return;
    await createItem.mutateAsync(form);
    setShowForm(false);
    setForm({ factory: "", product_id: 0, model: "", color: "", quantity: 0 });
  };

  if (isLoading) {
    return (
      <div
        className="center"
        style={{ minHeight: "50vh" }}
      >
        <span className="text-sm text-secondary">Загрузка...</span>
      </div>
    );
  }

  const filtered = items?.filter((item) => {
    const matchesFactory = !factoryFilter || item.factory === factoryFilter;
    const matchesSearch =
      !search || item.model.toLowerCase().includes(search.toLowerCase());
    return matchesFactory && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="row-between" style={{ padding: "14px 16px 0" }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          Склад
        </h1>
        <button
          className="btn btn-primary btn-sm"
          style={{ gap: 5 }}
          onClick={() => setShowForm(!showForm)}
        >
          <PlusIcon /> Добавить
        </button>
      </div>

      {/* Filters */}
      <div className="stack" style={{ padding: "12px 16px 0", gap: 8 }}>
        <input
          className="input"
          type="text"
          placeholder="Поиск по модели..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          value={factoryFilter}
          onChange={(e) => setFactoryFilter(e.target.value)}
        >
          <option value="">Все фабрики</option>
          {manufacturersList.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Add form */}
      {showForm && (
        <div
          className="card fade-up stack"
          style={{ margin: "12px 16px 0", gap: 10 }}
        >
          <select
            className="input"
            value={form.factory}
            onChange={(e) => setForm({ ...form, factory: e.target.value })}
          >
            {manufacturersList.map((m) => (
              <option key={m} value={m}>Фабрика: {m}</option>
            ))}
          </select>
          <select
            className="input"
            value={form.product_id || ""}
            onChange={(e) => handleProductSelect(Number(e.target.value))}
          >
            <option value="">Выберите продукт</option>
            {products?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.model} — {p.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="text"
            placeholder="Цвет"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Количество"
            value={form.quantity || ""}
            onChange={(e) =>
              setForm({ ...form, quantity: Number(e.target.value) })
            }
          />
          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={handleCreate}
            disabled={createItem.isPending || !form.product_id}
          >
            {createItem.isPending ? "Добавление..." : "Добавить"}
          </button>
        </div>
      )}

      {/* Inventory list */}
      <div className="stack" style={{ gap: 10, padding: "12px 16px 16px" }}>
        {filtered?.map((item) => {
          const badgeClass =
            STATUS_BADGE_CLASS[item.status] ?? "badge badge-neutral";

          return (
            <div key={item.id} className="card">
              <div className="row-between" style={{ marginBottom: 8 }}>
                <div className="row gap-2">
                  <span className="text-sm font-semibold text-default">
                    {item.model}
                  </span>
                  {item.color && (
                    <span className="badge badge-neutral badge-sm">
                      {item.color}
                    </span>
                  )}
                </div>
                <span className={badgeClass}>
                  {STATUS_LABELS[item.status] ?? item.status}
                </span>
              </div>

              <div className="row gap-1" style={{ alignItems: "baseline" }}>
                <span
                  className="text-2xl font-bold text-default tabnum"
                >
                  {item.quantity}
                </span>
                <span className="text-sm text-secondary">шт</span>
              </div>
            </div>
          );
        })}

        {filtered?.length === 0 && (
          <div
            className="empty-state fade-up"
            style={{ padding: "48px 16px" }}
          >
            <p className="text-sm text-secondary">Склад пуст</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
