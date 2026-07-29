"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ServiceItem {
  id: number;
  name: string;
  price: number;
  min_amount: number;
  max_amount: number;
  avg_time: string;
  status: string;
  platform?: { name: string };
  category?: { name: string };
}

export default function AdminServices() {
  const [token, setToken] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [editForm, setEditForm] = useState({ price: 0, min_amount: 0, max_amount: 0, status: "active", avg_time: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) return;
    setToken(t);
    api.get<ServiceItem[]>("/services", t).then(setServices).finally(() => setLoading(false));
  }, []);

  const openEdit = (s: ServiceItem) => {
    setEditing(s);
    setEditForm({ price: s.price, min_amount: s.min_amount, max_amount: s.max_amount, status: s.status, avg_time: s.avg_time });
    setMsg("");
  };

  const saveService = async () => {
    if (!editing || !token) return;
    try {
      await api.patch(`/admin/services/${editing.id}`, editForm, token);
      setMsg("✅ Salvo");
      const updated = await api.get<ServiceItem[]>("/services", token);
      setServices(updated);
      setTimeout(() => setEditing(null), 800);
    } catch (e: any) {
      setMsg(`❌ ${e.detail || "Erro"}`);
    }
  };

  if (loading) return <div className="space-y-3">
    <div className="h-8 w-48 bg-slate-800/60 rounded animate-pulse" />
    {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-slate-800/40 rounded animate-pulse" />)}
  </div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Serviços</h1>
        <p className="text-slate-500 text-sm mt-1">{services.length} serviços no catálogo</p>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">ID</th>
              <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Nome</th>
              <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Plataforma</th>
              <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Preço/1K</th>
              <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Min-Max</th>
              <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Tempo</th>
              <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Status</th>
              <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                <td className="px-3 py-2.5 text-slate-400 font-mono text-xs">{s.id}</td>
                <td className="px-3 py-2.5 text-white text-xs max-w-[200px] truncate" title={s.name}>{s.name}</td>
                <td className="px-3 py-2.5 text-slate-500 text-xs">{s.platform?.name || "—"}</td>
                <td className="px-3 py-2.5 text-emerald-400 text-xs font-medium">R$ {s.price.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-slate-400 text-xs">{s.min_amount}-{s.max_amount}</td>
                <td className="px-3 py-2.5 text-slate-500 text-xs">{s.avg_time}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                    s.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>{s.status === "active" ? "Ativo" : "Inativo"}</span>
                </td>
                <td className="px-3 py-2.5">
                  <button onClick={() => openEdit(s)} className="text-xs text-slate-400 hover:text-white transition-colors">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="glass-card p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-semibold text-lg mb-1">{editing.name}</h2>
            <p className="text-xs text-slate-500 mb-4">ID #{editing.id} — {editing.platform?.name}</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Preço /1K (R$)</label>
                  <input type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })} className="input-clou" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="input-clou">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Qtd Mínima</label>
                  <input type="number" value={editForm.min_amount} onChange={(e) => setEditForm({ ...editForm, min_amount: parseInt(e.target.value) || 0 })} className="input-clou" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Qtd Máxima</label>
                  <input type="number" value={editForm.max_amount} onChange={(e) => setEditForm({ ...editForm, max_amount: parseInt(e.target.value) || 0 })} className="input-clou" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Tempo Médio</label>
                <input type="text" value={editForm.avg_time} onChange={(e) => setEditForm({ ...editForm, avg_time: e.target.value })} className="input-clou" placeholder="Ex: 24h" />
              </div>
            </div>

            {msg && <p className="text-sm mt-3">{msg}</p>}

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="btn-secondary text-xs !py-2 !px-4">Cancelar</button>
              <button onClick={saveService} className="btn-primary text-xs !py-2 !px-4">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}