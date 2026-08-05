"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

// ─── Tipos ──────────────────────────────────────────────────────────

interface TierInfo {
  name: string;
  rate: number;
  sales_for_tier: number;
  min_sales: number;
  max_sales: number | null;
  next_tier_name: string | null;
  sales_to_next: number | null;
  next_tier_rate: number | null;
}

interface WeekSummary {
  week_start: string;
  week_label: string;
  new_referrals: number;
  active_referrals: number;
  total_spent: number;
  commission: number;
}

interface PartnerMyStats {
  partner_name: string;
  ref_code: string;
  referral_link: string;
  pix_key: string | null;
  commission_rate: number;
  tier: TierInfo;
  total_referred: number;
  total_spent: number;
  commission_due: number;
  paid_out: number;
  balance_due: number;
  weeks: WeekSummary[];
}

interface PayoutRecord {
  id: number;
  amount: number;
  notes: string | null;
  paid_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

function formatBRL(val: number): string {
  return `R$ ${val.toFixed(2).replace(".", ",")}`;
}

function getTierEmoji(name: string): string {
  const map: Record<string, string> = {
    bronze: "🥉",
    prata: "🥈",
    silver: "🥈",
    ouro: "🥇",
    gold: "🥇",
    diamante: "💎",
    diamond: "💎",
  };
  return map[name.toLowerCase()] || "⭐";
}

function getTierColor(name: string): string {
  const map: Record<string, string> = {
    bronze: "text-amber-600",
    prata: "text-slate-300",
    silver: "text-slate-300",
    ouro: "text-yellow-400",
    gold: "text-yellow-400",
    diamante: "text-cyan-300",
    diamond: "text-cyan-300",
  };
  return map[name.toLowerCase()] || "text-white";
}

function getTierBadgeBg(name: string): string {
  const map: Record<string, string> = {
    bronze: "bg-gradient-to-br from-amber-700/30 to-amber-600/10 border-amber-600/40",
    prata: "bg-gradient-to-br from-slate-400/20 to-slate-300/10 border-slate-400/30",
    silver: "bg-gradient-to-br from-slate-400/20 to-slate-300/10 border-slate-400/30",
    ouro: "bg-gradient-to-br from-yellow-500/30 to-yellow-400/10 border-yellow-500/40",
    gold: "bg-gradient-to-br from-yellow-500/30 to-yellow-400/10 border-yellow-500/40",
    diamante: "bg-gradient-to-br from-cyan-400/30 to-cyan-300/10 border-cyan-400/40",
    diamond: "bg-gradient-to-br from-cyan-400/30 to-cyan-300/10 border-cyan-400/40",
  };
  return map[name.toLowerCase()] || "bg-slate-800/40 border-slate-700/50";
}

// ─── Skeleton ───────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header */}
      <div className="h-8 w-64 bg-slate-800/60 rounded" />
      <div className="h-4 w-96 bg-slate-800/40 rounded" />

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-3 w-20 bg-slate-800/40 rounded mb-3" />
            <div className="h-7 w-28 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Tier Card */}
      <div className="glass-card p-6">
        <div className="h-5 w-40 bg-slate-800/60 rounded mb-4" />
        <div className="h-3 w-full bg-slate-800/40 rounded mb-2" />
        <div className="h-2 w-full bg-slate-800/30 rounded" />
      </div>

