import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
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
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  setRental: (id: string, days: number) => void;
  clear: () => void;
  subtotal: number;
  delivery: number;
  total: number;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "sahayatri.cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (item) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id && p.type === item.type);
      if (existing) {
        return prev.map((p) => (p === existing ? { ...p, quantity: p.quantity + (item.quantity ?? 1) } : p));
      }
      return [...prev, { ...item, quantity: item.quantity ?? 1, rentalDays: item.rentalDays ?? (item.type === "rent" ? 7 : undefined) }];
    });
    toast.success("Added to cart");
  };

  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)));
  const setRental = (id: string, days: number) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, rentalDays: days } : i)));
  const clear = () => setItems([]);

  const lineTotal = (i: CartItem) => i.price * i.quantity * (i.type === "rent" ? (i.rentalDays ?? 1) : 1);
  const subtotal = items.reduce((s, i) => s + lineTotal(i), 0);
  const delivery = subtotal === 0 ? 0 : subtotal >= 2000 ? 0 : 150;
  const total = subtotal + delivery;
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Ctx.Provider value={{ items, open, setOpen, add, remove, setQty, setRental, clear, subtotal, delivery, total, count }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}

export const npr = (n: number) => `Rs ${n.toLocaleString("en-IN")}`;
