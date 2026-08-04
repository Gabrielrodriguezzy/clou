import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import { instagramContent, instagramServiceTags } from "@/data/instagram-content";

interface ServiceData {
  id: number;
  name: string;
  description: string | null;
  price: number;
  min_amount: number;
  max_amount: number;
  avg_time: string;
  guarantee: string;
  slug: string;
  platform?: { id: number; name: string; slug: string };
  category?: { id: number; name: string };
}

async function getInstagramServices(): Promise<ServiceData[]> {
  const api =
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000/api";
  try {
    const res = await fetch(`${api}/services/by-platform/instagram`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      // fallback: fetch all and filter
      const all = await fetch(`${api}/services`, { next: { revalidate: 60 } });
      if (!all.ok) return [];
      const data: ServiceData[] = await all.json();
      return data.filter(
        (s) =>
          s.platform?.name?.toLowerCase().includes("instagram") ||
          s.slug?.includes("stories") ||
          s.slug?.includes("reels")
      );
    }
    return res.json();
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Instagram — Impulsione seu Perfil | Clou",
  description:
    "Compre seguidores brasileiros, curtidas instantâneas e visualizações para Instagram, Reels e Stories. Entrega rápida, pagamento via Pix, garantia de reposição.",
  keywords:
    "instagram, seguidores instagram, curtidas instagram, visualizações reels, comprar seguidores, engajamento instagram, smm",
  alternates: { canonical: "/instagram" },
  openGraph: {
    title: "Instagram — Impulsione seu Perfil | Clou",
    description:
      "Seguidores brasileiros, curtidas non-drop, visualizações para Reels e Stories. Resultados em minutos, pagamento via Pix.",
    url: "/instagram",
    siteName: "Clou",
    type: "website",
  },
};

const badgeStyles: Record<string, string> = {
  popular:
    "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30",
  "best-value":
    "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30",
  fast: "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30",
  guarantee:
    "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30",
};

function formatPrice(price: number): string {
  return price < 1
    ? `R$ ${(price * 1000).toFixed(2).replace(".", ",")}`
    : `R$ ${price.toFixed(2).replace(".", ",")}`;
}

export default async function InstagramPage() {
  const services = await getInstagramServices();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://cloustore.online";

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Serviços para Instagram — Clou",
    description:
      "Impulsione seu perfil do Instagram com seguidores, curtidas e visualizações. Entrega rápida, Pix, garantia.",
    url: `${baseUrl}/instagram`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: s.name,
          url: `${baseUrl}/servico/${s.slug}`,
          offers: {
            "@type": "Offer",
            price: s.price,
            priceCurrency: "BRL",
          },
        },
      })),
    },
  };

  // Group services by category
  const seguidores = services.filter(
    (s) => s.slug.includes("seguidores") || s.slug.includes("seguidores")
  );
  const curtidas = services.filter(
    (s) => s.slug.includes("curtidas")
  );
  const visualizacoes = services.filter(
    (s) => s.slug.includes("visualizacoes") || s.slug.includes("stories") || s.slug.includes("reels")
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <JsonLd data={schema} />

      {/* ════════════════════════════════════════════
          HERO — Instagram Branded
          ════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Gradiente Instagram no fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-pink-950/20 to-orange-950/30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-l from-pink-600/10 to-purple-600/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div>
              {/* Badge de plataforma */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/25 text-purple-300 text-xs font-medium mb-6">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" className="fill-purple-400/30 stroke-purple-400" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="4" className="stroke-purple-400" strokeWidth="1.5"/>
                  <circle cx="17.5" cy="6.5" r="1.5" className="fill-purple-400"/>
                </svg>
                Instagram
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  {instagramContent.hero.title}
                </span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl">
                {instagramContent.hero.subtitle}
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="#servicos" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-purple-600/25">
                  Ver Serviços Instagram
                </Link>
                <a
                  href="https://www.instagram.com/cloustore.oficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-slate-700/50 inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" className="stroke-current" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="4" className="stroke-current" strokeWidth="1.5"/>
                    <circle cx="17.5" cy="6.5" r="1.5" className="fill-current"/>
                  </svg>
                  @cloustore.oficial
                </a>
              </div>

              {/* Stats rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {instagramContent.hero.stats.map((stat, i) => (
                  <div key={i} className="glass-card p-3 text-center">
                    <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                {/* Phone body */}
                <div className="w-[280px] h-[560px] rounded-[3rem] bg-slate-900 border-4 border-slate-700 shadow-2xl shadow-purple-900/30 overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-10" />
                  {/* Screen */}
                  <div className="absolute inset-0 mt-6 mb-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                    {/* Profile preview */}
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                          C
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">cloustore.oficial</p>
                          <p className="text-[10px] text-slate-500">Clou • Loja Online</p>
                        </div>
                      </div>
                      {/* Bio */}
                      <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                        🚀 Impulsione seu Instagram, TikTok e YouTube
                        {"\n"}📦 Seguidores • Curtidas • Visualizações
                        {"\n"}💚 Pagamento via Pix
                      </p>
                      {/* Stats */}
                      <div className="flex justify-around mb-4 py-2 border-t border-b border-slate-800">
                        <div className="text-center">
                          <p className="text-xs font-bold text-white">33</p>
                          <p className="text-[8px] text-slate-600">Seguidores</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-white">8</p>
                          <p className="text-[8px] text-slate-600">Serviços</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-white">★</p>
                          <p className="text-[8px] text-slate-600">Online</p>
                        </div>
                      </div>
                      {/* Grid posts preview */}
                      <div className="grid grid-cols-3 gap-1">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-sm bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-orange-900/20 flex items-center justify-center"
                          >
                            {i === 1 && <span className="text-lg">🚀</span>}
                            {i === 2 && <span className="text-lg">💚</span>}
                            {i === 3 && <span className="text-lg">📦</span>}
                            {i === 4 && <span className="text-lg">⚡</span>}
                            {i === 5 && <span className="text-lg">🎯</span>}
                            {i === 6 && <span className="text-lg">🔥</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-700 rounded-full" />
                </div>
                {/* Glow atrás do phone */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-orange-500/20 blur-2xl -z-10 rounded-[4rem]" />
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-12 animate-bounce">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          GATILHOS PSICOLÓGICOS
          ════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Por que investir no Instagram?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Dados reais de mercado combinados com serviços profissionais
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {instagramContent.triggers.map((t, i) => (
            <div key={i} className="glass-card-hover p-5 animate-fade-in-up">
              <div className="text-2xl mb-3">{t.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-2">
                {t.title}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SERVIÇOS INSTAGRAM
          ════════════════════════════════════════════ */}
      <section id="servicos" className="max-w-6xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/25 text-purple-300 text-xs font-medium mb-4">
            📦 Catálogo Instagram
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Todos os Serviços para Instagram
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            {services.length} serviços especializados para cada necessidade do seu perfil
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Carregando serviços...</p>
          </div>
        ) : (
          <div>
            {/* Seguidores */}
            {seguidores.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>👥</span> Seguidores
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {seguidores.map((s) => {
                    const tag = instagramServiceTags[s.slug];
                    const variant = tag?.variant || "popular";
                    return (
                      <Link
                        key={s.id}
                        href={`/servico/${s.slug}`}
                        className="glass-card-hover p-5 flex flex-col group"
                      >
                        {tag && (
                          <span
                            className={`inline-flex self-start text-[10px] font-bold px-2.5 py-0.5 rounded-full border mb-3 uppercase tracking-wider ${
                              badgeStyles[variant]
                            }`}
                          >
                            {tag.badge}
                          </span>
                        )}
                        <h4 className="text-white font-semibold text-sm mb-2 group-hover:text-purple-300 transition-colors">
                          {s.name}
                        </h4>
                        <p className="text-xs text-slate-500 mb-3 flex-1">
                          {s.min_amount.toLocaleString()} -{" "}
                          {s.max_amount.toLocaleString()} un • ⏱ {s.avg_time}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {formatPrice(s.price)}
                            <span className="text-xs text-slate-600 font-normal">
                              /mil
                            </span>
                          </p>
                          <span className="text-purple-400/50 group-hover:text-purple-300 transition-colors text-xs">
                            Ver mais →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Curtidas */}
            {curtidas.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>❤️</span> Curtidas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {curtidas.map((s) => {
                    const tag = instagramServiceTags[s.slug];
                    const variant = tag?.variant || "popular";
                    return (
                      <Link
                        key={s.id}
                        href={`/servico/${s.slug}`}
                        className="glass-card-hover p-5 flex flex-col group"
                      >
                        {tag && (
                          <span
                            className={`inline-flex self-start text-[10px] font-bold px-2.5 py-0.5 rounded-full border mb-3 uppercase tracking-wider ${
                              badgeStyles[variant]
                            }`}
                          >
                            {tag.badge}
                          </span>
                        )}
                        <h4 className="text-white font-semibold text-sm mb-2 group-hover:text-pink-300 transition-colors">
                          {s.name}
                        </h4>
                        <p className="text-xs text-slate-500 mb-3 flex-1">
                          {s.min_amount.toLocaleString()} -{" "}
                          {s.max_amount.toLocaleString()} un • ⏱ {s.avg_time}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                            {formatPrice(s.price)}
                            <span className="text-xs text-slate-600 font-normal">
                              /mil
                            </span>
                          </p>
                          <span className="text-pink-400/50 group-hover:text-pink-300 transition-colors text-xs">
                            Ver mais →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Visualizações */}
            {visualizacoes.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🎬</span> Visualizações
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visualizacoes.map((s) => {
                    const tag = instagramServiceTags[s.slug];
                    const variant = tag?.variant || "popular";
                    return (
                      <Link
                        key={s.id}
                        href={`/servico/${s.slug}`}
                        className="glass-card-hover p-5 flex flex-col group"
                      >
                        {tag && (
                          <span
                            className={`inline-flex self-start text-[10px] font-bold px-2.5 py-0.5 rounded-full border mb-3 uppercase tracking-wider ${
                              badgeStyles[variant]
                            }`}
                          >
                            {tag.badge}
                          </span>
                        )}
                        <h4 className="text-white font-semibold text-sm mb-2 group-hover:text-cyan-300 transition-colors">
                          {s.name}
                        </h4>
                        <p className="text-xs text-slate-500 mb-3 flex-1">
                          {s.min_amount.toLocaleString()} -{" "}
                          {s.max_amount.toLocaleString()} un • ⏱ {s.avg_time}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            {formatPrice(s.price)}
                            <span className="text-xs text-slate-600 font-normal">
                              /mil
                            </span>
                          </p>
                          <span className="text-cyan-400/50 group-hover:text-cyan-300 transition-colors text-xs">
                            Ver mais →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════
          GUIA — QUANTO VOCÊ PRECISA?
          ════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Quanto você precisa?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Cada objetivo tem o serviço certo. Veja o que combina com você
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {instagramContent.guide.map((g, i) => (
            <div
              key={i}
              className="glass-card p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-600/5 to-transparent rounded-bl-full pointer-events-none" />
              <div className="text-3xl mb-3">{g.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-1">
                {g.title}
              </h3>
              <p className="text-xs text-slate-500 mb-4">{g.desc}</p>
              <ul className="space-y-2 mb-6">
                {g.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-sm text-slate-400 flex items-start gap-2"
                  >
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={`/servico/${g.anchor}`}
                className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 px-4 rounded-lg inline-block transition-all duration-200 shadow-lg shadow-purple-600/20"
              >
                {g.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          VÍDEO PLACEHOLDER
          ════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Como fazer um pedido no Clou
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Veja no vídeo abaixo como é fácil comprar seguidores, curtidas e
            visualizações
          </p>
        </div>

        <div className="glass-card p-4 relative overflow-hidden">
          {/* Video container */}
          <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative group cursor-pointer border border-slate-700/50">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 to-transparent pointer-events-none" />

            {/* Play button */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-600/30 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            {/* Text overlay */}
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <p className="text-white font-semibold text-sm">
                Tutorial completo — Como comprar no Clou
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Vídeo em breve • Mostra o passo a passo do cadastro ao pedido
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FAQ — Instagram
          ════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Perguntas Frequentes — Instagram
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Tire suas dúvidas sobre nossos serviços para Instagram
          </p>
        </div>

        <div className="space-y-2">
          {instagramContent.faq.map((item, i) => (
            <details
              key={i}
              className="glass-card p-4 group cursor-pointer"
            >
              <summary className="text-sm font-medium text-slate-300 list-none flex items-center justify-between gap-4">
                {item.q}
                <svg
                  className="w-4 h-4 text-slate-600 shrink-0 group-open:rotate-180 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA FINAL
          ════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="glass-card relative overflow-hidden p-8 sm:p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/5 to-orange-600/5 pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/25 text-purple-300 text-xs font-medium mb-4">
              📱 Instagram
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Pronto para crescer no Instagram?
            </h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">
              Crie sua conta agora, deposite via Pix e escolha o serviço ideal
              para seu perfil. Resultados em minutos.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg shadow-purple-600/25"
              >
                Criar Conta Grátis
              </Link>
              <a
                href="https://www.instagram.com/cloustore.oficial"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-slate-700/50 inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" className="stroke-current" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="4" className="stroke-current" strokeWidth="1.5"/>
                  <circle cx="17.5" cy="6.5" r="1.5" className="fill-current"/>
                </svg>
                Seguir @cloustore.oficial
              </a>
            </div>
            <p className="text-xs text-slate-600 mt-4">
              ✅ Sem cartão de crédito • 💚 Pagamento via Pix • 🛡️ Garantia em
              todos os serviços
            </p>
          </div>
        </div>
      </section>

      {/* Footer simples */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-700">
            Clou © 2026 • Feito para impulsionar seu crescimento digital
          </p>
        </div>
      </footer>
    </div>
  );
}