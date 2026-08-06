"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SkeletonServiceGrid } from "@/components/Skeletons";
import { api, Service, Platform } from "@/lib/api";
import BuyModal from "@/components/BuyModal";

export default function ComprarPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [activePlatform, setActivePlatform] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<Service | null>(null);
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) { router.push("/login"); return; }
    setToken(t);
    Promise.all([
      api.get<Service[]>("/services", t),
      api.get<Platform[]>("/platforms", t),
    ]).then(([s, p]) => {
      setServices(s);
      setPlatforms(p);
      if (p.length > 0) setActivePlatform(p[0].id);
    }).finally(() => setLoading(false));
  }, [router]);

  const filtered = activePlatform
    ? services.filter((s) => s.platform_id === activePlatform)
    : services;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Comprar Serviços</h1>
        <p className="text-slate-500 text-sm mt-1">Escolha o serviço ideal para impulsionar suas redes</p>
      </div>

      {/* Platform Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePlatform(p.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activePlatform === p.id
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonServiceGrid count={8} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((s) => {
            const displayPrice = `R$ ${s.price.toFixed(2).replace(".", ",")}`;
            return (
              <div key={s.id} className="glass-card-hover p-5">
                <h3 className="text-sm font-semibold text-white mb-1">{s.name}</h3>
                {s.description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{s.description}</p>
                )}
                <div className="flex items-center gap-2 mb-3 text-[10px] text-slate-600">
                  <span className="bg-slate-800/50 px-2 py-0.5 rounded">{s.min_amount}-{s.max_amount}</span>
                  <span>⏱ {s.avg_time}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                  <span className="text-lg font-bold text-white">{displayPrice}<span className="text-xs text-slate-500 font-normal">/mil</span></span>
                  <button onClick={() => setBuying(s)} className="btn-accent text-xs !py-1.5 !px-3">Comprar</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-600 text-sm">
              Nenhum serviço disponível para esta plataforma.
            </div>
          )}
        </div>
      )}

      {/* Buy Modal */}
      <BuyModal
        service={buying}
        isOpen={!!buying}
        onClose={() => setBuying(null)}
        token={token}
      />
    </>
  );
}
