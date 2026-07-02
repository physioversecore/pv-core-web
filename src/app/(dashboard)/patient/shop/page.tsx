"use client";

import { useState } from "react";
import { PRODUCTS, type Product } from "@/lib/mock";
import { useCart, npr } from "@/lib/cart";

const TABS = [
  { id: "equipment", label: "Equipment" },
  { id: "medicine", label: "Medicines" },
  { id: "nutrition", label: "Nutrition" },
] as const;

export default function Shop() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("equipment");
  const items = PRODUCTS.filter((p) => p.category === tab);

  return (
    <div>
      <div className="flex gap-1 p-1 bg-sage rounded-full mb-6 w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === t.id ? "bg-white text-pine shadow-sm" : "text-slate"}`}>{t.label}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const [mode, setMode] = useState<"buy" | "rent">(p.category === "equipment" && p.rentPerDay ? "rent" : "buy");
  const price = mode === "rent" && p.rentPerDay ? p.rentPerDay : p.price;

  return (
    <div className="card-soft p-4 flex flex-col">
      <div className="aspect-square rounded-xl bg-sage grid place-items-center text-6xl mb-3">{p.emoji}</div>
      <div className="font-medium text-sm">{p.name}</div>
      <p className="text-xs text-slate mt-0.5 mb-3 flex-1">{p.description}</p>

      {p.category === "equipment" && p.rentPerDay && (
        <div className="flex gap-1 p-0.5 bg-sage rounded-full mb-3 text-xs">
          <button onClick={() => setMode("buy")} className={`flex-1 py-1 rounded-full ${mode === "buy" ? "bg-white text-pine" : "text-slate"}`}>Buy</button>
          <button onClick={() => setMode("rent")} className={`flex-1 py-1 rounded-full ${mode === "rent" ? "bg-white text-pine" : "text-slate"}`}>Rent</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">
          <span className="font-semibold">{npr(price)}</span>
          {mode === "rent" && <span className="text-xs text-slate"> /day</span>}
        </div>
        <span className={`chip ${p.inStock ? "" : "!bg-border !text-slate"}`}>{p.inStock ? "In stock" : "Out"}</span>
      </div>

      <button
        disabled={!p.inStock}
        onClick={() => add({ id: p.id, name: p.name, type: mode === "rent" ? "rent" : p.category === "equipment" ? "buy" : p.category, price, image: p.emoji })}
        className="btn-primary !py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Add to cart
      </button>
    </div>
  );
}
