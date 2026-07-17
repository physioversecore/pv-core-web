"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/context/auth";
import { AuthModalProvider } from "@/context/auth-modal";
import { CartProvider } from "@/context/cart";
import { LangProvider } from "@/context/i18n";
import { DesignTokensProvider } from "@/context/design-tokens";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DesignTokensProvider>
        <LangProvider>
          <AuthProvider>
            <CartProvider>
              <AuthModalProvider>
                {children}
                <Toaster position="bottom-right" richColors closeButton />
              </AuthModalProvider>
            </CartProvider>
          </AuthProvider>
        </LangProvider>
      </DesignTokensProvider>
    </QueryClientProvider>
  );
}
