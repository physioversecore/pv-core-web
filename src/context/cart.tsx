"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import * as CartService from "@/services/api/cart";
import { useAuth } from "@/context/auth";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  type: "buy" | "rent" | "medicine" | "nutrition";
  price: number;
  quantity: number;
  rentalDays?: number;
  image?: string;
}

interface CartCtx {
  items: CartItem[];
  open: boolean;
  loading: boolean;
  setOpen: (v: boolean) => void;
  add: (item: { productId: string; name: string; type: "buy" | "rent" | "medicine" | "nutrition"; price: number; image?: string }) => void;
  remove: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  setRental: (itemId: string, days: number) => void;
  clear: () => void;
  subtotal: number;
  delivery: number;
  total: number;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);
const typeMap: Record<string, "BUY" | "RENT" | "MEDICINE" | "NUTRITION"> = {
  buy: "BUY",
  rent: "RENT",
  medicine: "MEDICINE",
  nutrition: "NUTRITION",
};
const typeReverse: Record<string, CartItem["type"]> = {
  BUY: "buy",
  RENT: "rent",
  MEDICINE: "medicine",
  NUTRITION: "nutrition",
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    CartService.getCart()
      .then((res) => {
        setItems(
          res.items.map((i) => ({
            id: i.id,
            productId: i.productId,
            name: i.product.name,
            type: typeReverse[i.type] ?? "buy",
            price: i.product.price,
            quantity: i.quantity,
            rentalDays: i.rentalDays,
            image: i.product.emoji,
          })),
        );
      })
      .catch(() => {
        // silently fail — cart is empty if not logged in
      })
      .finally(() => setLoading(false));
  }, [user]);

  const refresh = useCallback(() => {
    if (!user) return;
    CartService.getCart()
      .then((res) => {
        setItems(
          res.items.map((i) => ({
            id: i.id,
            productId: i.productId,
            name: i.product.name,
            type: typeReverse[i.type] ?? "buy",
            price: i.product.price,
            quantity: i.quantity,
            rentalDays: i.rentalDays,
            image: i.product.emoji,
          })),
        );
      })
      .catch(() => {});
  }, [user]);

  const add: CartCtx["add"] = async (item) => {
    try {
      const res = await CartService.addToCart({
        productId: item.productId,
        type: typeMap[item.type] ?? "BUY",
      });
      setItems((prev) => {
        const existing = prev.find((p) => p.productId === item.productId && p.type === item.type);
        if (existing) {
          return prev.map((p) =>
            p === existing ? { ...p, quantity: p.quantity + 1 } : p,
          );
        }
        return [
          ...prev,
          {
            id: res.id,
            productId: item.productId,
            name: item.name,
            type: item.type,
            price: item.price,
            quantity: 1,
            rentalDays: item.type === "rent" ? 7 : undefined,
            image: item.image,
          },
        ];
      });
      toast.success("Added to cart");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add to cart");
    }
  };

  const remove = async (itemId: string) => {
    const prev = items;
    setItems((p) => p.filter((i) => i.id !== itemId));
    try {
      await CartService.removeCartItem(itemId);
    } catch {
      setItems(prev);
      toast.error("Failed to remove item");
    }
  };

  const setQty = async (itemId: string, qty: number) => {
    const prev = items;
    setItems((p) => p.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(1, qty) } : i)));
    try {
      await CartService.updateCartItem(itemId, { quantity: Math.max(1, qty) });
    } catch {
      setItems(prev);
    }
  };

  const setRental = async (itemId: string, days: number) => {
    const prev = items;
    setItems((p) => p.map((i) => (i.id === itemId ? { ...i, rentalDays: days } : i)));
    try {
      await CartService.updateCartItem(itemId, { rentalDays: days });
    } catch {
      setItems(prev);
    }
  };

  const clear = async () => {
    const prev = items;
    setItems([]);
    try {
      await CartService.clearCart();
    } catch {
      setItems(prev);
      toast.error("Failed to clear cart");
    }
  };

  const lineTotal = (i: CartItem) => i.price * i.quantity * (i.type === "rent" ? (i.rentalDays ?? 1) : 1);
  const subtotal = items.reduce((s, i) => s + lineTotal(i), 0);
  const delivery = subtotal === 0 ? 0 : subtotal >= 2000 ? 0 : 150;
  const total = subtotal + delivery;
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Ctx.Provider value={{ items, open, loading, setOpen, add, remove, setQty, setRental, clear, subtotal, delivery, total, count }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}
