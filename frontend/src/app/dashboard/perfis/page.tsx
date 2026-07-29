"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// ─── Tipos ──────────────────────────────────────────────────────────

interface WeekOrderItem {
  id: number;
  service_name: string;
  platform_name: string;
  quantity: number;
  charge: number;
  status: string;
  created_at: string;
}

interface WeekGroup {
  week_start: string;
  week_label: string;
  orders_count: number;
  total_spent: number;
  orders: WeekOrderItem[];
}

interface ProfileGroup {
  link: string;
  platform: string;
  total_spent: number;
  total_orders: number;
  first_order: string;
  last_order: string;
  weeks: WeekGroup[];
}

interface ProfileSummary {
  total_profiles: number;
  total_spent: number;
  total_orders: number;
}

interface ProfileOrdersResponse {
  profiles: ProfileGroup[];
  summary: ProfileSummary;
}

// ─── Helpers ────────────────────────────────────────────────────────

function extractUsername(link: string): string {
  try {
    const url = new URL(link);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] || link;
  } catch {
    return link.length > 30 ? link.slice(0, 30) + "..." : link;
  }
}

function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    Instagram: "from-pink-500 to-purple-600",
    TikTok: "from-cyan-400 to-blue-500",
    YouTube: "from-red-500 to-red-600",
    Twitter: "from-sky-400 to-blue-500",
    Telegram: "from-blue-400 to-cyan-500",
  };
  return colors[platform] || "from-emerald-400 to-emerald-500";
}

function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    Instagram: "📸",
    TikTok: "🎵",
    YouTube: "▶️",
    Twitter: "🐦",
    Telegram: "✈️",
  };
  return icons[platform] || "🌐";
}

function formatDate(d: string): string {
  const dt = new Date(d);
  return dt.toLocaleDateString("pt-BR", { day: "numeric", month: "short", timeZone: "UTC" });
}

function formatDateTime(d: string): string {
  const dt = new Date(d);
  return dt.toLocaleDateString("pt-BR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  });
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    in_progress: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    partial: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const labels: Record<string, string> = {
    pending: "Pendente",
    processing: "Processando",
    in_progress: "Em Andamento",
    completed: "Concluído",
    partial: "Parcial",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    error: "Erro",
  };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${map[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}">${labels[status] || status}</span>`;
}

// ─── Componente ─────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4">
      <div className="w-10 h-10 rounded-lg bg-slate-800/60" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 bg-slate-800/60 rounded" />
        <div className="h-3 w-32 bg-slate-800/40 rounded" />
      </div>
      <div className="h-4 w-20 bg-slate-800/60 rounded" />
    </div>
  );
}

export default function PerfisPage() {
  const [data, setData] = useState<ProfileOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("clou_token");
    if (!token) return;

    api.get<ProfileOrdersResponse>("/orders/by-profile", token)
      .then(setData)
      .catch((err) => setError(err.detail || "Erro ao carregar perfis"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-64 bg-slate-800/60 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/40 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  if (!data || data.profiles.length === 0) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="text-xl font-semibold text-white mb-2">Nenhum perfil ainda</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Seus pedidos aparecerão aqui agrupados por perfil assim que você fizer suas primeiras compras.
        </p>
      </div>
    );
  }

  const toggleProfile = (link: string) => {
    setExpandedProfile(expandedProfile === link ? null : link);
    setExpandedWeek(null);
  };

  const toggleWeek = (key: string) => {
    setExpandedWeek(expandedWeek === key ? null : key);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">📱 Meus Perfis</h1>
        <p className="text-sm text-slate-400 mt-1">
          Acompanhe suas compras agrupadas por perfil, semana a semana.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{data.summary.total_profiles}</p>
          <p className="text-xs text-slate-500 mt-1">Perfis</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{data.summary.total_orders}</p>
          <p className="text-xs text-slate-500 mt-1">Pedidos</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">R$ {data.summary.total_spent.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Total Gasto</p>
        </div>
      </div>

      {/* Perfis List */}
      <div className="space-y-3">
        {data.profiles.map((profile) => {
          const isExpanded = expandedProfile === profile.link;
          return (
            <div key={profile.link} className="glass-card overflow-hidden">
              {/* Profile Header — clicável */}
              <button
                onClick={() => toggleProfile(profile.link)}
                className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors text-left"
              >
                {/* Platform Icon */}
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getPlatformColor(profile.platform)} flex items-center justify-center text-lg flex-shrink-0`}>
                  {getPlatformIcon(profile.platform)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {extractUsername(profile.link)}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {profile.platform} — Último pedido {formatDate(profile.last_order)}
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-white">{profile.total_orders} pedidos</p>
                  <p className="text-xs text-emerald-400">R$ {profile.total_spent.toFixed(2)}</p>
                </div>

                {/* Arrow */}
                <svg
                  className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded: Weekly Breakdown */}
              {isExpanded && (
                <div className="border-t border-slate-800/50">
                  <div className="p-4 space-y-2">
                    {profile.weeks.map((week) => {
                      const weekKey = `${profile.link}-${week.week_start}`;
                      const isWeekOpen = expandedWeek === weekKey;
                      return (
                        <div key={week.week_start} className="rounded-lg border border-slate-800/30 overflow-hidden">
                          {/* Week Header */}
                          <button
                            onClick={() => toggleWeek(weekKey)}
                            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-white">{week.week_label}</span>
                              <span className="text-[10px] text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded-full">
                                {week.orders_count} {week.orders_count === 1 ? "pedido" : "pedidos"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-emerald-400">R$ {week.total_spent.toFixed(2)}</span>
                              <svg
                                className={`w-4 h-4 text-slate-500 transition-transform ${isWeekOpen ? "rotate-180" : ""}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* Orders List */}
                          {isWeekOpen && (
                            <div className="divide-y divide-slate-800/20">
                              {week.orders.map((order) => (
                                <div key={order.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800/10 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{order.service_name}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      {order.quantity} unidades • {formatDateTime(order.created_at)}
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-white">R$ {order.charge.toFixed(2)}</p>
                                    <div dangerouslySetInnerHTML={{ __html: statusBadge(order.status) }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Profile Link */}
                  <div className="px-4 pb-4">
                    <a
                      href={profile.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Abrir perfil
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}