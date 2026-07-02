import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Sahayatri Physio — Recovery, at your doorstep",
  description: "Home-visit physiotherapy across Nepal. Book verified, licensed therapists in Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan, and Biratnagar.",
  openGraph: {
    title: "Sahayatri Physio — Recovery, at your doorstep",
    description: "Home-visit physiotherapy across Nepal. Book verified, licensed therapists in Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan, and Biratnagar.",
    type: "website",
    images: ["https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3d58e288-5100-47fc-a806-b0615ca30d95/id-preview-21e2878f--4ee44ee8-1aa5-4a7c-9806-82a8487bb1a3.lovable.app-1782624458375.png"],
  },
  twitter: {
    card: "summary",
    title: "Sahayatri Physio — Recovery, at your doorstep",
    description: "Home-visit physiotherapy across Nepal. Book verified, licensed therapists in Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan, and Biratnagar.",
    images: ["https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3d58e288-5100-47fc-a806-b0615ca30d95/id-preview-21e2878f--4ee44ee8-1aa5-4a7c-9806-82a8487bb1a3.lovable.app-1782624458375.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
