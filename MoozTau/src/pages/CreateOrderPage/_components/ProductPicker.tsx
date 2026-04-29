import { useState, useMemo } from "react";
import { formatMoney } from "@/lib/order-helpers";
import { getProductImageUrl } from "@/lib/product-images";
import type { Price } from "@/types";

interface Product {
  id: number;
  model: string;
  name: string;
  category: string;
  unit?: string;
  image_url?: string | null;
  available_colors?: string;
}

interface ProductPickerProps {
  products: Product[] | undefined;
  priceMap: Map<number, Price>;
  canSeeDealerPrice: boolean;
  search: string;
  setSearch: (v: string) => void;
  onSelectMultiple: (productIds: number[]) => void;
  onClose: () => void;
}

export function ProductPicker({
  products,
  priceMap,
  canSeeDealerPrice,
  search,
  setSearch,
  onSelectMultiple,
  onClose,
}: ProductPickerProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Все");

  const categories = useMemo(() => {
    const cats = products?.map((p) => p.category) || [];
    return ["Все", ...Array.from(new Set(cats))];
  }, [products]);

  const q = search.trim().toLowerCase();

  const filtered = products?.filter((p) => {
    const matchesSearch =
      !q ||
      p.model.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    const matchesCategory =
      activeCategory === "Все" || p.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  function toggle(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div
      onClick={(e) => e.currentTarget === e.target && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 14px",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <div className="row-between" style={{ marginBottom: 14 }}>
            <h2 className="text-xl font-bold text-default">Выбор товаров</h2>
            {selectedIds.length > 0 && (
              <span className="badge badge-brand">
                {selectedIds.length} выбрано
              </span>
            )}
          </div>

          <div className="search-wrap" style={{ marginBottom: 12 }}>
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию, модели или категории..."
            />
          </div>

          <div
            className="row no-scrollbar"
            style={{ gap: 6, overflowX: "auto", paddingBottom: 2 }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                className={`pill${activeCategory === cat ? " active" : ""}`}
                style={
                  activeCategory === cat
                    ? { background: "var(--brand)", color: "#fff" }
                    : undefined
                }
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
            padding: 20,
            overflowY: "auto",
            background: "var(--bg-base)",
            flex: 1,
          }}
        >
          {filtered && filtered.length > 0 ? (
            filtered.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              const price = priceMap.get(p.id);
              const productImage = getProductImageUrl(p);
              const displayPrice = canSeeDealerPrice
                ? price?.dealer_price
                : price?.recommended_price;

              return (
                <div
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  style={{
                    position: "relative",
                    padding: 12,
                    border: isSelected
                      ? "2px solid var(--brand)"
                      : "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    background: isSelected
                      ? "rgba(37,99,235,0.04)"
                      : "var(--bg-surface)",
                    cursor: "pointer",
                    transition: "all var(--t-base)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      marginBottom: 8,
                      background: "var(--bg-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <svg
                        width={40}
                        height={40}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--text-muted)"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    )}
                  </div>

                  <span className="label">{p.category}</span>
                  <span
                    className="text-sm font-semibold text-default"
                    style={{ lineHeight: 1.2 }}
                  >
                    {p.name}
                  </span>
                  <span className="text-xs text-secondary">{p.model}</span>

                  <span
                    className="text-sm font-bold tabnum"
                    style={{
                      marginTop: "auto",
                      color: displayPrice
                        ? "var(--brand)"
                        : "var(--text-muted)",
                    }}
                  >
                    {displayPrice
                      ? formatMoney(displayPrice)
                      : "Цена не указана"}
                  </span>

                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        background: "var(--brand)",
                        color: "#fff",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: 48,
              }}
            >
              <p className="text-sm text-muted">Ничего не найдено</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="row-between"
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-light)",
            background: "var(--bg-surface)",
          }}
        >
          <button className="btn btn-ghost btn-md" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn btn-primary btn-md"
            disabled={!selectedIds.length}
            onClick={() => onSelectMultiple(selectedIds)}
          >
            Добавить выбранное ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
}
