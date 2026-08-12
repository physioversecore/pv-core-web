"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/context/auth";
import { AuthModalProvider } from "@/context/auth-modal";
import { BookingBadgeProvider } from "@/context/booking-badge";
import { ComplaintBadgeProvider } from "@/context/complaint-badge";
import { CartProvider } from "@/context/cart";
import { LangProvider } from "@/context/i18n";
import type { Lang } from "@/translations";
import { DesignTokensProvider } from "@/context/design-tokens";
import { Toaster } from "sonner";

export function Providers({
  children,
  initialLang = "en",
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DesignTokensProvider>
        <LangProvider initialLang={initialLang}>
          <AuthProvider>
            <CartProvider>
              <BookingBadgeProvider>
                <ComplaintBadgeProvider>
                  <AuthModalProvider>
                    {children}
                    <Toaster position="bottom-right" richColors closeButton />
                  </AuthModalProvider>
                </ComplaintBadgeProvider>
              </BookingBadgeProvider>
            </CartProvider>
          </AuthProvider>
        </LangProvider>
      </DesignTokensProvider>
    </QueryClientProvider>
  );
}
