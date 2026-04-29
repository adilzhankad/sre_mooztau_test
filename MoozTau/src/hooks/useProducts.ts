import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import * as productsApi from "@/api/products";
import type { ProductCategory, ProductCreate, ProductUpdate, PriceCreate } from "@/types";

export function useProducts(filters?: {
  category?: ProductCategory;
  is_active?: boolean;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.products, filters],
    queryFn: () => productsApi.getProducts(filters),
  });
}

export function useProduct(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.products, id],
    queryFn: () => productsApi.getProduct(id!),
    enabled: id != null,
  });
}

export function usePrices() {
  return useQuery({
    queryKey: [QUERY_KEYS.prices],
    queryFn: () => productsApi.getPrices(),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCreate) => productsApi.createProduct(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.products] }),
  });
}

export function useUpdateProduct(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductUpdate) => productsApi.updateProduct(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.products] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsApi.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.products] }),
  });
}

export function useCreatePrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PriceCreate) => productsApi.createPrice(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.prices] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.products] });
    },
  });
}
