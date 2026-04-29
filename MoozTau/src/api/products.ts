import { ordersApi } from "@/lib/axios";
import type { Product, Price, ProductCategory, ProductCreate, ProductUpdate, PriceCreate } from "@/types";

export async function getProducts(filters?: {
  category?: ProductCategory;
  is_active?: boolean;
}): Promise<Product[]> {
  const params = filters
    ? Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v != null),
      )
    : undefined;
  const { data } = await ordersApi.get("/api/products/", { params });
  return data;
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await ordersApi.get(`/api/products/${id}`);
  return data;
}

export async function getPrices(): Promise<Price[]> {
  const { data } = await ordersApi.get("/api/prices/");
  return data;
}

export async function getProductPrices(productId: number): Promise<Price[]> {
  const { data } = await ordersApi.get(`/api/products/${productId}/prices`);
  return data;
}

export async function createProduct(product: ProductCreate): Promise<Product> {
  const { data } = await ordersApi.post("/api/products/", product);
  return data;
}

export async function updateProduct(id: number, product: ProductUpdate): Promise<Product> {
  const { data } = await ordersApi.put(`/api/products/${id}`, product);
  return data;
}

export async function deleteProduct(id: number): Promise<{ detail: string; soft_deleted: boolean }> {
  const { data } = await ordersApi.delete(`/api/products/${id}`);
  return data;
}

export async function createPrice(price: PriceCreate): Promise<Price> {
  const { data } = await ordersApi.post("/api/prices/", price);
  return data;
}
