"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Service, Platform, UserResponse, OrderResponse } from "@/lib/api";
import BuyModal from "@/components/BuyModal";
import DashboardLayout from "./layout";
import { SkeletonDashboardStats, SkeletonServiceGrid } from "@/components/Skeletons";

export default function DashboardHome() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [activePlatform, setActivePlatform] = useState<number | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<Service | null>(null);
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) { router.push("/login"); return; }
    setToken(t);

    Promise.all([
      api.me(t),
      api.get<Service[]>("/services", t).catch(() => [] as Service[]),
      api.get<Platform[]>("/platforms", t).catch(() => [] as Platform[]),
      api.get<OrderResponse[]>("/orders", t).catch(() => [] as OrderResponse[]),
    ])
      .then(([u, s, p, o]) => {
        setUser(u);
        setServices(s);
        setPlatforms(p);
        setOrders(o);
        if (p.length > 0) setActivePlatform(p[0].id);
      })
      .catch(() => {
        localStorage.removeItem("clou_token");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = activePlatform
    ? services.filter((s) => s.platform_id === activePlatform)
    : services;

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      in_progress: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
      error: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    const labels: Record<string, string> = {
      pending: "Pendente", processing: "Processando", in_progress: "Em Andamento",
      completed: "Concluído", cancelled: "Cancelado", error: "Erro",
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colors[status] || "bg-slate-500/10 text-slate-400"}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) return (
    <DashboardLayout>
      <SkeletonDashboardStats />
      <SkeletonServiceGrid count={4} />
    </DashboardLayout>
  );

  return (
    <>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Olá, {user?.name?.split(" ")[0] || "usuário"}! 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Saldo</p>
            <span className="text-xs text-slate-600">Disponível</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">R$ {user?.balance.toFixed(2)}</p>
          <Link href="/dashboard/deposit" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-2 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Depositar
          </Link>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Pedidos</p>
            <span className="text-xs text-slate-600">Total</span>
          </div>
          <p className="text-3xl font-bold text-white">{orders.length}</p>
          <p className="text-xs text-slate-600 mt-2">
            {orders.length === 0 ? "Nenhum pedido ainda" : `${orders.filter(o => o.status === "completed").length} concluídos`}
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Serviços</p>
            <span className="text-xs text-slate-600">Disponíveis</span>
          </div>
          <p className="text-3xl font-bold text-white">{services.length}</p>
          <Link href="/dashboard/comprar" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mt-2 transition-colors">
            Ver catálogo
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="glass-card p-5 bg-gradient-to-br from-amber-500/5 to-amber-500/0 border-amber-500/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Depósito Rápido</p>
            <span className="badge-amber text-[9px]">Pix</span>
          </div>
          <p className="text-sm text-slate-400 mb-3">Adicione saldo agora e comece a comprar</p>
          <Link href="/dashboard/deposit" className="btn-accent text-xs !py-1.5 !px-4 inline-block">
            Depositar via Pix
          </Link>
        </div>
      </div>

      {/* Quick Buy */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Comprar Serviços</h2>
          <Link href="/dashboard/comprar" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
            Ver todos →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activePlatform === p.id
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-800/50 text-slate-500 border border-slate-700/50 hover:border-slate-600"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.slice(0, 8).map((s) => {
            const displayPrice = `R$ ${s.price.toFixed(2).replace(".", ",")}`;
            return (
              <div key={s.id} className="glass-card-hover p-4">
                <h3 className="text-sm font-medium text-white mb-1">{s.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded">{s.min_amount}-{s.max_amount}</span>
                  <span className="text-[10px] text-slate-600">⏱ {s.avg_time}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/50">
                  <span className="text-sm font-bold text-white">{displayPrice}<span className="text-[10px] text-slate-500 font-normal">/mil</span></span>
                  <button onClick={() => setBuying(s)} className="btn-accent text-[10px] !py-1 !px-2.5">Comprar</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-600 text-sm">
              Nenhum serviço disponível para esta plataforma.
            </div>
          )}
        </div>
      </div>

      {/* Orders */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          {orders.length > 0 ? "Últimos Pedidos" : "Histórico de Pedidos"}
        </h2>

        {orders.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-500 text-sm mb-1">Nenhum pedido encontrado</p>
            <p className="text-xs text-slate-600 mb-4">Seus pedidos aparecerão aqui após a primeira compra</p>
            <Link href="/dashboard/comprar" className="btn-accent text-xs !py-2 !px-4 inline-block">
              Ver Serviços Disponíveis
            </Link>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Serviço</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Qtd</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{order.id}</td>
                    <td className="px-4 py-3 text-white text-xs">{order.service?.name || `Serviço #${order.service_id}`}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{order.quantity}</td>
                    <td className="px-4 py-3 text-emerald-400 text-xs font-medium">R$ {order.charge.toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(order.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Buy Modal */}
      <BuyModal
        service={buying}
        isOpen={!!buying}
        onClose={() => setBuying(null)}
        token={token}
        onSuccess={() => {
          const t = localStorage.getItem("clou_token");
          if (t) {
            api.get<OrderResponse[]>("/orders", t).then(setOrders).catch(() => {});
            api.me(t).then(setUser).catch(() => {});
          }
        }}
      />
    </>
  );
}
