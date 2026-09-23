import Pwa from "./pwa";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ateliê de Preços • By Carolla",
  description: "Calcule custos, encontre seu preço de venda e organize suas peças com fotos.",
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icon-192.png",
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {themeColor: "#268f80"};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}<Pwa/></body>
    </html>
  );
}
