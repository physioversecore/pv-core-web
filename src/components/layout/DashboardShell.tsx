"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState, useEffect } from "react";
import { LogOut, Menu, ShoppingCart, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { Avatar } from "@/components/common/Avatar";
import { CartDrawer } from "@/components/modals/CartDrawer";
import { NotificationBell } from "@/components/common/NotificationBell";
import { LangSwitcher } from "@/components/common/LangSwitcher";
import { useLang } from "@/context/i18n";
import type { NavItem } from "@/types";

export function DashboardShell({
  title,
  nav,
  children,
  showCart = false,
}: {
  title: string;
  nav: NavItem[];
  children: ReactNode;
  showCart?: boolean;
}) {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const SIDEBAR_W = collapsed ? "w-[68px]" : "w-64";

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-40 ${SIDEBAR_W} bg-secondary text-text-inverse flex flex-col transition-all duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${mobileOpen ? "" : "lg:fixed"}`}
      >
        <div className={`p-5 flex items-center ${collapsed ? "justify-center" : "justify-between"} border-b border-text-inverse/10 shrink-0`}>
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <span className="w-7 h-7 rounded-full bg-primary shrink-0" />
            {!collapsed && <span className="font-display text-lg whitespace-nowrap">{t("header.brand")}</span>}
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1"><X size={18} /></button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-gutter-stable scrollbar-none">
          {nav.map((n, i) => {
            const active = pathname === n.to || (n.to !== nav[0].to && pathname.startsWith(n.to));
            const prevGroup = i > 0 ? nav[i - 1].group : undefined;
            const showGroupLabel = n.group && n.group !== prevGroup && !collapsed;
            return (
              <div key={n.to}>
                {showGroupLabel && (
                  <div className="eyebrow mt-3 mb-1 px-3 text-text-inverse/50">{n.group}</div>
                )}
                <Link
                  href={n.to}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? n.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    active ? "bg-text-inverse/15 text-text-inverse" : "text-text-inverse/70 hover:bg-text-inverse/10 hover:text-text-inverse"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                >
                  <span className="w-5 grid place-items-center shrink-0">{n.icon}</span>
                  {!collapsed && (
                    <>
                      {n.label}
                      {n.badge != null && (
                        <span className="ml-auto bg-primary/20 text-primary text-[10px] font-bold min-w-[18px] h-[18px] rounded-full grid place-items-center font-mono">
                          {n.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && n.badge != null && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-text-inverse/10 shrink-0">
          <div className={`p-4 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <Avatar name={user?.name ?? "User"} size={collapsed ? 32 : 36} src={user?.photo} />
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{user?.name ?? "Guest"}</div>
                <div className="text-xs text-text-inverse/60 capitalize">{user?.role}</div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2"} px-3 py-2 rounded-xl text-sm text-text-inverse/80 hover:bg-text-inverse/10 transition-colors cursor-pointer`}
            title={collapsed ? t("common.logOut") : undefined}
          >
            <LogOut size={15} /> {!collapsed && t("common.logOut")}
          </button>
        </div>
      </aside>

      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-200 ${collapsed ? "lg:ml-[68px]" : "lg:ml-64"}`}>
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 backdrop-blur shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-surface"><Menu size={18} /></button>
            <button
              onClick={toggleCollapsed}
              className="hidden lg:grid place-items-center p-2 rounded-lg hover:bg-surface text-foreground/60 transition-colors cursor-pointer"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <h1 className="font-display text-xl truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            {user && <NotificationBell role={user.role} />}
            {showCart && (
              <button onClick={() => setOpen(true)} className="relative p-2.5 rounded-full hover:bg-surface" aria-label={t("cart.title")}>
                <ShoppingCart size={18} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-text-inverse text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center">{count}</span>
                )}
              </button>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto scrollbar-gutter-stable">{children}</main>
      </div>

      {showCart && <CartDrawer />}
    </div>
  );
}
