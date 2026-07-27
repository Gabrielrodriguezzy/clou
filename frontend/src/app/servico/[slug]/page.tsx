import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import BuyButton from "@/components/BuyButton";
import { getServiceContent, getDescriptionFallback } from "@/data/service-content";

interface Props {
  params: { slug: string };
}

interface ServiceData {
  id: number;
  name: string;
  description: string | null;
  price: number;
  min_amount: number;
  max_amount: number;
  avg_time: string;
  guarantee: string;
  platform?: { id: number; name: string; slug: string };
  category?: { id: number; name: string };
}

async function getService(slug: string) {
  const api = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  try {
    const res = await fetch(`${api}/services/by-slug/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService(params.slug);
  if (!service) return { title: "Serviço não encontrado — Clou" };

  const price = service.price < 1
    ? `R$ ${(service.price * 1000).toFixed(2).replace(".", ",")}/100`
    : `R$ ${service.price.toFixed(2).replace(".", ",")}/mil`;

  const rc = getServiceContent(params.slug);
  const metaDesc = rc?.description || getDescriptionFallback(params.slug, service.name) || service.description || `Compre ${service.name.toLowerCase()} para ${service.platform?.name || "redes sociais"}. Entrega rápida, pagamento via Pix. A partir de ${price}.`;
  const ogDesc = rc?.description ? rc.description.slice(0, 150) : `Impulsione seu ${service.platform?.name || "perfil"} com ${service.name.toLowerCase()}. Entrega rápida, pagamento via Pix.`;

  return {
    title: `${service.name} — Clou`,
    description: metaDesc,
    keywords: rc?.keywords?.join(", ") || `${service.name.toLowerCase()}, ${service.platform?.name?.toLowerCase() || ""}, comprar seguidores, curtidas, visualizações, smm panel brasil`,
    alternates: { canonical: `/servico/${params.slug}` },
    openGraph: {
      title: `${service.name} — Clou`,
      description: ogDesc,
      url: `/servico/${params.slug}`,
      siteName: "Clou",
      type: "website",
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const service: ServiceData | null = await getService(params.slug);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cloustore.online";
  const rc = getServiceContent(params.slug);

  // Schema Product
  const productSchema = rc ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: service?.name || "",
    description: rc.description || service?.description || "",
    url: `${baseUrl}/servico/${params.slug}`,
    category: service?.platform?.name || "Redes Sociais",
    offers: {
      "@type": "Offer",
      price: service?.price || 0,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/servico/${params.slug}`,
    },
  } : null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      {productSchema && <JsonLd data={productSchema} />}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {!service ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h1 className="text-xl font-bold text-white mb-2">Serviço não encontrado</h1>
            <p className="text-slate-500 text-sm mb-6">O serviço que você procura não existe ou foi removido.</p>
            <Link href="/" className="btn-primary text-sm !py-2 !px-4 inline-block">Ver Catálogo</Link>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-600 mb-8">
              <Link href="/" className="hover:text-slate-400">Início</Link>
              <span>/</span>
              {service.platform && (
                <><Link href={`/?platform=${service.platform.slug}`} className="hover:text-slate-400">{service.platform.name}</Link><span>/</span></>
              )}
              <span className="text-slate-400">{service.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Info */}
              <div className="lg:col-span-3">
                <h1 className="text-3xl font-bold text-white mb-3">{service.name}</h1>

                {rc?.description && (
                  <p className="text-slate-400 leading-relaxed mb-6">{rc.description}</p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">Preço</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {service.price < 1
                        ? `R$ ${(service.price * 1000).toFixed(2).replace(".", ",")}`
                        : `R$ ${service.price.toFixed(2).replace(".", ",")}`}
                      <span className="text-xs text-slate-500 font-normal">/mil</span>
                    </p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">Mínimo</p>
                    <p className="text-lg font-bold text-white">{service.min_amount}</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">Máximo</p>
                    <p className="text-lg font-bold text-white">{service.max_amount.toLocaleString()}</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">Entrega</p>
                    <p className="text-lg font-bold text-white">{service.avg_time}</p>
                  </div>
                </div>

                {service.guarantee && (
                  <div className="glass-card p-4 flex items-center gap-3 mb-8">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <p className="text-sm font-medium text-white">Garantia</p>
                      <p className="text-xs text-slate-500">{service.guarantee}</p>
                    </div>
                  </div>
                )}

                {/* Benefícios (SSR) */}
                {rc?.benefits && rc.benefits.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Benefícios</h2>
                    <ul className="space-y-2">
                      {rc.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* FAQ (SSR) */}
                {rc?.faq && rc.faq.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Perguntas Frequentes</h2>
                    <div className="space-y-2">
                      {rc.faq.map((item, i) => (
                        <details key={i} className="glass-card p-4 group cursor-pointer">
                          <summary className="text-sm font-medium text-slate-300 list-none flex items-center justify-between gap-4">
                            {item.q}
                            <svg className="w-4 h-4 text-slate-600 shrink-0 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.a}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Card */}
              <div className="lg:col-span-2">
                <div className="glass-card p-6 sticky top-24">
                  <p className="text-xs text-slate-500 mb-1">A partir de</p>
                  <p className="text-4xl font-bold text-white mb-1">
                    {service.price < 1
                      ? `R$ ${(service.price * 1000).toFixed(2).replace(".", ",")}`
                      : `R$ ${service.price.toFixed(2).replace(".", ",")}`}
                    <span className="text-sm text-slate-500 font-normal">/mil</span>
                  </p>
                  <p className="text-xs text-slate-600 mb-6">{service.min_amount} - {service.max_amount} unidades • ⏱ {service.avg_time}</p>

                  <BuyButton service={service} token="" />

                  <p className="text-xs text-slate-600 text-center">✅ Pagamento via Pix • Entrega rápida</p>
                  <div className="mt-6 pt-4 border-t border-slate-800/50 text-xs text-slate-600 space-y-2">
                    <p className="flex items-center gap-2">🔗 Informe apenas o link do perfil</p>
                    <p className="flex items-center gap-2">💚 Pagamento 100% seguro</p>
                    <p className="flex items-center gap-2">🛡️ Garantia de {service.guarantee?.toLowerCase() || "reposição"}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
