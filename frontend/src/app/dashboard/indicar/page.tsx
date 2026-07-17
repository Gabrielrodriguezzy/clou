"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ReferralStats {
  total_referrals: number;
  total_bonus: number;
  referral_code: string;
  referral_link: string;
}

interface Referral {
  id: number;
  referred_email: string;
  bonus: number;
  referred_deposit: number;
  status: string;
  created_at: string;
}

export default function IndicarPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("clou_token");
    if (!token) return;

    Promise.all([
      api.get<ReferralStats>("/referrals/stats", token),
      api.get<Referral[]>("/referrals", token),
    ])
      .then(([s, r]) => {
        setStats(s);
        setReferrals(r);
      })
      .finally(() => setLoading(false));
  }, []);

  const copyLink = async () => {
    if (!stats?.referral_link) return;
    try {
      await navigator.clipboard.writeText(stats.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = stats.referral_link;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-6 bg-slate-800 rounded w-1/3" />
        <div className="h-24 bg-slate-800 rounded" />
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    pending: "Aguardando depósito",
    paid: "Bônus pago",
    cancelled: "Cancelado",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Indique e Ganhe</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Indicações</p>
          <p className="text-2xl font-bold text-white">{stats?.total_referrals || 0}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Bônus Recebido</p>
          <p className="text-2xl font-bold text-emerald-400">
            R$ {(stats?.total_bonus || 0).toFixed(2).replace(".", ",")}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Ganhe por indicação</p>
          <p className="text-2xl font-bold text-amber-400">10%</p>
        </div>
      </div>

      {/* Link de Indicação */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-sm font-medium text-white mb-3">Seu link de indicação</h2>
        <p className="text-xs text-slate-500 mb-4">
          Compartilhe este link com amigos. Quando eles se cadastrarem e fizerem o primeiro depósito, você ganha 10% de bônus em saldo!
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={stats?.referral_link || ""}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300"
          />
          <button
            onClick={copyLink}
            className={`btn-accent text-sm !py-2 !px-4 whitespace-nowrap ${copied ? "!bg-emerald-600" : ""}`}
          >
            {copied ? "Copiado! ✓" : "Copiar"}
          </button>
        </div>
      </div>

      {/* Lista */}
      {referrals.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-white mb-4">Indicações enviadas</h2>
          <div className="space-y-2">
            {referrals.map((ref) => (
              <div key={ref.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{ref.referred_email}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(ref.created_at).toLocaleDateString("pt-BR")}
                    {ref.referred_deposit > 0 && ` • Depósito: R$ ${ref.referred_deposit.toFixed(2).replace(".", ",")}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    ref.status === "paid" ? "text-emerald-400" :
                    ref.status === "pending" ? "text-yellow-400" : "text-slate-500"
                  }`}>
                    {statusLabel[ref.status] || ref.status}
                  </p>
                  {ref.bonus > 0 && (
                    <p className="text-xs text-emerald-400">+R$ {ref.bonus.toFixed(2).replace(".", ",")}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {referrals.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">🤝</div>
          <p className="text-slate-500 text-sm">Nenhuma indicação ainda</p>
          <p className="text-xs text-slate-600 mt-1">Compartilhe seu link e comece a ganhar bônus!</p>
        </div>
      )}
    </div>
  );
}
