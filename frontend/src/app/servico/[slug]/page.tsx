import { Metadata } from "next";
import ServicePageClient from "./client";

interface Props {
  params: { slug: string };
}

async function getService(slug: string) {
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
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

  return {
    title: `${service.name} — Clou`,
    description: service.description || `Compre ${service.name.toLowerCase()} para ${service.platform?.name || "redes sociais"}. Entrega rápida, pagamento via Pix. A partir de ${price}.`,
    keywords: `${service.name.toLowerCase()}, ${service.platform?.name?.toLowerCase() || ""}, comprar seguidores, curtidas, visualizações, smm panel brasil`,
    openGraph: {
      title: `${service.name} — Clou`,
      description: `Impulsione seu ${service.platform?.name || "perfil"} com ${service.name.toLowerCase()}. Entrega rápida, pagamento via Pix.`,
      siteName: "Clou",
      type: "website",
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const service = await getService(params.slug);
  return <ServicePageClient service={service} slug={params.slug} />;
}
