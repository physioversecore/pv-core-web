"use server";

import { api, AuthError } from "@/lib/api";

export interface CartProductData {
  id: string;
  name: string;
  price: number;
  emoji: string;
  description?: string;
  rentPerDay?: number;
}

export interface CartItemData {
  id: string;
  userId: string;
  productId: string;
  product: CartProductData;
  type: string;
  quantity: number;
  rentalDays: number;
}

export interface CartResponseData {
  items: CartItemData[];
  total: number;
  deliveryFee: number;
  grandTotal: number;
}

export async function getCart() {
  try {
    return await api.get<CartResponseData>("/cart");
  } catch (e) {
    if (e instanceof AuthError) return { items: [], total: 0, deliveryFee: 0, grandTotal: 0 };
    throw e;
  }
}

export async function addToCart(data: {
  productId: string;
  type?: string;
  quantity?: number;
  rentalDays?: number;
}) {
  return api.post<CartItemData>("/cart", data);
}

export async function updateCartItem(
  itemId: string,
  data: { quantity?: number; rentalDays?: number; type?: string },
) {
  return api.put<CartItemData>(`/cart/${itemId}`, data);
}

export async function removeCartItem(itemId: string) {
  return api.delete(`/cart/${itemId}`);
}

export async function clearCart() {
  return api.delete("/cart");
}
