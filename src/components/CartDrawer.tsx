import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart, npr } from "@/lib/cart";
import { useState } from "react";
import { toast } from "sonner";

const RENTAL_OPTIONS = [
  { label: "1 day", days: 1 },
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
];

export function CartDrawer() {
  const { items, open, setOpen, remove, setQty, setRental, subtotal, delivery, total, clear } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [payment, setPayment] = useState("esewa");
  const [address, setAddress] = useState("");

  if (!open) return null;

  const placeOrder = () => {
    if (!address.trim()) return toast.error("Add a delivery address");
    const id = "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setOrderId(id);
    clear();
  };

  return (
    <div className="fixed inset-0 z-[90]">
      <button className="absolute inset-0 bg-text/50" onClick={() => setOpen(false)} aria-label="Close cart" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border flex flex-col">
        <header className="p-5 flex items-center justify-between border-b border-border">
          <h3 className="font-display text-xl">{orderId ? "Order placed" : checkout ? "Checkout" : "Your cart"}</h3>
          <button onClick={() => { setOpen(false); setCheckout(false); setOrderId(null); }} className="p-2 rounded-full hover:bg-surface"><X size={18} /></button>
        </header>

        {orderId ? (
          <div className="flex-1 grid place-items-center p-6 text-center">
            <div>
              <div className="w-16 h-16 rounded-full bg-surface grid place-items-center mx-auto mb-3 text-3xl">✓</div>
              <p className="font-display text-2xl mb-1">Thanks!</p>
              <p className="text-text-light text-sm mb-1">Order reference</p>
              <p className="font-mono text-secondary font-semibold mb-5">{orderId}</p>
              <button onClick={() => { setOpen(false); setCheckout(false); setOrderId(null); }} className="btn-pine">Continue shopping</button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 grid place-items-center text-center p-6">
            <div>
              <ShoppingBag size={48} className="mx-auto text-text-light mb-3" />
              <p className="font-display text-xl mb-1">Cart is empty</p>
              <p className="text-text-light text-sm mb-4">Browse our shop to get started.</p>
              <button onClick={() => setOpen(false)} className="btn-outline">Browse shop</button>
            </div>
          </div>
        ) : !checkout ? (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.map((i) => (
                <div key={i.id + i.type} className="card-soft p-3 flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-surface grid place-items-center text-2xl shrink-0">{i.image ?? "📦"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div className="font-medium text-sm truncate">{i.name}</div>
                      <button onClick={() => remove(i.id)} className="text-text-light hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                    <div className="text-xs text-text-light capitalize">{i.type === "rent" ? "Rental" : i.type === "buy" ? "Purchase" : i.type}</div>
                    {i.type === "rent" && (
                      <select value={i.rentalDays ?? 7} onChange={(e) => setRental(i.id, +e.target.value)} className="mt-1 text-xs px-2 py-1 rounded-md border border-border bg-white">
                        {RENTAL_OPTIONS.map((o) => <option key={o.days} value={o.days}>{o.label}</option>)}
                      </select>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-1 border border-border rounded-full">
                        <button onClick={() => setQty(i.id, i.quantity - 1)} className="p-1.5"><Minus size={12} /></button>
                        <span className="text-xs w-5 text-center">{i.quantity}</span>
                        <button onClick={() => setQty(i.id, i.quantity + 1)} className="p-1.5"><Plus size={12} /></button>
                      </div>
                      <div className="font-semibold text-sm">
                        {npr(i.price * i.quantity * (i.type === "rent" ? (i.rentalDays ?? 1) : 1))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <footer className="border-t border-border p-5 space-y-2">
              <Row label="Subtotal" value={npr(subtotal)} />
              <Row label="Delivery" value={delivery === 0 ? "Free" : npr(delivery)} />
              <Row label="Total" value={npr(total)} bold />
              <button onClick={() => setCheckout(true)} className="btn-pine w-full mt-2">Proceed to checkout</button>
            </footer>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-text-light">Delivery address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white" placeholder="House, street, city" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-light">Payment method</label>
                <div className="grid gap-2 mt-1">
                  {[
                    { id: "esewa", label: "eSewa" },
                    { id: "khalti", label: "Khalti" },
                    { id: "cod", label: "Cash on Delivery" },
                  ].map((m) => (
                    <label key={m.id} className={`p-3 rounded-xl border cursor-pointer ${payment === m.id ? "border-secondary bg-surface" : "border-border bg-white"}`}>
                      <input type="radio" name="pay" value={m.id} checked={payment === m.id} onChange={(e) => setPayment(e.target.value)} className="mr-2" />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="card-soft p-4 space-y-1">
                <Row label="Subtotal" value={npr(subtotal)} />
                <Row label="Delivery" value={delivery === 0 ? "Free" : npr(delivery)} />
                <Row label="Total" value={npr(total)} bold />
              </div>
            </div>
            <footer className="border-t border-border p-5 flex gap-2">
              <button onClick={() => setCheckout(false)} className="btn-outline flex-1">Back</button>
              <button onClick={placeOrder} className="btn-pine flex-1">Place order</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? "font-bold text-base text-text" : "text-text-light"}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
