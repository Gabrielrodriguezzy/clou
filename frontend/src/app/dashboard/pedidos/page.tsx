"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { SkeletonTable } from "@/components/Skeletons";

interface Order {
  id: number;
  service_id: number;
  link: string;
  quantity: number;
  charge: number;
  status: string;
  start_count: number | null;
  remains: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  service?: { name: string };
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  pending:      { label: "Pendente",     color: "bg-amber-500/10 text-amber-400 border-amber-500/20",   icon: "⏳" },
  processing:   { label: "Processando",  color: "bg-blue-500/10 text-blue-400 border-blue-500/20",     icon: "⚙️" },
  in_progress:  { label: "Em Andamento", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",     icon: "📈" },
  completed:    { label: "Concluído",    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: "✅" },
  partial:      { label: "Parcial",      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",   icon: "⚠️" },
  cancelled:    { label: "Cancelado",    color: "bg-red-500/10 text-red-400 border-red-500/20",        icon: "❌" },
  refunded:     { label: "Reembolsado",  color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: "💸" },
  error:        { label: "Erro",         color: "bg-red-500/10 text-red-400 border-red-500/20",        icon: "🔴" },
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todos");
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) { router.push("/login"); return; }
    setToken(t);
    loadOrders(t);
  }, [router]);

  async function loadOrders(t: string) {
    try {
      const data = await api.get<Order[]>("/orders", t);
      setOrders(data);
    } catch {
      // se falhar, array vazio
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "todos"
    ? orders
    : orders.filter((o) => o.status === filter);

  const totalPedidos = orders.length;
  const concluidos = orders.filter((o) => o.status === "completed").length;
  const pendentes = orders.filter((o) => o.status === "pending" || o.status === "processing" || o.status === "in_progress").length;
  const totalGasto = orders.reduce((acc, o) => acc + o.charge, 0);

  const filters = [
    { key: "todos", label: "Todos", count: orders.length },
    { key: "pending", label: "Pendentes", count: orders.filter(o => o.status === "pending").length },
    { key: "processing", label: "Processando", count: orders.filter(o => o.status === "processing" || o.status === "in_progress").length },
    { key: "completed", label: "Concluídos", count: concluidos },
    { key: "cancelled", label: "Cancelados", count: orders.filter(o => o.status === "cancelled" || o.status === "refunded").length },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Meus Pedidos</h1>
        <p className="text-slate-500 text-sm mt-1">Acompanhe todos os seus pedidos realizados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{totalPedidos}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Concluídos</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{concluidos}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Em Andamento</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendentes}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Gasto</p>
          <p className="text-2xl font-bold text-white mt-1">R$ {totalGasto.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filter === f.key
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-slate-800/50 text-slate-500 border border-slate-700/50 hover:border-slate-600"
            }`}
          >
            {f.label}
            <span className="text-[10px] text-slate-600">({f.count})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-slate-500 text-sm mb-1">Nenhum pedido encontrado</p>
          <p className="text-xs text-slate-600 mb-6">
            {filter === "todos"
              ? "Você ainda não fez nenhum pedido"
              : `Nenhum pedido com o filtro "${filter}"`}
          </p>
          <Link href="/dashboard/comprar" className="btn-accent text-xs !py-2 !px-4 inline-block">
            Comprar Serviços
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.error;
            return (
              <div key={order.id} className="glass-card-hover p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-600">#{order.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium inline-flex items-center gap-1 ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">
                      {order.service?.name || `Serviço #${order.service_id}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                      <span>🔗 {order.link.length > 40 ? order.link.slice(0, 40) + "..." : order.link}</span>
                      <span>📦 {order.quantity} unidades</span>
                      <span>💰 R$ {order.charge.toFixed(2)}</span>
                      <span>📅 {new Date(order.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>

                  {/* Progress / Details */}
                  <div className="flex items-center gap-3 shrink-0">
                    {order.status === "in_progress" && order.remains !== null && (
                      <div className="text-right">
                        <p className="text-[10px] text-slate-600">Restante</p>
                        <p className="text-sm font-semibold text-amber-400">{order.remains}</p>
                      </div>
                    )}
                    {order.status === "completed" && (
                      <div className="text-right">
                        <p className="text-[10px] text-slate-600">Entregue</p>
                        <p className="text-sm font-semibold text-emerald-400">{order.quantity}</p>
                      </div>
                    )}
                    <Link href={`/pedido/${order.id}`} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                      Detalhes
                    </Link>
                  </div>
                </div>

                {/* Progress bar for in_progress */}
                {(order.status === "in_progress" || order.status === "processing") && order.start_count && order.remains !== null && (
                  <div className="mt-3">
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((order.quantity - order.remains) / order.quantity) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                      <span>{order.quantity - (order.remains || 0)} entregues</span>
                      <span>{order.remains} restantes</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
