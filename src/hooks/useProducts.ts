"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/api/products";
import type { Product } from "@/types";

export function useProducts(category?: string) {
  const { data } = useQuery({
    queryKey: ["products", category],
    queryFn: () => getProducts(category),
  });

  const items: Product[] = (data?.products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category.toLowerCase() as Product["category"],
    description: p.description ?? "",
    price: p.price,
    rentPerDay: p.rentPerDay || undefined,
    inStock: p.inStock === 1,
    emoji: p.emoji,
  }));

  return { items, total: data?.total ?? 0 };
}
