"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import DashboardLayout from "../layout";

// ─── Tipos ───────────────────────────────────────────────────────────

interface PartnerReport {
  partner_id: number;
  partner_name: string;
  partner_email: string;
  ref_code: string;
  referred_count: number;
  total_spent: number;
  commission_5pct: number;
  paid_out: number;
  balance_due: number;
  last_activity: string | null;
  status: "active" | "ready" | "paid" | "inactive";
}

interface PayoutRecord {
  id: number;
  partner_id: number;
  partner_name: string;
  amount: number;
  notes: string | null;
  paid_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  ready: "Pronto pra pagar",
  paid: "Em dia",
  inactive: "Inativo",
};

const STATUS_COLOR: Record<string, string> = {
  active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ready: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function formatBRL(val: number): string {
  return `R$ ${val.toFixed(2).replace(".", ",")}`;
}

// ─── Componente Principal ───────────────────────────────────────────

export default function AdminPartnersPage() {
  const [user, setUser] = useState<{ id: number; name: string; role: string } | null>(null);
  const [partners, setPartners] = useState<PartnerReport[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  // Modal de pagamento
  const [payModal, setPayModal] = useState<{
    partner: PartnerReport;
    amount: number;
    notes: string;
    submitting: boolean;
  } | null>(null);

  // Histórico de pagamentos
  const [showPayouts, setShowPayouts] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);

    api
      .me(t)
      .then((u) => {
        setUser(u);
        if (u.role !== "superadmin" && u.role !== "admin") {
          router.push("/dashboard");
          return;
        }
      })
      .catch(() => {
        localStorage.removeItem("clou_token");
        router.push("/login");
      });
  }, [router]);

  useEffect(() => {
    if (!token || !user) return;
    fetchData(token);
  }, [token, user]);

  async function fetchData(t: string) {
    setLoading(true);
    setError(null);
    try {
      const [partnersData, payoutsData] = await Promise.all([
        api.get<PartnerReport[]>("/admin/partners", t),
        api.get<PayoutRecord[]>("/admin/partners/payouts", t),
      ]);
      setPartners(partnersData);
      setPayouts(payoutsData);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function handlePayout(partnerId: number, amount: number, notes: string) {
    if (!token) return;
    try {
      await api.post("/admin/partners/payout", { partner_id: partnerId, amount, notes }, token);
      // Recarregar dados
      await fetchData(token);
      setPayModal(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.detail : "Erro ao registrar pagamento");
    }
  }

  // Calcular totais
  const totals = {
    partners: partners.length,
    ready: partners.filter((p) => p.status === "ready").length,
    totalCommission: partners.reduce((s, p) => s + p.commission_5pct, 0),
    totalPaid: partners.reduce((s, p) => s + p.paid_out, 0),
    totalDue: partners.reduce((s, p) => s + p.balance_due, 0),
  };

  // ─── Render ────────────────────────────────────────────────────────

  if (!user) return null;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Parceiros</h1>
            <p className="text-slate-500 text-sm mt-1">
              Grupos de divulgação — 5% de comissão sobre vendas dos indicados
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPayouts(!showPayouts)}
              className="text-xs border border-slate-700/50 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {showPayouts ? "← Ver Parceiros" : "Histórico de Pagamentos"}
            </button>
            <button
              onClick={() => fetchData(token)}
              className="text-xs border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5 px-3 py-1.5 rounded-lg transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Parceiros</p>
          <p className="text-2xl font-bold text-white">{totals.partners}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Prontos pra pagar</p>
          <p className="text-2xl font-bold text-amber-400">{totals.ready}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Comissão Total</p>
          <p className="text-2xl font-bold text-emerald-400">{formatBRL(totals.totalCommission)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">A Pagar</p>
          <p className="text-2xl font-bold text-amber-400">{formatBRL(totals.totalDue)}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card p-4 mb-6 border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-3" />
            <p className="text-sm text-slate-500">Carregando parceiros...</p>
          </div>
        </div>
      )}

      {/* Histórico de Pagamentos */}
      {showPayouts && !loading && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Histórico de Pagamentos</h2>
          {payouts.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-slate-500 text-sm">Nenhum pagamento registrado ainda.</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800/50">
                    <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">ID</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Parceiro</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Valor</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Observação</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Pago em</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{p.id}</td>
                      <td className="px-4 py-3 text-white text-xs">{p.partner_name}</td>
                      <td className="px-4 py-3 text-emerald-400 text-xs font-medium">{formatBRL(p.amount)}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">{p.notes || "—"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(p.paid_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabela de Parceiros */}
      {!showPayouts && !loading && (
        <>
          {partners.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-5xl mb-4">🤝</div>
              <p className="text-slate-500 text-sm mb-1">Nenhum parceiro encontrado</p>
              <p className="text-xs text-slate-600">
                Os parceiros aparecerão aqui conforme usuários se cadastrarem pelos links de indicação.
              </p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/50">
                      <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Parceiro</th>
                      <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">Indicados</th>
                      <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Total Gasto</th>
                      <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Comissão (5%)</th>
                      <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Pago</th>
                      <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Saldo</th>
                      <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">Status</th>
                      <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((p) => (
                      <tr
                        key={p.partner_id}
                        className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-white text-xs font-medium">{p.partner_name}</p>
                            <p className="text-slate-600 text-[10px]">{p.partner_email}</p>
                            <code className="text-[10px] text-slate-600 bg-slate-800/50 px-1 py-0.5 rounded">
                              {p.ref_code}
                            </code>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-white text-sm font-bold">{p.referred_count}</td>
                        <td className="px-4 py-3 text-right text-slate-300 text-xs">{formatBRL(p.total_spent)}</td>
                        <td className="px-4 py-3 text-right text-emerald-400 text-xs font-medium">
                          {formatBRL(p.commission_5pct)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 text-xs">{formatBRL(p.paid_out)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-bold ${p.balance_due > 0 ? "text-amber-400" : "text-slate-600"}`}>
                            {formatBRL(p.balance_due)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium inline-block ${
                              STATUS_COLOR[p.status] || STATUS_COLOR.inactive
                            }`}
                          >
                            {STATUS_LABEL[p.status] || p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.balance_due > 0 ? (
                            <button
                              onClick={() =>
                                setPayModal({
                                  partner: p,
                                  amount: p.balance_due,
                                  notes: "",
                                  submitting: false,
                                })
                              }
                              className="btn-accent text-[10px] !py-1 !px-2.5"
                            >
                              Pagar
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Pagamento */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800/50 rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Pagar {payModal.partner.partner_name}
            </h3>

            <div className="space-y-4">
              {/* Info do parceiro */}
              <div className="glass-card p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Comissão acumulada</span>
                  <span className="text-emerald-400 font-medium">
                    {formatBRL(payModal.partner.commission_5pct)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Já pago</span>
                  <span className="text-slate-400">—{formatBRL(payModal.partner.paid_out)}</span>
                </div>
                <div className="border-t border-slate-800/50 pt-1 flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Saldo devido</span>
                  <span className="text-amber-400 font-bold">{formatBRL(payModal.partner.balance_due)}</span>
                </div>
              </div>

              {/* Valor */}
              <div>
                <label className="text-xs text-slate-500 block mb-1">Valor do pagamento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={payModal.amount}
                  onChange={(e) =>
                    setPayModal({ ...payModal, amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/30"
                />
              </div>

              {/* Observação */}
              <div>
                <label className="text-xs text-slate-500 block mb-1">Observação (ex: mês, Pix enviado para)</label>
                <input
                  type="text"
                  value={payModal.notes}
                  onChange={(e) => setPayModal({ ...payModal, notes: e.target.value })}
                  placeholder="Ex: Pagamento Julho/2026 - Pix enviado"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/30"
                />
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPayModal(null)}
                  className="flex-1 border border-slate-700/50 text-slate-400 hover:text-white py-2 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() =>
                    handlePayout(payModal.partner.partner_id, payModal.amount, payModal.notes)
                  }
                  disabled={payModal.submitting || payModal.amount <= 0}
                  className="flex-1 btn-accent !py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {payModal.submitting
                    ? "Registrando..."
                    : `Pagar ${formatBRL(payModal.amount)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}