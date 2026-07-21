"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/cart";
import { useLang } from "@/context/i18n";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { npr } from "@/utils/format";
import { getProducts } from "@/services/api/products";
import type { Product } from "@/types";

const TABS = [
  { id: "equipment", key: "shopEquipment" },
  { id: "medicine", key: "shopMedicines" },
  { id: "nutrition", key: "shopNutrition" },
] as const;

export default function Shop() {
  const { t } = useLang();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("equipment");

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ["products", tab],
    queryFn: () => getProducts(tab),
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 p-1 bg-surface rounded-full w-fit">
        {TABS.map((tabItem) => (
          <button key={tabItem.id} onClick={() => setTab(tabItem.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === tabItem.id ? "bg-white text-secondary shadow-sm" : "text-text-light"}`}>{t(`patient_dashboard.${tabItem.key}`)}</button>
        ))}
        </div>
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { t } = useLang();
  const { add } = useCart();
  const [mode, setMode] = useState<"buy" | "rent">(p.category === "equipment" && p.rentPerDay ? "rent" : "buy");
  const price = mode === "rent" && p.rentPerDay ? p.rentPerDay : p.price;

  return (
    <div className="card-soft p-4 flex flex-col">
      <div className="aspect-square rounded-xl bg-surface grid place-items-center text-6xl mb-3">{p.emoji}</div>
      <div className="font-medium text-sm">{p.name}</div>
      <p className="text-xs text-text-light mt-0.5 mb-3 flex-1">{p.description}</p>

      {p.category === "equipment" && p.rentPerDay && (
        <div className="flex gap-1 p-0.5 bg-surface rounded-full mb-3 text-xs">
          <button onClick={() => setMode("buy")} className={`flex-1 py-1 rounded-full ${mode === "buy" ? "bg-white text-secondary" : "text-text-light"}`}>{t("patient_dashboard.buy")}</button>
          <button onClick={() => setMode("rent")} className={`flex-1 py-1 rounded-full ${mode === "rent" ? "bg-white text-secondary" : "text-text-light"}`}>{t("patient_dashboard.rent")}</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">
          <span className="font-semibold">{npr(price)}</span>
          {mode === "rent" && <span className="text-xs text-text-light">{t("patient_dashboard.perDay")}</span>}
        </div>
        <span className={`chip ${p.inStock ? "" : "!bg-border !text-text-light"}`}>{p.inStock ? t("patient_dashboard.inStock") : t("patient_dashboard.outOfStock")}</span>
      </div>

      <button
        disabled={!p.inStock}
        onClick={() => add({ productId: p.id, name: p.name, type: mode === "rent" ? "rent" : p.category === "equipment" ? "buy" : p.category === "medicine" ? "medicine" : "nutrition", price, image: p.emoji })}
        className="btn-primary !py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t("patient_dashboard.addToCart")}
      </button>
    </div>
  );
}
