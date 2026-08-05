"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

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
  tier_name: string;
  tier_rate: number;
  next_tier_name: string | null;
  sales_to_next: number | null;
}

interface PayoutRecord {
  id: number;
  partner_id: number;
  partner_name: string;
  amount: number;
  notes: string | null;
  paid_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

function formatBRL(val: number): string {
  return `R$ ${val.toFixed(2).replace(".", ",")}`;
}

// ─── Tier Helpers ────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  Bronze: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  Prata: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Ouro: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Diamante: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

const TIER_EMOJIS: Record<string, string> = {
  Bronze: "🥉",
  Prata: "🥈",
  Ouro: "🥇",
  Diamante: "💎",
};

const TIER_ORDER: Record<string, number> = {
  Bronze: 0,
  Prata: 1,
  Ouro: 2,
  Diamante: 3,
};

function getMaiorTier(revendedores: Revendedor[]): string {
  let best = "Bronze";
  for (const r of revendedores) {
    if ((TIER_ORDER[r.tier_name] ?? 0) > (TIER_ORDER[best] ?? 0)) {
      best = r.tier_name;
    }
  }
  return best;
}

// ─── Modais ─────────────────────────────────────────────────────────

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-slate-900 border border-slate-800/50 rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function CriarRevendedorModal({
  open, onClose, onCreated, token,
}: {
  open: boolean; onClose: () => void; onCreated: () => void; token: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [refCode, setRefCode] = useState("");
  const [rate, setRate] = useState(5);
  const [pixKey, setPixKey] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => { setName(""); setEmail(""); setRefCode(""); setRate(5); setPixKey(""); setNotes(""); setError(""); };

  const handleSubmit = async () => {
    if (!name || !email || !refCode) { setError("Preencha nome, email e código"); return; }
    setSubmitting(true); setError("");
    try {
      await api.post("/admin/partners/create", {
        name: name.trim(), email: email.trim().toLowerCase(),
        ref_code: refCode.trim().toUpperCase(), commission_rate: rate,
        pix_key: pixKey.trim(), notes: notes.trim(),
      }, token);
      reset(); onCreated();
    } catch (e: any) {
      setError(e.detail || "Erro ao criar revendedor");
    } finally { setSubmitting(false); }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-white mb-4">➕ Novo Revendedor</h2>

      <div className="space-y-3">
        <div>
          <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50" placeholder="João Silva" />
        </div>
        <div>
          <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50" placeholder="joao@email.com" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Código</label>
            <input value={refCode} onChange={(e) => setRefCode(e.target.value.toUpperCase())} className="w-full mt-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 font-mono" placeholder="GRUPOJOÃO" />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Comissão (%)</label>
            <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} min={1} max={100} className="w-full mt-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
          </div>
        </div>
        <div>
          <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Chave Pix (opcional)</label>
          <input value={pixKey} onChange={(e) => setPixKey(e.target.value)} className="w-full mt-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 font-mono" placeholder="joao@pix" />
        </div>
        <div>
          <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Observações (opcional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50" />
        </div>
      </div>

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 text-sm text-slate-400 hover:text-white py-2 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors">Cancelar</button>
        <button onClick={handleSubmit} disabled={submitting} className="flex-1 btn-primary text-sm !py-2" style={{ opacity: submitting ? 0.6 : 1 }}>
          {submitting ? "Criando..." : "Criar Revendedor"}
        </button>
      </div>
    </Modal>
  );
}

function PagarSemanaModal({
  open, onClose, onPaid, token, partnerName, weekLabel, amount, partnerId,
}: {
  open: boolean; onClose: () => void; onPaid: () => void; token: string;
  partnerName: string; weekLabel: string; amount: number; partnerId: number;
}) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setSubmitting(true); setError("");
    try {
      await api.post("/admin/partners/payout", { partner_id: partnerId, amount, notes: notes.trim() || `Pagamento ${weekLabel}` }, token);
      onPaid();
    } catch (e: any) {
      setError(e.detail || "Erro ao registrar pagamento");
    } finally { setSubmitting(false); }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-white mb-1">💰 Pagar Comissão</h2>
      <p className="text-sm text-slate-400 mb-4">{partnerName} — {weekLabel}</p>

      <div className="bg-slate-800/40 rounded-lg p-4 mb-4 text-center">
        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Valor da Semana</p>
        <p className="text-2xl font-bold text-emerald-400">{formatBRL(amount)}</p>
      </div>

      <div>
        <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Observação (opcional)</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50" placeholder={`Pagamento ${weekLabel}`} />
      </div>

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 text-sm text-slate-400 hover:text-white py-2 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors">Cancelar</button>
        <button onClick={handlePay} disabled={submitting} className="flex-1 btn-accent text-sm !py-2" style={{ opacity: submitting ? 0.6 : 1 }}>
          {submitting ? "Registrando..." : `✅ Pagar ${formatBRL(amount)}`}
        </button>
      </div>
    </Modal>
  );
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

// ─── Página Principal ───────────────────────────────────────────────

export default function RevendedoresPage() {
  const [data, setData] = useState<Revendedor[] | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [expandedPartner, setExpandedPartner] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modais
  const [showCriar, setShowCriar] = useState(false);
  const [payWeek, setPayWeek] = useState<{ partner: Revendedor; week: WeekData } | null>(null);
  const [showPayoutsList, setShowPayoutsList] = useState(false);

  // Filtro de data
  const hoje = new Date();
  const fimSemana = new Date(hoje);
  fimSemana.setDate(hoje.getDate() + (6 - hoje.getDay()));
  const inicioSemana = new Date(fimSemana);
  inicioSemana.setDate(fimSemana.getDate() - 6);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(fmt(inicioSemana));
  const [endDate, setEndDate] = useState(fmt(fimSemana));

  const fetchData = async (t: string, start?: string, end?: string) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (start) params.set("start_date", start);
      if (end) params.set("end_date", end);
      const qs = params.toString();
      const url = `/admin/partners/weekly-stats${qs ? `?${qs}` : ""}`;
      const [revData, payData] = await Promise.all([
        api.get<Revendedor[]>(url, t),
        api.get<PayoutRecord[]>("/admin/partners/payouts", t),
      ]);
      setData(revData); setPayouts(payData);
    } catch (e: any) {
      setError(e.detail || "Erro ao carregar dados");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) return;
    setToken(t);
    api.me(t).then((u) => {
      if (u.role !== "superadmin" && u.role !== "admin") return;
      fetchData(t, startDate, endDate);
    }).catch(() => {
      localStorage.removeItem("clou_token");
      window.location.href = "/login";
    });
  }, []);

  const copyLink = async (link: string, code: string) => {
    try { await navigator.clipboard.writeText(link); } catch {
      const inp = document.createElement("input");
      inp.value = link; document.body.appendChild(inp); inp.select(); document.execCommand("copy"); document.body.removeChild(inp);
    }
    setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000);
  };

  // ─── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-64 bg-slate-800/60 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/40 rounded animate-pulse" />
        </div>
        <div className="space-y-2">{[1, 2, 3].map((i) => <SkeletonRow key={i} />)}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-slate-400">{error}</p>
        <button onClick={() => fetchData(token)} className="mt-4 text-sm text-emerald-400 hover:text-emerald-300">Tentar novamente</button>
      </div>
    );
  }

  // ─── Empty ──────────────────────────────────────────────────────
  if (!data || data.length === 0) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">🤝</div>
        <h2 className="text-xl font-semibold text-white mb-2">Nenhum revendedor ainda</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6">Crie seu primeiro revendedor para gerar um link de indicação e acompanhar as vendas semanais.</p>
        <button onClick={() => setShowCriar(true)} className="btn-primary text-sm !py-2 !px-5">+ Criar Revendedor</button>
        <CriarRevendedorModal open={showCriar} onClose={() => setShowCriar(false)} onCreated={() => { setShowCriar(false); fetchData(token, startDate, endDate); }} token={token} />
      </div>
    );
  }

  const togglePartner = (id: number) => setExpandedPartner(expandedPartner === id ? null : id);

  const totalComissaoPagar = data.reduce((a, b) => a + b.balance_due, 0);
  const totalPago = data.reduce((a, b) => a + b.paid_out, 0);
  const totalPeriodo = data.reduce((a, b) => a + b.total_spent, 0);
  const totalComissao = data.reduce((a, b) => a + b.commission_due, 0);

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">💼 Revendedores</h1>
          <p className="text-sm text-slate-400 mt-1">Crie revendedores, acompanhe vendas e registre pagamentos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPayoutsList(!showPayoutsList)} className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
            📋 Histórico
          </button>
          <button onClick={() => setShowCriar(true)} className="btn-primary text-sm !py-2 !px-4">+ Novo Revendedor</button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">De</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); fetchData(token, e.target.value, endDate); }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Até</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); fetchData(token, startDate, e.target.value); }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="text-xs text-slate-500 sm:ml-2">
            {data && data.length > 0 && (
              <span>Período: <strong className="text-white">{formatBRL(totalPeriodo)}</strong> vendido · <strong className="text-amber-400">{formatBRL(totalComissao)}</strong> comissão</span>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{data.length}</p>
          <p className="text-xs text-slate-500 mt-1">Revendedores</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{data.reduce((a, b) => a + b.total_referred, 0)}</p>
          <p className="text-xs text-slate-500 mt-1">Total Indicados</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{formatBRL(data.reduce((a, b) => a + b.total_spent, 0))}</p>
          <p className="text-xs text-slate-500 mt-1">Total Vendido</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{formatBRL(totalComissaoPagar)}</p>
          <p className="text-xs text-slate-500 mt-1">Comissão Pendente</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className={`text-2xl font-bold ${TIER_COLORS[getMaiorTier(data)]?.split(" ")[1] ?? "text-slate-300"}`}>
            {TIER_EMOJIS[getMaiorTier(data)] ?? ""} {getMaiorTier(data)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Maior Tier</p>
        </div>
      </div>

      {/* Payouts History */}
      {showPayoutsList && (
        <div className="glass-card mb-6 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">📋 Histórico de Pagamentos</p>
            <button onClick={() => setShowPayoutsList(false)} className="text-xs text-slate-500 hover:text-white">Fechar</button>
          </div>
          {payouts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Nenhum pagamento registrado ainda.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {payouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/20">
                  <div>
                    <p className="text-sm text-white">{p.partner_name}</p>
                    <p className="text-[11px] text-slate-500">{new Date(p.paid_at).toLocaleDateString("pt-BR")}{p.notes ? ` • ${p.notes}` : ""}</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-400">{formatBRL(p.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Partner List */}
      <div className="space-y-3">
        {data.map((rev) => {
          const isExpanded = expandedPartner === rev.partner_id;
          return (
            <div key={rev.partner_id} className="glass-card overflow-hidden">
              {/* Header */}
              <button onClick={() => togglePartner(rev.partner_id)} className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors text-left">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {rev.partner_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{rev.partner_name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    Código: <span className="text-emerald-400 font-mono">{rev.ref_code}</span>{" "}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${TIER_COLORS[rev.tier_name] ?? "bg-slate-500/20 text-slate-300 border-slate-500/30"}`}>
                      {TIER_EMOJIS[rev.tier_name] ?? ""} {rev.tier_name}
                    </span>{" "}
                    • {rev.commission_rate}%
                  </p>
                </div>
                <div className="flex items-center gap-5 text-right flex-shrink-0">
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-white">{rev.total_referred}</p>
                    <p className="text-[10px] text-slate-500">indicados</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-400">{formatBRL(rev.total_spent)}</p>
                    <p className="text-[10px] text-slate-500">vendido</p>
                  </div>
                  <div className="hidden md:block">
                    <p className={`text-sm font-bold ${rev.paid_out > 0 ? "text-white" : "text-slate-500"}`}>{formatBRL(rev.paid_out)}</p>
                    <p className="text-[10px] text-slate-500">pago</p>
                  </div>
                  <div className="hidden md:block">
                    <p className={`text-sm font-bold ${rev.balance_due > 0 ? "text-amber-400" : "text-slate-500"}`}>{formatBRL(rev.balance_due)}</p>
                    <p className="text-[10px] text-slate-500">saldo</p>
                  </div>
                </div>
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
                      <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1.5 font-medium">🔗 Link de Indicação</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg truncate border border-slate-800/30">{rev.referral_link}</code>
                        <button onClick={() => copyLink(rev.referral_link, rev.ref_code)} className="btn-accent text-[11px] !py-1.5 !px-3 whitespace-nowrap flex-shrink-0">
                          {copiedCode === rev.ref_code ? "✅ Copiado!" : "Copiar Link"}
                        </button>
                      </div>
                    </div>
                    {rev.pix_key && (
                      <div>
                        <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1.5 font-medium">💳 Chave Pix</p>
                        <p className="text-xs text-emerald-400 font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/30">{rev.pix_key}</p>
                      </div>
                    )}
                  </div>

                  {/* Commission Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-900/40 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500">Comissão Total</p>
                      <p className="text-lg font-bold text-emerald-400">{formatBRL(rev.commission_due)}</p>
                      <p className="text-[10px] text-slate-600">{rev.commission_rate}% de {formatBRL(rev.total_spent)}</p>
                    </div>
                    <div className="bg-slate-900/40 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500">Já Pago</p>
                      <p className="text-lg font-bold text-white">{formatBRL(rev.paid_out)}</p>
                    </div>
                    <div className="bg-slate-900/40 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500">A Pagar</p>
                      <p className={`text-lg font-bold ${rev.balance_due > 0 ? "text-amber-400" : "text-slate-500"}`}>{formatBRL(rev.balance_due)}</p>
                    </div>
                  </div>

                  {/* Tier Card */}
                  <div className="glass-card p-3 text-center">
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 font-medium">🏆 Nível</p>
                    <p className={`text-lg font-bold ${TIER_COLORS[rev.tier_name]?.split(" ")[1] ?? "text-slate-300"}`}>
                      {TIER_EMOJIS[rev.tier_name] ?? ""} {rev.tier_name} · {rev.tier_rate}%
                    </p>
                    {rev.next_tier_name && rev.sales_to_next !== null && rev.sales_to_next > 0 ? (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Faltam <span className="text-amber-400 font-medium">{formatBRL(rev.sales_to_next)}</span> em vendas para {TIER_EMOJIS[rev.next_tier_name] ?? ""} {rev.next_tier_name}
                      </p>
                    ) : rev.next_tier_name ? (
                      <p className="text-[11px] text-emerald-400 mt-1">✅ Pronto para {rev.next_tier_name}!</p>
                    ) : (
                      <p className="text-[11px] text-slate-600 mt-1">🎯 Tier máximo atingido</p>
                    )}
                  </div>

                  {/* Weekly Table */}
                  {rev.weeks.length > 0 && (
                    <div>
                      <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-2 font-medium">📅 Quebra Semanal</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-800/30">
                              <th className="text-left py-2 pr-3 text-[11px] text-slate-600 font-medium">Semana</th>
                              <th className="text-center py-2 px-2 text-[11px] text-slate-600 font-medium">Novos</th>
                              <th className="text-center py-2 px-2 text-[11px] text-slate-600 font-medium">Ativos</th>
                              <th className="text-right py-2 px-2 text-[11px] text-slate-600 font-medium">Vendido</th>
                              <th className="text-right py-2 px-2 text-[11px] text-slate-600 font-medium">Comissão</th>
                              <th className="text-center py-2 pl-2 text-[11px] text-slate-600 font-medium"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/20">
                            {rev.weeks.map((w) => {
                              const jahPago = totalPago > 0 && w.commission <= rev.paid_out;
                              return (
                                <tr key={w.week_start} className="hover:bg-slate-800/10 transition-colors">
                                  <td className="py-2.5 pr-3"><p className="text-white text-xs">{w.week_label}</p></td>
                                  <td className="py-2.5 px-2 text-center">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">{w.new_referrals}</span>
                                  </td>
                                  <td className="py-2.5 px-2 text-center"><span className="text-xs text-slate-400">{w.active_referrals}</span></td>
                                  <td className="py-2.5 px-2 text-right"><span className="text-xs text-emerald-400 font-medium">{formatBRL(w.total_spent)}</span></td>
                                  <td className="py-2.5 px-2 text-right"><span className="text-xs text-amber-400 font-medium">{formatBRL(w.commission)}</span></td>
                                  <td className="py-2.5 pl-2 text-center">
                                    <button
                                      onClick={() => setPayWeek({ partner: rev, week: w })}
                                      className="text-[10px] btn-accent !py-1 !px-2"
                                      title="Pagar comissão desta semana"
                                    >
                                      💰 Pagar
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {rev.weeks.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">Nenhuma venda registrada ainda para este revendedor.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modais */}
      <CriarRevendedorModal open={showCriar} onClose={() => setShowCriar(false)} onCreated={() => { setShowCriar(false); fetchData(token, startDate, endDate); }} token={token} />
      {payWeek && (
        <PagarSemanaModal
          open={true}
          onClose={() => setPayWeek(null)}
          onPaid={() => { setPayWeek(null); fetchData(token, startDate, endDate); }}
          token={token}
          partnerName={payWeek.partner.partner_name}
          weekLabel={payWeek.week.week_label}
          amount={payWeek.week.commission}
          partnerId={payWeek.partner.partner_id}
        />
      )}
    </div>
  );
}