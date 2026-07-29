"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// ─── Tipos ──────────────────────────────────────────────────────────

interface WeekData {
  week_start: string;
  week_label: string;
  new_referrals: number;
  active_referrals: number;
  total_spent: number;
  commission: number;
}

interface Revendedor {
  partner_id: number;
  partner_name: string;
  ref_code: string;
  commission_rate: number;
  referral_link: string;
  pix_key: string | null;
  total_referred: number;
  total_spent: number;
  commission_due: number;
  paid_out: number;
  balance_due: number;
  weeks: WeekData[];
}

// ─── Helpers ────────────────────────────────────────────────────────

function formatBRL(val: number): string {
  return `R$ ${val.toFixed(2).replace(".", ",")}`;
}

function formatDate(d: string): string {
  const dt = new Date(d + "T12:00:00Z");
  return dt.toLocaleDateString("pt-BR", { day: "numeric", month: "short", timeZone: "UTC" });
}

// ─── Skeleton ───────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 bg-slate-800/60 rounded" />
        <div className="h-3 w-32 bg-slate-800/40 rounded" />
      </div>
      <div className="h-4 w-20 bg-slate-800/60 rounded" />
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────

export default function RevendedoresPage() {
  const [data, setData] = useState<Revendedor[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPartner, setExpandedPartner] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("clou_token");
    if (!token) return;

    api.get<Revendedor[]>("/admin/partners/weekly-stats", token)
      .then(setData)
      .catch((err) => setError(err.detail || "Erro ao carregar revendedores"))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = async (link: string, code: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">🤝</div>
        <h2 className="text-xl font-semibold text-white mb-2">Nenhum revendedor ainda</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Crie parceiros/revendedores no painel de Parceiros para começar a acompanhar as vendas por link de indicação.
        </p>
        <a
          href="/dashboard/admin/partners"
          className="inline-block mt-6 btn-primary text-sm !py-2 !px-4"
        >
          Ir para Parceiros
        </a>
      </div>
    );
  }

  const togglePartner = (id: number) => {
    setExpandedPartner(expandedPartner === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">🤝 Revendedores</h1>
        <p className="text-sm text-slate-400 mt-1">
          Acompanhe semanalmente quantas pessoas cada revendedor trouxe, quanto gastaram e a comissão devida.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{data.length}</p>
          <p className="text-xs text-slate-500 mt-1">Revendedores</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {data.reduce((a, b) => a + b.total_referred, 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Indicados</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">
            {formatBRL(data.reduce((a, b) => a + b.total_spent, 0))}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Vendido</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">
            {formatBRL(data.reduce((a, b) => a + b.balance_due, 0))}
          </p>
          <p className="text-xs text-slate-500 mt-1">Comissão a Pagar</p>
        </div>
      </div>

      {/* Partner List */}
      <div className="space-y-3">
        {data.map((rev) => {
          const isExpanded = expandedPartner === rev.partner_id;
          return (
            <div key={rev.partner_id} className="glass-card overflow-hidden">
              {/* Header */}
              <button
                onClick={() => togglePartner(rev.partner_id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors text-left"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {rev.partner_name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{rev.partner_name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    Código: <span className="text-emerald-400 font-mono">{rev.ref_code}</span>
                    {" • "}{rev.commission_rate}% comissão
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-right flex-shrink-0">
                  <div>
                    <p className="text-sm font-bold text-white">{rev.total_referred}</p>
                    <p className="text-[10px] text-slate-500">indicados</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-400">{formatBRL(rev.total_spent)}</p>
                    <p className="text-[10px] text-slate-500">vendido</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-bold ${rev.balance_due > 0 ? "text-amber-400" : "text-slate-500"}`}>
                      {formatBRL(rev.balance_due)}
                    </p>
                    <p className="text-[10px] text-slate-500">comissão</p>
                  </div>
                </div>

                {/* Arrow */}
                <svg className={`w-5 h-5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t border-slate-800/50 p-4 space-y-4">
                  {/* Link + Pix */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1.5 font-medium">Link de Indicação</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg truncate border border-slate-800/30">
                          {rev.referral_link}
                        </code>
                        <button
                          onClick={() => copyLink(rev.referral_link, rev.ref_code)}
                          className="btn-accent text-[11px] !py-1.5 !px-3 whitespace-nowrap flex-shrink-0"
                        >
                          {copiedCode === rev.ref_code ? "✅ Copiado!" : "Copiar Link"}
                        </button>
                      </div>
                    </div>
                    {rev.pix_key && (
                      <div>
                        <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1.5 font-medium">Chave Pix</p>
                        <p className="text-xs text-emerald-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/30">
                          {rev.pix_key}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Commission Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-900/40 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500">Comissão (R$)</p>
                      <p className="text-lg font-bold text-emerald-400">{formatBRL(rev.commission_due)}</p>
                      <p className="text-[10px] text-slate-600">{rev.commission_rate}% de {formatBRL(rev.total_spent)}</p>
                    </div>
                    <div className="bg-slate-900/40 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500">Já Pago</p>
                      <p className="text-lg font-bold text-white">{formatBRL(rev.paid_out)}</p>
                    </div>
                    <div className="bg-slate-900/40 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500">Saldo</p>
                      <p className={`text-lg font-bold ${rev.balance_due > 0 ? "text-amber-400" : "text-slate-500"}`}>
                        {formatBRL(rev.balance_due)}
                      </p>
                    </div>
                  </div>

                  {/* Weekly Table */}
                  {rev.weeks.length > 0 && (
                    <div>
                      <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-2 font-medium">Quebra Semanal</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-800/30">
                              <th className="text-left py-2 pr-4 text-[11px] text-slate-600 font-medium">Semana</th>
                              <th className="text-center py-2 px-3 text-[11px] text-slate-600 font-medium">Novos Indicados</th>
                              <th className="text-center py-2 px-3 text-[11px] text-slate-600 font-medium">Indicados Ativos</th>
                              <th className="text-right py-2 px-3 text-[11px] text-slate-600 font-medium">Total Vendido</th>
                              <th className="text-right py-2 pl-3 text-[11px] text-slate-600 font-medium">Comissão</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/20">
                            {rev.weeks.map((w) => (
                              <tr key={w.week_start} className="hover:bg-slate-800/10 transition-colors">
                                <td className="py-2.5 pr-4">
                                  <p className="text-white text-xs">{w.week_label}</p>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                                    {w.new_referrals}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="text-xs text-slate-400">{w.active_referrals}</span>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <span className="text-xs text-emerald-400 font-medium">{formatBRL(w.total_spent)}</span>
                                </td>
                                <td className="py-2.5 pl-3 text-right">
                                  <span className="text-xs text-amber-400 font-medium">{formatBRL(w.commission)}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {rev.weeks.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">
                      Nenhuma venda registrada ainda para este revendedor.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}