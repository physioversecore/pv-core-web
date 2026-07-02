"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { LogOut, Menu, ShoppingCart, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { Avatar } from "./Avatar";
import { CartDrawer } from "./CartDrawer";
import { NotificationBell } from "./NotificationBell";
import { LangSwitcher } from "@/lib/i18n";
import type { NavItem } from "@/lib/nav";

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
  const { user, logout } = useAuth();
  const { count, setOpen } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-pine text-white flex flex-col transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-amber" />
            <span className="font-display text-lg">Sahayatri</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1"><X size={18} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== nav[0].to && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                href={n.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="w-5 grid place-items-center">{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={user?.name ?? "User"} size={36} />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.name ?? "Guest"}</div>
              <div className="text-xs text-white/60 capitalize">{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/80 hover:bg-white/10">
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-cream border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-sage"><Menu size={18} /></button>
            <h1 className="font-display text-xl truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            {user && <NotificationBell role={user.role} />}
            {showCart && (
              <button onClick={() => setOpen(true)} className="relative p-2.5 rounded-full hover:bg-sage" aria-label="Cart">
                <ShoppingCart size={18} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-amber text-white text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center">{count}</span>
                )}
              </button>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>

      {showCart && <CartDrawer />}
    </div>
  );
}
