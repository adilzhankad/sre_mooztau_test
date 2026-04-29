import type { InventoryCreate } from "@/types";

export interface FactoryFiltersState {
  orderStatus: string;
  inventoryStatus: string;
  search: string;
  factory: string;
}

export type InventoryFormState = Required<InventoryCreate>;
