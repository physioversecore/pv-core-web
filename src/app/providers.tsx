"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { LangProvider } from "@/lib/i18n";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
          </CartProvider>
        </AuthProvider>
      </LangProvider>
    </QueryClientProvider>
  );
}
