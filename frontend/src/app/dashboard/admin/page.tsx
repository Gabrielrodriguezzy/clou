"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface AdminStats {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  total_services: number;
  pending_orders: number;
  total_profit: number;
}

interface RecentOrder {
  id: number;
  user_name: string;
  service_name: string;
  charge: number;
  cost: number;
  status: string;
  created_at: string;
}

export default function AdminHome() {
  const [token, setToken] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) return;
    setToken(t);
    loadData(t);
  }, []);

  async function loadData(t: string) {
    try {
      const [allOrders, services] = await Promise.all([
        api.get<any[]>("/admin/orders?limit=500", t).catch(() => [] as any[]),
        api.get<any[]>("/services").catch(() => [] as any[]),
      ]);
      const orders = allOrders || [];

      // Últimos 5 pedidos
      setRecentOrders(orders.slice(0, 5).map((o: any) => ({
        id: o.id, user_name: o.user_name || `#${o.user_id}`,
        service_name: o.service_name, charge: o.charge, cost: o.cost || 0,
        status: o.status, created_at: o.created_at,
      })));

      // Calcular stats
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
      const revenue = orders
        .filter((o: any) => ["completed", "in_progress", "processing", "partial"].includes(o.status))
        .reduce((sum: number, o: any) => sum + (o.charge || 0), 0);
      const cost = orders
        .filter((o: any) => ["completed", "in_progress", "processing", "partial"].includes(o.status))
        .reduce((sum: number, o: any) => sum + (o.cost || 0), 0);

      // Total de usuários via users únicos nos pedidos + pedido count
      const uniqueUserIds = new Set(orders.map((o: any) => o.user_id));
      const totalUsers = uniqueUserIds.size > 0 ? uniqueUserIds.size + 1 : 0; // +1 pro admin

      setStats({
        total_users: totalUsers,
        total_orders: totalOrders,
        total_revenue: Math.round(revenue * 100) / 100,
        total_services: (services || []).length,
        pending_orders: pendingOrders,
        total_profit: Math.round((revenue - cost) * 100) / 100,
      });
    } catch {
      setStats({ total_users: 0, total_orders: 0, total_revenue: 0, total_services: 0, pending_orders: 0, total_profit: 0 });
    } finally {
      setLoading(false);
    }
  }

  const StatCard = ({ title, value, sub, color = "text-white" }: { title: string; value: string; sub?: string; color?: string }) => (
    <div className="glass-card p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      in_progress: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
      error: "bg-red-500/10 text-red-400 border-red-500/20",
      partial: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };
    const labels: Record<string, string> = {
      pending: "Pendente", processing: "Processando", in_progress: "Em Andamento",
      completed: "Concluído", cancelled: "Cancelado", error: "Erro", partial: "Parcial",
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colors[status] || "bg-slate-500/10 text-slate-400"}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-slate-800/60 rounded animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5"><div className="h-4 w-20 bg-slate-800/60 rounded animate-pulse mb-3" /><div className="h-8 w-16 bg-slate-800/60 rounded animate-pulse" /></div>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Administração</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie usuários, pedidos, cupons, serviços e parceiros da plataforma</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/admin/users" className="btn-primary text-xs !py-2 !px-4">👥 Usuários</Link>
        <Link href="/dashboard/admin/orders" className="btn-primary text-xs !py-2 !px-4">📋 Pedidos</Link>
        <Link href="/dashboard/admin/coupons" className="btn-secondary text-xs !py-2 !px-4">🏷️ Cupons</Link>
        <Link href="/dashboard/admin/services" className="btn-secondary text-xs !py-2 !px-4">🛠️ Serviços</Link>
        <Link href="/dashboard/admin/partners" className="btn-secondary text-xs !py-2 !px-4">🤝 Parceiros</Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Usuários" value={String(stats.total_users)} sub="Cadastrados na plataforma" />
          <StatCard title="Pedidos" value={String(stats.total_orders)} sub={`${stats.pending_orders} pendentes`} />
          <StatCard title="Receita" value={`R$ ${stats.total_revenue.toFixed(2)}`} color="text-emerald-400" sub="Pedidos concluídos/andamento" />
          <StatCard title="Lucro" value={`R$ ${stats.total_profit.toFixed(2)}`} color="text-amber-400" sub="Receita - Custos" />
          <StatCard title="Serviços" value={String(stats.total_services)} sub="No catálogo" />
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Últimos Pedidos</h2>
          <Link href="/dashboard/admin/orders" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Ver todos →</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="glass-card p-6 text-center"><p className="text-slate-500 text-sm">Nenhum pedido realizado ainda</p></div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">#</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Usuário</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Serviço</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{o.id}</td>
                    <td className="px-4 py-3 text-white text-xs">{o.user_name}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[200px] truncate">{o.service_name}</td>
                    <td className="px-4 py-3 text-emerald-400 text-xs font-medium">R$ {o.charge.toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}