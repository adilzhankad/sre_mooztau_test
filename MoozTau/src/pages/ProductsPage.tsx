import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreatePrice,
  useCreateProduct,
  useDeleteProduct,
  usePrices,
  useProducts,
  useUpdateProduct,
} from "@/hooks/useProducts";
import { useAuthStore } from "@/stores/auth-store";
import { formatMoney } from "@/lib/order-helpers";
import { getProductImageUrl } from "@/lib/product-images";
import type {
  Price,
  Product,
  ProductCategory,
  ProductCreate,
  ProductUpdate,
} from "@/types";

const CATEGORY_VALUES: Array<"" | ProductCategory> = [
  "",
  "BUILT_IN",
  "OUTDOOR",
  "UNIT",
  "DOOR",
  "WITHOUT_UNIT",
  "FREEZER",
];

type ProductFormState = {
  category: ProductCategory;
  model: string;
  name: string;
  description: string;
  unit: string;
  default_length: string;
  default_height: string;
  default_width: string;
  available_colors: string;
  image_url: string;
  is_active: boolean;
  dealer_price: string;
  recommended_price: string;
  price_per_meter: string;
};

const EMPTY_FORM: ProductFormState = {
  category: "BUILT_IN",
  model: "",
  name: "",
  description: "",
  unit: "шт",
  default_length: "",
  default_height: "",
  default_width: "",
  available_colors: "",
  image_url: "",
  is_active: true,
  dealer_price: "",
  recommended_price: "",
  price_per_meter: "",
};

