import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import ThemeProvider from "@/components/ThemeProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cloustore.online";

export const metadata: Metadata = {
  title: {
    default: "Clou — Impulsione suas Redes Sociais",
    template: "%s",
  },
  description:
    "Compre seguidores, curtidas e visualizações para Instagram, TikTok, YouTube e mais. Entrega rápida, pagamento via Pix.",
  keywords: "seguidores, curtidas, visualizações, instagram, tiktok, youtube, smm panel",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Clou — Impulsione suas Redes Sociais",
    description:
      "Compre seguidores, curtidas e visualizações para Instagram, TikTok, YouTube e mais. Entrega rápida, pagamento via Pix.",
    type: "website",
    locale: "pt_BR",
    siteName: "Clou",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clou — Impulsione suas Redes Sociais",
    description:
      "Compre seguidores, curtidas e visualizações para Instagram, TikTok, YouTube e mais. Entrega rápida, pagamento via Pix.",
  },
  icons: {
    icon: [{ url: "/logo-clou.png", type: "image/png", sizes: "1024x1024" }],
    apple: [{ url: "/logo-clou.png", sizes: "1024x1024" }],
    shortcut: "/logo-clou.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Clou",
  url: baseUrl,
  description:
    "Plataforma de impulsionamento digital. Compre seguidores, curtidas e visualizações para Instagram, TikTok, YouTube e Telegram.",
  foundingDate: "2026",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Franco da Rocha",
    addressRegion: "SP",
    addressCountry: "BR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="dns-prefetch" href="https://clou-production.up.railway.app" />
        <link rel="preconnect" href="https://clou-production.up.railway.app" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <meta name="google-site-verification" content="ErbeQPJdU6exlWUO5K-dj5htDYmt1wnxyxCUnkmOC8c" />
      </head>
      <body className="antialiased min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-gray-200 transition-colors" style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}>
        <ThemeProvider>
          <GoogleAnalytics />
          <JsonLd data={organizationSchema} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
