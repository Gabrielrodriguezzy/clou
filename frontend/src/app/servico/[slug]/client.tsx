"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import BuyModal from "@/components/BuyModal";

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

export default function ServicePageClient({ service, slug }: { service: ServiceData | null; slug: string }) {
  const [token, setToken] = useState("");
  const [buying, setBuying] = useState<ServiceData | null>(null);
  const router = useRouter();

  useEffect(() => {
    setToken(localStorage.getItem("clou_token") || "");
  }, []);

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-white mb-2">Serviço não encontrado</h1>
          <p className="text-slate-500 text-sm mb-6">O serviço que você procura não existe ou foi removido.</p>
          <Link href="/" className="btn-primary text-sm !py-2 !px-4">Ver Catálogo</Link>
        </div>
      </div>
    );
  }

  const displayPrice = service.price < 1
    ? `R$ ${(service.price * 1000).toFixed(2).replace(".", ",")}`
    : `R$ ${service.price.toFixed(2).replace(".", ",")}`;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-600 mb-8">
          <Link href="/" className="hover:text-slate-400">Início</Link>
          <span>/</span>
          {service.platform && (
            <>
              <Link href={`/?platform=${service.platform.slug}`} className="hover:text-slate-400">{service.platform.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-400">{service.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info */}
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold text-white mb-3">{service.name}</h1>
            {service.description && (
              <p className="text-slate-400 leading-relaxed mb-6">{service.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">Preço</p>
                <p className="text-lg font-bold text-emerald-400">{displayPrice}<span className="text-xs text-slate-500 font-normal">/mil</span></p>
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
              <div className="glass-card p-4 flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="text-sm font-medium text-white">Garantia</p>
                  <p className="text-xs text-slate-500">{service.guarantee}</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA Card */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 sticky top-24">
              <p className="text-xs text-slate-500 mb-1">A partir de</p>
              <p className="text-4xl font-bold text-white mb-1">{displayPrice}<span className="text-sm text-slate-500 font-normal">/mil</span></p>
              <p className="text-xs text-slate-600 mb-6">{service.min_amount} - {service.max_amount} unidades • ⏱ {service.avg_time}</p>
              <button
                onClick={() => setBuying(service)}
                className="btn-accent w-full !py-3 mb-3"
              >
                Comprar Agora
              </button>
              <p className="text-xs text-slate-600 text-center">✅ Pagamento via Pix • Entrega rápida</p>

              <div className="mt-6 pt-4 border-t border-slate-800/50 text-xs text-slate-600 space-y-2">
                <p className="flex items-center gap-2">🔗 Informe apenas o link do perfil</p>
                <p className="flex items-center gap-2">💚 Pagamento 100% seguro</p>
                <p className="flex items-center gap-2">🛡️ Garantia de {service.guarantee?.toLowerCase() || "reposição"}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BuyModal
        service={buying}
        isOpen={!!buying}
        onClose={() => setBuying(null)}
        token={token}
      />
    </div>
  );
}
