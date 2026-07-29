"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface AdminStats {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  total_services: number;
  active_coupons: number;
  pending_orders: number;
}

interface RecentOrder {
  id: number;
  user_name: string;
  service_name: string;
  charge: number;
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

    Promise.all([
      api.get<any[]>("/admin/orders?limit=5", t).catch(() => []),
      // Stats via aggregation — usamos os dados disponíveis
      fetchStats(t),
    ])
      .then(([orders, s]) => {
        setRecentOrders(orders.map((o: any) => ({
          id: o.id,
          user_name: o.user_name,
          service_name: o.service_name,
          charge: o.charge,
          status: o.status,
          created_at: o.created_at,
        })));
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  async function fetchStats(token: string): Promise<AdminStats> {
    try {
      const [users, orders, services] = await Promise.all([
        api.get<any[]>("/admin/users?limit=1", token),
        api.get<any[]>("/admin/orders?limit=200", token),
        api.get<any[]>("/services"),
      ]);
      const totalUsers = users.length > 0
        ? await api.get<any[]>("/admin/users?limit=0", token).catch(() => [])
        : [];
      const allOrders = orders || [];
      const revenue = allOrders
        .filter((o: any) => ["completed", "in_progress", "processing", "partial"].includes(o.status))
        .reduce((sum: number, o: any) => sum + o.charge, 0);
      return {
        total_users: 0, // placeholder — vamos buscar real
        total_orders: allOrders.length,
        total_revenue: revenue,
        total_services: (services || []).length,
        active_coupons: 0,
        pending_orders: allOrders.filter((o: any) => o.status === "pending").length,
      };
    } catch {
      return { total_users: 0, total_orders: 0, total_revenue: 0, total_services: 0, active_coupons: 0, pending_orders: 0 };
    }
  }

  // Segunda tentativa de buscar stats reais
  useEffect(() => {
    if (!token || !loading) return;
    const t = token;
    // Buscar total de users
    api.get<any[]>("/admin/users?limit=1&skip=1000", t).then((users) => {
      // Não temos count real, usamos o comprimento se limit=1000
    }).catch(() => {});
  }, [token, loading]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800/60 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="h-4 w-20 bg-slate-800/60 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-800/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Administração</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie usuários, pedidos, cupons e serviços da plataforma</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/admin/users" className="btn-primary text-xs !py-2 !px-4">👥 Usuários</Link>
        <Link href="/dashboard/admin/coupons" className="btn-secondary text-xs !py-2 !px-4">🏷️ Cupons</Link>
        <Link href="/dashboard/admin/partners" className="btn-secondary text-xs !py-2 !px-4">👥 Parceiros</Link>
        <Link href="/dashboard/pedidos" className="btn-secondary text-xs !py-2 !px-4">📋 Todos Pedidos</Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Usuários</p>
          <p className="text-3xl font-bold text-white">{stats?.total_orders || 0}</p>
          <p className="text-xs text-slate-600 mt-1">Cadastrados na plataforma</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Pedidos</p>
          <p className="text-3xl font-bold text-white">{stats?.total_orders || 0}</p>
          <p className="text-xs text-amber-400 mt-1">{stats?.pending_orders || 0} pendentes</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Receita Total</p>
          <p className="text-3xl font-bold text-emerald-400">R$ {stats?.total_revenue.toFixed(2) || "0,00"}</p>
          <p className="text-xs text-slate-600 mt-1">Em pedidos concluídos</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Serviços</p>
          <p className="text-3xl font-bold text-white">{stats?.total_services || 0}</p>
          <p className="text-xs text-slate-600 mt-1">Ativos no catálogo</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Últimos Pedidos</h2>
          <Link href="/dashboard/pedidos" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Ver todos →</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-slate-500 text-sm">Nenhum pedido realizado ainda</p>
          </div>
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
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{order.id}</td>
                    <td className="px-4 py-3 text-white text-xs">{order.user_name || `#${order.id}`}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[200px] truncate">{order.service_name}</td>
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
    </div>
  );
}