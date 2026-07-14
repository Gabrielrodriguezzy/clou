import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clou — Impulsione suas Redes Sociais",
  description:
    "Compre seguidores, curtidas e visualizações para Instagram, TikTok, YouTube e mais. Entrega rápida, pagamento via Pix.",
  keywords: "seguidores, curtidas, visualizações, instagram, tiktok, youtube, smm panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
