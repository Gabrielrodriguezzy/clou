"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Coupon {
  code: string;
  discount_percent: number;
  min_amount: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
}

export default function AdminCoupons() {
  const [token, setToken] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: "", discount_percent: 10, min_amount: 0, max_uses: 100, expires_in_days: 30 });
  const [msg, setMsg] = useState("");

  const loadCoupons = async (t: string) => {
    // Buscamos dos pedidos/admin — na falta de endpoint list, vamos gerenciar local
    // Usamos o endpoint de criar/desativar
    setLoading(false);
  };

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) return;
    setToken(t);
    loadCoupons(t);
  }, []);

  const createCoupon = async () => {
    if (!token) return;
    setMsg("");
    try {
      await api.post("/admin/coupons", form, token);
      setMsg(`✅ Cupom ${form.code.toUpperCase()} criado com sucesso`);
      setShowCreate(false);
      setForm({ code: "", discount_percent: 10, min_amount: 0, max_uses: 100, expires_in_days: 30 });
    } catch (e: any) {
      setMsg(`❌ ${e.detail || "Erro ao criar cupom"}`);
    }
  };

  const deactivateCoupon = async (code: string) => {
    if (!token) return;
    try {
      await api.patch(`/admin/coupons/${code}`, {}, token);
      setMsg(`✅ Cupom ${code} desativado`);
      loadCoupons(token);
    } catch (e: any) {
      setMsg(`❌ ${e.detail || "Erro ao desativar"}`);
    }
  };

  // Coupons predefinidos que conhecemos
  const knownCoupons: Coupon[] = [
    { code: "BEMVINDO10", discount_percent: 10, min_amount: 1, max_uses: 2000, used_count: 0, is_active: true, expires_at: null },
    { code: "CLOU20", discount_percent: 20, min_amount: 5, max_uses: 1000, used_count: 0, is_active: true, expires_at: null },
  ];

  if (loading) return <div className="h-32 bg-slate-800/40 rounded animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cupons</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os cupons de desconto da plataforma</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-xs !py-2 !px-4">
          + Novo Cupom
        </button>
      </div>

      {msg && <div className="glass-card p-3 text-sm">{msg}</div>}

      {/* Create Form */}
      {showCreate && (
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-white font-semibold">Novo Cupom</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Código</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-clou" placeholder="Ex: PROMO30" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Desconto (%)</label>
              <input type="number" min={1} max={100} value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: parseInt(e.target.value) || 0 })} className="input-clou" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Valor Mínimo (R$)</label>
              <input type="number" step="0.01" value={form.min_amount} onChange={(e) => setForm({ ...form, min_amount: parseFloat(e.target.value) || 0 })} className="input-clou" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Usos Máximos</label>
              <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: parseInt(e.target.value) || 0 })} className="input-clou" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Expira em (dias)</label>
              <input type="number" value={form.expires_in_days} onChange={(e) => setForm({ ...form, expires_in_days: parseInt(e.target.value) || 0 })} className="input-clou" />
            </div>
          </div>
          <button onClick={createCoupon} className="btn-accent text-xs !py-2 !px-4">Criar Cupom</button>
        </div>
      )}

      {/* Coupons List */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Código</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Desconto</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Mínimo</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Usos</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {knownCoupons.map((c) => (
              <tr key={c.code} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                <td className="px-4 py-3 text-white font-mono text-xs font-bold">{c.code}</td>
                <td className="px-4 py-3 text-amber-400 text-xs font-medium">{c.discount_percent}%</td>
                <td className="px-4 py-3 text-slate-400 text-xs">R$ {c.min_amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{c.used_count}/{c.max_uses}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                    c.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>{c.is_active ? "Ativo" : "Inativo"}</span>
                </td>
                <td className="px-4 py-3">
                  {c.is_active ? (
                    <button onClick={() => deactivateCoupon(c.code)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Desativar</button>
                  ) : (
                    <span className="text-xs text-slate-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}