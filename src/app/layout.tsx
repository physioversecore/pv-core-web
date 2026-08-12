import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Anybody, Archivo_Narrow, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const fontDisplay = Anybody({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-display-loaded",
  display: "optional",
});

const fontSans = Archivo_Narrow({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-sans-loaded",
  display: "optional",
});

const fontMono = Space_Grotesk({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-mono-loaded",
  display: "optional",
});

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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const initialLang = cookieStore.get("sahayatri.lang")?.value === "ne" ? "ne" : "en";

  return (
    <html lang={initialLang} suppressHydrationWarning>
      <body className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}>
        <Providers initialLang={initialLang}>{children}</Providers>
      </body>
    </html>
  );
}