export function ProductsPage() {
  const { t } = useTranslation();
  const categoryLabel = (v: "" | ProductCategory) => t(`productCategory.${v || "all"}`);
  const role = useAuthStore((s) => s.role);
  const upperRole = role?.toUpperCase() ?? "";
  const isAdmin = upperRole === "SUPER_ADMIN";
  const isFactory = upperRole === "FACTORY_ADMIN" || upperRole === "FACTORY_WORKER";
  const canSeeDealerPrice = upperRole === "SUPER_ADMIN" || upperRole === "DEALER_ADMIN";
  const canEditCatalog =
    isAdmin ||
    upperRole === "DEALER_ADMIN" ||
    upperRole === "DEALER_MANAGER" ||
    upperRole === "FACTORY_ADMIN";

  const { data: products, isLoading } = useProducts(canEditCatalog ? undefined : { is_active: true });
  const { data: prices } = usePrices();

  const [activeCategory, setActiveCategory] = useState<"" | ProductCategory>("");
  const [search, setSearch] = useState("");
  const [adminFilter, setAdminFilter] = useState<"active" | "all" | "inactive">("active");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(selectedProduct?.id ?? 0);
  const deleteProduct = useDeleteProduct();
  const createPrice = useCreatePrice();

  const priceMap = useMemo(() => {
    const map = new Map<number, Price>();
    prices?.forEach((price) => {
      if (!map.has(price.product_id)) map.set(price.product_id, price);
    });
    return map;
  }, [prices]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (products ?? []).filter((product) => {
      if (!canEditCatalog && !product.is_active) return false;
      if (canEditCatalog) {
        if (adminFilter === "active" && !product.is_active) return false;
        if (adminFilter === "inactive" && product.is_active) return false;
      }

      if (activeCategory && product.category !== activeCategory) return false;
      if (!query) return true;

      return [
        product.model,
        product.name,
        product.description,
        product.category,
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [products, search, activeCategory, isAdmin, adminFilter]);

  const stats = useMemo(() => {
    const list = products ?? [];
    return {
      total: list.length,
      active: list.filter((p) => p.is_active).length,
      inactive: list.filter((p) => !p.is_active).length,
    };
  }, [products]);

  function openCreateModal() {
    setSelectedProduct(null);
    setForm(EMPTY_FORM);
    setModalMode("create");
  }

  function openEditModal(product: Product) {
    const price = priceMap.get(product.id);
    setSelectedProduct(product);
    setForm({
      category: product.category as ProductCategory,
      model: product.model,
      name: product.name,
      description: product.description,
      unit: product.unit,
      default_length: product.default_length?.toString() ?? "",
      default_height: product.default_height?.toString() ?? "",
      default_width: product.default_width?.toString() ?? "",
      available_colors: product.available_colors ?? "",
      image_url: product.image_url ?? "",
      is_active: product.is_active,
      dealer_price: price?.dealer_price?.toString() ?? "",
      recommended_price: price?.recommended_price?.toString() ?? "",
      price_per_meter: price?.price_per_meter?.toString() ?? "",
    });
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedProduct(null);
    setForm(EMPTY_FORM);
  }

  function setField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    const basePayload: ProductCreate = {
      category: form.category,
      model: form.model.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      unit: form.unit,
      default_length: form.default_length ? Number(form.default_length) : null,
      default_height: form.default_height ? Number(form.default_height) : null,
      default_width: form.default_width ? Number(form.default_width) : null,
      available_colors: form.available_colors.trim(),
      image_url: form.image_url.trim() || undefined,
    };

    if (!basePayload.model || !basePayload.name) {
      alert(t("productsPage.modal.requiredFields"));
      return;
    }

    const saved =
      modalMode === "create"
        ? await createProduct.mutateAsync(basePayload)
        : await updateProduct.mutateAsync({
            ...basePayload,
            is_active: form.is_active,
          } satisfies ProductUpdate);

    if (form.dealer_price || form.recommended_price || form.price_per_meter) {
      await createPrice.mutateAsync({
        product_id: saved.id,
        dealer_price: form.dealer_price ? Number(form.dealer_price) : null,
        recommended_price: form.recommended_price ? Number(form.recommended_price) : null,
        price_per_meter: form.price_per_meter ? Number(form.price_per_meter) : null,
        effective_from: new Date().toISOString().slice(0, 10),
      });
    }

    closeModal();
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(t("productsPage.confirmDelete", { model: product.model }));
    if (!confirmed) return;
    await deleteProduct.mutateAsync(product.id);
  }

  const isBusy =
    createProduct.isPending ||
    updateProduct.isPending ||
    createPrice.isPending ||
    deleteProduct.isPending;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-base)" }}>
      <div
        style={{
          padding: "18px 16px 14px",
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.06) 0%, rgba(255,255,255,0) 100%)",
        }}
      >
        <div className="card" style={{ overflow: "hidden", padding: 0 }}>
          <div
            style={{
              padding: 18,
              background:
                "linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #38BDF8 100%)",
              color: "#fff",
            }}
          >
            <div className="row-between" style={{ alignItems: "flex-start", gap: 12 }}>
              <div>
                <p className="text-xs" style={{ margin: 0, opacity: 0.8 }}>{t("productsPage.kicker")}</p>
                <h2 className="text-lg font-bold" style={{ margin: "6px 0 0" }}>
                  {t("productsPage.title")}
                </h2>
                <p className="text-sm" style={{ margin: "8px 0 0", opacity: 0.84 }}>
                  {t("productsPage.subtitle")}
                </p>
              </div>

              {canEditCatalog && (
                <button className="btn btn-sm" style={{ background: "#fff", color: "#0F172A" }} onClick={openCreateModal}>
                  {t("productsPage.newProduct")}
                </button>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 10,
                marginTop: 16,
              }}
            >
              <StatCard label={t("productsPage.stats.total")} value={String(stats.total)} />
              <StatCard label={t("productsPage.stats.active")} value={String(stats.active)} />
              <StatCard label={t("productsPage.stats.inactive")} value={String(stats.inactive)} />
            </div>
          </div>

          <div style={{ padding: 14, display: "grid", gap: 10 }}>
            <input
              className="input"
              placeholder={t("productsPage.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="row no-scrollbar" style={{ gap: 6, overflowX: "auto" }}>
              {CATEGORY_VALUES.map((value) => (
                <button
                  key={value || "all"}
                  className={`pill${activeCategory === value ? " active" : ""}`}
                  style={activeCategory === value ? { background: "var(--brand)", color: "#fff" } : undefined}
                  onClick={() => setActiveCategory(value)}
                >
                  {categoryLabel(value)}
                </button>
              ))}
            </div>

            {canEditCatalog && (
              <div className="row no-scrollbar" style={{ gap: 6, overflowX: "auto" }}>
                {[
                  { value: "active", label: t("productsPage.filters.active") },
                  { value: "all", label: t("productsPage.filters.all") },
                  { value: "inactive", label: t("productsPage.filters.inactive") },
                ].map((item) => (
                  <button
                    key={item.value}
                    className={`pill${adminFilter === item.value ? " active" : ""}`}
                    style={adminFilter === item.value ? { background: "#0F172A", color: "#fff" } : undefined}
                    onClick={() => setAdminFilter(item.value as typeof adminFilter)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="skeleton" style={{ height: 140 }} />
              <div style={{ padding: 14 }}>
                <div className="skeleton" style={{ width: "60%", height: 14, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "85%", height: 11, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "40%", height: 16 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="stagger products-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
            padding: "0 var(--page-x-mobile) calc(var(--safe-bottom, 0px) + 18px)",
          }}
        >
          {filtered.map((product) => (
            <ProductCatalogCard
              key={product.id}
              product={product}
              price={priceMap.get(product.id)}
              canSeeDealerPrice={canSeeDealerPrice}
              isFactory={isFactory}
              isAdmin={isAdmin}
              canEdit={canEditCatalog}
              onEdit={() => openEditModal(product)}
              onDelete={() => handleDelete(product)}
            />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="empty-state fade-up" style={{ padding: "56px 16px" }}>
          <div className="empty-state-icon">
            <CatalogIcon />
          </div>
          <p className="text-sm font-semibold text-default" style={{ marginBottom: 4 }}>
            {t("productsPage.empty.title")}
          </p>
          <p className="text-xs text-secondary">
            {t("productsPage.empty.description")}
          </p>
        </div>
      )}

      {modalMode && (
        <ProductModal
          mode={modalMode}
          form={form}
          isBusy={isBusy}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onChange={setField}
        />
      )}
    </div>
  );
}

function ProductCatalogCard({
  product,
  price,
  canSeeDealerPrice,
  isFactory,
  isAdmin,
  canEdit,
  onEdit,
  onDelete,
}: {
  product: Product;
  price?: Price;
  canSeeDealerPrice: boolean;
  isFactory: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const productImage = getProductImageUrl(product);
  const primaryPrice =
    !isFactory
      ? canSeeDealerPrice
        ? price?.dealer_price ?? price?.recommended_price ?? price?.price_per_meter ?? null
        : price?.recommended_price ?? price?.price_per_meter ?? null
      : null;

  const colors = product.available_colors
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ position: "relative", height: 168, overflow: "hidden", background: "#E2E8F0" }}>
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="center" style={{ width: "100%", height: "100%" }}>
            <CatalogIcon />
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(15,23,42,0.02) 0%, rgba(15,23,42,0.78) 100%)",
          }}
        />

        <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, color: "#fff" }}>
          <div className="row-between" style={{ marginBottom: 8, alignItems: "flex-start", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: 999,
                background: product.is_active ? "rgba(16,185,129,0.18)" : "rgba(148,163,184,0.22)",
                border: `1px solid ${product.is_active ? "rgba(16,185,129,0.45)" : "rgba(203,213,225,0.4)"}`,
                backdropFilter: "blur(6px)",
              }}
            >
              {product.is_active ? t("productsPage.card.statusActive") : t("productsPage.card.statusInactive")}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {product.category}
            </span>
          </div>

          <p className="text-sm font-bold" style={{ margin: 0 }}>{product.model}</p>
          <p className="text-xs" style={{ margin: "4px 0 0", opacity: 0.92 }}>{product.name}</p>
        </div>
      </div>

      <div className="stack" style={{ padding: 14, gap: 10 }}>
        <p className="text-xs text-secondary" style={{ margin: 0, minHeight: 34 }}>
          {product.description || t("productsPage.card.noDescription")}
        </p>

        <div className="row-between" style={{ alignItems: "flex-start", gap: 12 }}>
          <div>
            <p className="text-xs text-muted" style={{ margin: 0 }}>{t("productsPage.card.priceLabel")}</p>
            {primaryPrice != null ? (
              <p className="text-base font-bold text-brand tabnum" style={{ margin: "3px 0 0" }}>
                {formatMoney(primaryPrice)}
              </p>
            ) : (
              <p className="text-sm text-secondary" style={{ margin: "3px 0 0" }}>{t("productsPage.card.priceEmpty")}</p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="text-xs text-muted" style={{ margin: 0 }}>{t("productsPage.card.unitLabel")}</p>
            <p className="text-sm font-semibold text-default" style={{ margin: "3px 0 0" }}>{product.unit}</p>
          </div>
        </div>

        {(product.default_length || product.default_height || product.default_width) && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 8px",
              borderRadius: 10,
              background: "var(--bg-subtle)",
              alignSelf: "flex-start",
            }}
          >
            <RulerIcon />
            <span className="text-xs text-secondary">
              {[product.default_length, product.default_height, product.default_width].filter(Boolean).join(" × ")}
            </span>
          </div>
        )}

        {colors.length > 0 && (
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {colors.map((color) => (
              <span
                key={color}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: "var(--bg-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                {color}
              </span>
            ))}
          </div>
        )}

        {canEdit && (
          <div className="row" style={{ gap: 8, marginTop: 2 }}>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={onEdit}>
              {t("productsPage.card.edit")}
            </button>
            {isAdmin && (
              <button className="btn btn-danger-solid btn-sm" style={{ flex: 1 }} onClick={onDelete}>
                {t("productsPage.card.delete")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductModal({
  mode,
  form,
  isBusy,
  onClose,
  onSubmit,
  onChange,
}: {
  mode: "create" | "edit";
  form: ProductFormState;
  isBusy: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
}) {
  const { t } = useTranslation();
  const catLabel = (v: ProductCategory) => t(`productCategory.${v}`);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.62)",
        backdropFilter: "blur(6px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card modal-sheet"
        style={{ width: "100%", maxWidth: 760, maxHeight: "92dvh", overflowY: "auto", padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: 18, borderBottom: "1px solid var(--border-light)" }}>
          <h3 className="text-lg font-bold text-default" style={{ margin: 0 }}>
            {mode === "create" ? t("productsPage.modal.createTitle") : t("productsPage.modal.editTitle")}
          </h3>
          <p className="text-sm text-secondary" style={{ margin: "6px 0 0" }}>
            {t("productsPage.modal.subtitle")}
          </p>
        </div>

        <div className="stack" style={{ padding: 18, gap: 16 }}>
          <div className="product-modal-grid">
            <Field label={t("productsPage.modal.fields.model")}>
              <input className="input" value={form.model} onChange={(e) => onChange("model", e.target.value)} />
            </Field>
            <Field label={t("productsPage.modal.fields.name")}>
              <input className="input" value={form.name} onChange={(e) => onChange("name", e.target.value)} />
            </Field>
            <Field label={t("productsPage.modal.fields.category")}>
              <select className="input" value={form.category} onChange={(e) => onChange("category", e.target.value as ProductCategory)}>
                {CATEGORY_VALUES.filter((v): v is ProductCategory => v !== "").map((value) => (
                  <option key={value} value={value}>{catLabel(value)}</option>
                ))}
              </select>
            </Field>
            <Field label={t("productsPage.modal.fields.unit")}>
              <select className="input" value={form.unit} onChange={(e) => onChange("unit", e.target.value)}>
                <option value="шт">шт</option>
                <option value="метр">метр</option>
              </select>
            </Field>
          </div>

          <Field label={t("productsPage.modal.fields.description")}>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              style={{ resize: "vertical" }}
            />
          </Field>

          <Field label={t("productsPage.modal.fields.imageUrl")}>
            <input
              className="input"
              placeholder={t("productsPage.modal.fields.imageUrlPlaceholder")}
              value={form.image_url}
              onChange={(e) => onChange("image_url", e.target.value)}
            />
          </Field>

          <Field label={t("productsPage.modal.fields.colors")}>
            <input
              className="input"
              placeholder={t("productsPage.modal.fields.colorsPlaceholder")}
              value={form.available_colors}
              onChange={(e) => onChange("available_colors", e.target.value)}
            />
          </Field>

          <div className="product-dims-grid">
            <Field label={t("productsPage.modal.fields.length")}>
              <input className="input" type="number" value={form.default_length} onChange={(e) => onChange("default_length", e.target.value)} />
            </Field>
            <Field label={t("productsPage.modal.fields.height")}>
              <input className="input" type="number" value={form.default_height} onChange={(e) => onChange("default_height", e.target.value)} />
            </Field>
            <Field label={t("productsPage.modal.fields.width")}>
              <input className="input" type="number" value={form.default_width} onChange={(e) => onChange("default_width", e.target.value)} />
            </Field>
          </div>

          <div className="card" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-light)" }}>
            <p className="text-sm font-semibold text-default" style={{ margin: "0 0 12px" }}>{t("productsPage.modal.priceSection")}</p>
            <div className="product-dims-grid">
              <Field label={t("productsPage.modal.prices.dealer")}>
                <input className="input" type="number" value={form.dealer_price} onChange={(e) => onChange("dealer_price", e.target.value)} />
              </Field>
              <Field label={t("productsPage.modal.prices.recommended")}>
                <input className="input" type="number" value={form.recommended_price} onChange={(e) => onChange("recommended_price", e.target.value)} />
              </Field>
              <Field label={t("productsPage.modal.prices.perMeter")}>
                <input className="input" type="number" value={form.price_per_meter} onChange={(e) => onChange("price_per_meter", e.target.value)} />
              </Field>
            </div>
          </div>

          {mode === "edit" && (
            <label className="row" style={{ gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => onChange("is_active", e.target.checked)}
              />
              <span className="text-sm text-default">{t("productsPage.modal.activeCheckbox")}</span>
            </label>
          )}
        </div>

        <div
          className="row-between"
          style={{ padding: 18, borderTop: "1px solid var(--border-light)", gap: 10 }}
        >
          <button className="btn btn-secondary" onClick={onClose}>{t("productsPage.modal.cancel")}</button>
          <button className="btn btn-primary" disabled={isBusy} onClick={() => void onSubmit()}>
            {isBusy ? t("productsPage.modal.saving") : mode === "create" ? t("productsPage.modal.create") : t("productsPage.modal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="stack" style={{ gap: 6 }}>
      <span className="text-xs font-semibold text-secondary">{label}</span>
      {children}
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.14)",
      }}
    >
      <p className="text-lg font-bold tabnum" style={{ margin: 0 }}>{value}</p>
      <p className="text-xs" style={{ margin: "4px 0 0", opacity: 0.8 }}>{label}</p>
    </div>
  );
}

function CatalogIcon() {
  return (
    <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M7 7v4m3-4v2m3-2v4m3-4v2M5 17h14a2 2 0 002-2V9H3v6a2 2 0 002 2z" />
    </svg>
  );
}
