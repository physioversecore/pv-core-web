"use server";

import { api } from "@/lib/api";

export interface ProductData {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  rentPerDay: number;
  inStock: number;
  emoji: string;
  imageUrl?: string;
}

interface ProductListResponse {
  products: ProductData[];
  total: number;
}

export async function getProducts(category?: string) {
  const searchParams = new URLSearchParams();
  if (category) searchParams.set("category", category.toUpperCase());
  return api.get<ProductListResponse>(
    `/products?${searchParams.toString()}`,
  );
}

export async function getProduct(id: string) {
  return api.get<ProductData>(`/products/${id}`);
}
