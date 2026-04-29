import { useMemo, useState } from "react";
import { useFactoryDashboard, useFactoryOrders, useInventory, useCreateInventory, useUpdateInventory, useDeleteInventory } from "@/hooks/useFactory";
import { useProducts } from "@/hooks/useProducts";
import { useManufacturers } from "@/hooks/useOrders";
import { useAuthStore } from "@/stores/auth-store";
import type { InventoryItem } from "@/types";
import { FactoryFilters } from "./_components/FactoryFilters";
import { FactoryHero } from "./_components/FactoryHero";
import { FactoryInventoryPanel } from "./_components/FactoryInventoryPanel";
import { FactoryOrdersPanel } from "./_components/FactoryOrdersPanel";
import { FactoryStatsGrid } from "./_components/FactoryStatsGrid";
import { createInitialInventoryForm, filterOrdersBySearch } from "./utils";
import type { FactoryFiltersState } from "./types";
import "./factory-page.css";

const INITIAL_FILTERS: FactoryFiltersState = {
  orderStatus: "",
  inventoryStatus: "",
  search: "",
  factory: "",
};

export function FactoryPage() {
  const role = useAuthStore((state) => state.role);
  const canManageInventory = role === "SUPER_ADMIN";

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(createInitialInventoryForm());

  const { data: dashboard, isLoading: isDashboardLoading } = useFactoryDashboard();
  const { data: orders = [], isLoading: isOrdersLoading } = useFactoryOrders({
    status_filter: filters.orderStatus || undefined,
  });
  const { data: inventory = [], isLoading: isInventoryLoading } = useInventory({
    model: filters.search || undefined,
    factory: filters.factory || undefined,
    status_filter: filters.inventoryStatus || undefined,
  });
  const { data: products = [] } = useProducts({ is_active: true });
  const { data: manufacturers = [] } = useManufacturers();

  const createInventory = useCreateInventory();
  const updateInventory = useUpdateInventory(editingItem?.id ?? 0);
  const deleteInventory = useDeleteInventory();

  const visibleOrders = useMemo(
    () => filterOrdersBySearch(orders, filters.search).filter((order) => !filters.factory || order.factory === filters.factory),
    [orders, filters.search, filters.factory],
  );

  const allFactories = useMemo(() => {
    const values = new Set<string>(manufacturers);
    inventory.forEach((item) => values.add(item.factory));
    orders.forEach((order) => values.add(order.factory));
    return Array.from(values);
  }, [manufacturers, inventory, orders]);

  function updateFilters(patch: Partial<FactoryFiltersState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function resetForm() {
    setEditingItem(null);
    setForm(createInitialInventoryForm(filters.factory || allFactories[0] || ""));
  }

  function handleEdit(item: InventoryItem) {
    setEditingItem(item);
    setForm({
      factory: item.factory,
      product_id: item.product_id,
      model: item.model,
      color: item.color,
      quantity: item.quantity,
      status: item.status,
    });
    const element = document.getElementById("factory-inventory-panel");
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit() {
    if (!canManageInventory) return;

    if (editingItem) {
      await updateInventory.mutateAsync({
        factory: form.factory,
        product_id: form.product_id,
        model: form.model,
        color: form.color,
        quantity: form.quantity,
        status: form.status,
      });
    } else {
      await createInventory.mutateAsync({
        factory: form.factory,
        product_id: form.product_id,
        model: form.model,
        color: form.color,
        quantity: form.quantity,
        status: form.status,
      });
    }

    resetForm();
  }

  async function handleDelete(id: number) {
    if (!canManageInventory) return;
    if (!window.confirm("Удалить эту запись склада?")) return;

    await deleteInventory.mutateAsync(id);
    if (editingItem?.id === id) {
      resetForm();
    }
  }

  return (
    <div className="factory-page">
      <FactoryHero
        totalOrders={dashboard?.total_orders ?? visibleOrders.length}
        totalInventoryUnits={inventory.reduce((sum, item) => sum + item.quantity, 0)}
        canManageInventory={canManageInventory}
        onOpenInventory={() => {
          document.getElementById("factory-inventory-panel")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      />

      <FactoryStatsGrid dashboard={dashboard} isLoading={isDashboardLoading} />

      <FactoryFilters
        filters={filters}
        manufacturers={allFactories}
        onChange={updateFilters}
      />

      <div className="factory-page__content">
        <FactoryOrdersPanel orders={visibleOrders} isLoading={isOrdersLoading} />
        <FactoryInventoryPanel
          items={inventory}
          isLoading={isInventoryLoading}
          canManageInventory={canManageInventory}
          products={products}
          factories={allFactories}
          form={form}
          editingItemId={editingItem?.id ?? null}
          isSubmitting={createInventory.isPending || updateInventory.isPending}
          isDeleting={deleteInventory.isPending}
          onFormChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
          onEdit={handleEdit}
          onSubmit={() => void handleSubmit()}
          onCancelEdit={resetForm}
          onDelete={(id) => void handleDelete(id)}
        />
      </div>
    </div>
  );
}