      {/* Weekly rows */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-slate-800/60 rounded" />
                <div className="h-3 w-32 bg-slate-800/40 rounded" />
              </div>
              <div className="h-4 w-20 bg-slate-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Página Principal ───────────────────────────────────────────────

export default function RevendaPage() {
  const [stats, setStats] = useState<PartnerMyStats | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notPartner, setNotPartner] = useState(false);
  const [pendingPartner, setPendingPartner] = useState(false);

  // Copiar
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Accordion da tabela semanal
  const [showWeeks, setShowWeeks] = useState(false);

  const copyToClipboard = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const inp = document.createElement("input");
      inp.value = text;
      document.body.appendChild(inp);
      inp.select();
      document.execCommand("copy");
      document.body.removeChild(inp);
    }
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  useEffect(() => {
    const token = localStorage.getItem("clou_token");
    if (!token) {
      setLoading(false);
      setError("Você precisa estar logado.");
      return;
    }

    Promise.all([
      api.get<PartnerMyStats>("/partners/my-stats", token).catch((e: any) => {
        // Se 403 ou 404, provavelmente não é parceiro
        if (e instanceof ApiError && (e.status === 403 || e.status === 404)) {
          setNotPartner(true);
          return null;
        }
        throw e;
      }),
      api.get<PayoutRecord[]>("/partners/my-payouts", token).catch(() => {
        // Payout history is optional — silencioso
        return [] as PayoutRecord[];
      }),
    ])
      .then(([s, p]) => {
        if (s === null) return; // notPartner already set
        setStats(s);
        setPayouts(p || []);
      })
      .catch((e: any) => {
        // Se o erro for de parceiro pendente (is_active=false)
        if (e.detail?.includes("análise") || e.detail?.includes("pendente")) {
          setPendingPartner(true);
        } else {
          setError(e.detail || "Erro ao carregar seus dados de revenda");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Skeleton />
      </div>
    );
  }

  // ─── Não é parceiro ─────────────────────────────────────────────
  if (notPartner) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">🤝</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Você não é um revendedor
        </h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6">
          Acesse <strong className="text-emerald-400">/afiliados</strong> para
          se cadastrar como revendedor e começar a ganhar comissões.
        </p>
        <a
          href="/afiliados"
          className="btn-primary text-sm !py-2 !px-5 inline-block"
        >
          Quero ser Revendedor
        </a>
      </div>
    );
  }

  // ─── Cadastro em análise ─────────────────────────────────────────
  if (pendingPartner) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Seu cadastro está em análise
        </h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Em breve você receberá a confirmação por email. Assim que aprovado,
          seu dashboard de revenda será liberado.
        </p>
      </div>
    );
  }

  // ─── Error ───────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-slate-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-emerald-400 hover:text-emerald-300"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const { tier } = stats;

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          💼 Revenda — {stats.partner_name}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Acompanhe suas vendas, comissões e indicados.
        </p>
      </div>

      {/* Código + Link + Pix */}
      <div className="glass-card p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Código de referência */}
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1.5">
              🔑 Código de Referência
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-emerald-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/30">
                {stats.ref_code}
              </code>
              <button
                onClick={() => copyToClipboard(stats.ref_code, setCopiedRef)}
                className={`btn-accent text-[11px] !py-1.5 !px-3 whitespace-nowrap flex-shrink-0 ${
                  copiedRef ? "!bg-emerald-600" : ""
                }`}
              >
                {copiedRef ? "✅" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Link de indicação */}
          <div className="sm:col-span-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1.5">
              🔗 Link de Indicação
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-slate-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/30 truncate">
                {stats.referral_link}
              </code>
              <button
                onClick={() =>
                  copyToClipboard(stats.referral_link, setCopiedLink)
                }
                className={`btn-accent text-[11px] !py-1.5 !px-3 whitespace-nowrap flex-shrink-0 ${
                  copiedLink ? "!bg-emerald-600" : ""
                }`}
              >
                {copiedLink ? "✅" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Chave Pix */}
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1.5">
              💳 Chave Pix
            </p>
            <p className="text-sm text-emerald-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/30">
              {stats.pix_key || (
                <span className="text-slate-500 italic">Não cadastrada</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Indicados</p>
          <p className="text-2xl font-bold text-white">
            {stats.total_referred}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Vendido</p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatBRL(stats.total_spent)}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Comissão Acumulada</p>
          <p className="text-2xl font-bold text-amber-400">
            {formatBRL(stats.commission_due)}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Já Recebido</p>
          <p className="text-2xl font-bold text-white">
            {formatBRL(stats.paid_out)}
          </p>
        </div>
        <div className="glass-card p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500 mb-1">A Receber (Saldo)</p>
          <p
            className={`text-2xl font-bold ${
              stats.balance_due > 0 ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            {formatBRL(stats.balance_due)}
          </p>
        </div>
      </div>

      {/* Card de Tier (Destaque) */}
      <div
        className={`glass-card p-6 mb-8 border-2 ${getTierBadgeBg(tier.name)}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getTierEmoji(tier.name)}</span>
            <div>
              <p className="text-sm text-slate-400">Seu Nível</p>
              <p
                className={`text-xl font-bold capitalize ${getTierColor(
                  tier.name
                )}`}
              >
                {tier.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Comissão Atual</p>
            <p className="text-2xl font-bold text-amber-400">
              {tier.rate}%
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        {tier.next_tier_name ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>
                <strong className="text-white">
                  {formatBRL(tier.sales_for_tier)}
                </strong>{" "}
                de{" "}
                <strong className="text-white">
                  {formatBRL(
                    tier.min_sales + (tier.sales_to_next ?? 0)
                  )}
                </strong>{" "}
                vendidos para atingir{" "}
                <strong
                  className={`capitalize ${getTierColor(
                    tier.next_tier_name
                  )}`}
                >
                  {tier.next_tier_name}
                </strong>{" "}
                ({tier.next_tier_rate}%)
              </span>
            </div>
            <div className="w-full bg-slate-800/60 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700"
                style={{
                  width: `${
                    tier.sales_to_next && tier.sales_to_next + tier.sales_for_tier > 0
                      ? Math.min(
                          100,
                          (tier.sales_for_tier /
                            (tier.sales_for_tier + tier.sales_to_next)) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-4 text-center">
            <p className="text-emerald-400 font-bold text-sm">
              🥇 Você está no nível máximo!
            </p>
            <p className="text-xs text-emerald-500/70 mt-1">
              Parabéns! Você atingiu o topo do programa de revenda.
            </p>
          </div>
        )}
      </div>

      {/* Tabela Semanal (expansível) */}
      {stats.weeks.length > 0 && (
        <div className="glass-card overflow-hidden mb-8">
          <button
            onClick={() => setShowWeeks(!showWeeks)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-medium text-white">
                📅 Desempenho Semanal
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {stats.weeks.length} semana(s) com vendas
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
                showWeeks ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showWeeks && (
            <div className="border-t border-slate-800/50 p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/30">
                      <th className="text-left py-2 pr-3 text-[11px] text-slate-600 font-medium">
                        Semana
                      </th>
                      <th className="text-center py-2 px-2 text-[11px] text-slate-600 font-medium">
                        Novos
                      </th>
                      <th className="text-center py-2 px-2 text-[11px] text-slate-600 font-medium">
                        Ativos
                      </th>
                      <th className="text-right py-2 px-2 text-[11px] text-slate-600 font-medium">
                        Vendido
                      </th>
                      <th className="text-right py-2 pl-2 text-[11px] text-slate-600 font-medium">
                        Comissão
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/20">
                    {stats.weeks.map((w) => {
                      // Determinar se é a semana mais forte
                      const maxCommission = Math.max(
                        ...stats.weeks.map((x) => x.commission)
                      );
                      const isBest = w.commission === maxCommission && maxCommission > 0;
                      return (
                        <tr
                          key={w.week_start}
                          className={`hover:bg-slate-800/10 transition-colors ${
                            isBest ? "bg-amber-500/5" : ""
                          }`}
                        >
                          <td className="py-2.5 pr-3">
                            <p className="text-white text-xs">
                              {w.week_label}
                              {isBest && (
                                <span className="ml-1.5 text-amber-400">
                                  🏆
                                </span>
                              )}
                            </p>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                              {w.new_referrals}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="text-xs text-slate-400">
                              {w.active_referrals}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <span className="text-xs text-emerald-400 font-medium">
                              {formatBRL(w.total_spent)}
                            </span>
                          </td>
                          <td className="py-2.5 pl-2 text-right">
                            <span className="text-xs text-amber-400 font-medium">
                              {formatBRL(w.commission)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {stats.weeks.length === 0 && (
        <div className="glass-card p-6 mb-8 text-center">
          <p className="text-slate-500 text-sm">
            🕊️ Nenhuma venda registrada ainda nesta semana.
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Compartilhe seu link de indicação e comece a vender!
          </p>
        </div>
      )}

      {/* Histórico de Pagamentos */}
      {payouts.length > 0 && (
        <div className="glass-card p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-white">
              📋 Histórico de Pagamentos
            </p>
            <span className="text-xs text-slate-500">
              {payouts.length} pagamento(s)
            </span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-800/20 hover:bg-slate-800/30 transition-colors"
              >
                <div>
                  <p className="text-sm text-white font-medium">
                    {formatBRL(p.amount)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {new Date(p.paid_at).toLocaleDateString("pt-BR")}
                    {p.notes ? ` • ${p.notes}` : ""}
                  </p>
                </div>
                <span className="badge-emerald">Recebido</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {payouts.length === 0 && stats.paid_out > 0 && (
        <div className="glass-card p-5 mb-8">
          <p className="text-sm font-medium text-white mb-3">
            📋 Histórico de Pagamentos
          </p>
          <p className="text-xs text-slate-500 text-center py-2">
            Detalhes dos pagamentos antigos serão exibidos em breve.
          </p>
        </div>
      )}
    </div>
  );
}