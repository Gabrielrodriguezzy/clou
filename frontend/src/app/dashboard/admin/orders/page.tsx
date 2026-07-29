"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface OrderItem {
  id: number;
  user_id: number;
  user_name: string;
  service_name: string;
  link: string;
  quantity: number;
  charge: number;
  cost: number;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusList = ["", "pending", "processing", "in_progress", "completed", "cancelled", "error", "partial"];
const statusLabels: Record<string, string> = {
  pending: "Pendente", processing: "Processando", in_progress: "Em Andamento",
  completed: "Concluído", cancelled: "Cancelado", error: "Erro", partial: "Parcial",
};

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
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colors[status] || "bg-slate-500/10 text-slate-400"}`}>
      {statusLabels[status] || status}
    </span>
  );
};

export default function AdminOrders() {
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<OrderItem | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [msg, setMsg] = useState("");

  const loadOrders = (t: string, status = "") => {
    setLoading(true);
    api.get<OrderItem[]>(`/admin/orders?limit=200${status ? `&status=${status}` : ""}`, t)
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) return;
    setToken(t);
    loadOrders(t);
  }, []);

  const filterByStatus = (s: string) => {
    setStatusFilter(s);
    if (token) loadOrders(token, s);
  };

  const openEdit = (o: OrderItem) => {
    setEditing(o);
    setEditStatus(o.status);
    setEditNotes(o.notes || "");
    setMsg("");
  };

  const saveOrder = async () => {
    if (!editing || !token) return;
    try {
      await api.patch(`/admin/orders/${editing.id}`, { status: editStatus, notes: editNotes }, token);
      setMsg("✅ Salvo");
      loadOrders(token, statusFilter);
      setTimeout(() => setEditing(null), 800);
    } catch (e: any) {
      setMsg(`❌ ${e.detail || "Erro"}`);
    }
  };

  const totalCharge = orders.reduce((s, o) => s + o.charge, 0);
  const totalCost = orders.reduce((s, o) => s + o.cost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pedidos</h1>
        <p className="text-slate-500 text-sm mt-1">{orders.length} pedidos — R$ {totalCharge.toFixed(2)} receita / R$ {totalCost.toFixed(2)} custo</p>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => filterByStatus("")} className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${!statusFilter ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800/50 text-slate-500 border-slate-700/50 hover:border-slate-600"}`}>Todos</button>
        {statusList.filter(Boolean).map((s) => (
          <button key={s} onClick={() => filterByStatus(s)} className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${statusFilter === s ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800/50 text-slate-500 border-slate-700/50 hover:border-slate-600"}`}>
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-600 text-sm">Carregando...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-600 text-sm">Nenhum pedido encontrado</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">#</th>
                <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Usuário</th>
                <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Serviço</th>
                <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Qtd</th>
                <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Valor</th>
                <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Custo</th>
                <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Status</th>
                <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Data</th>
                <th className="text-left px-3 py-2.5 text-xs text-slate-500 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                  <td className="px-3 py-2.5 text-slate-400 font-mono text-xs">#{o.id}</td>
                  <td className="px-3 py-2.5 text-white text-xs">{o.user_name || `#${o.user_id}`}</td>
                  <td className="px-3 py-2.5 text-slate-400 text-xs max-w-[180px] truncate" title={o.service_name}>{o.service_name}</td>
                  <td className="px-3 py-2.5 text-slate-400 text-xs">{o.quantity}</td>
                  <td className="px-3 py-2.5 text-emerald-400 text-xs font-medium">R$ {o.charge.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-slate-500 text-xs">R$ {o.cost.toFixed(2)}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={o.status} /></td>
                  <td className="px-3 py-2.5 text-slate-500 text-xs">{new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => openEdit(o)} className="text-xs text-slate-400 hover:text-white transition-colors">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="glass-card p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-semibold text-lg mb-1">Pedido #{editing.id}</h2>
            <p className="text-xs text-slate-500 mb-4">{editing.service_name} — {editing.user_name}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="input-clou">
                  {statusList.filter(Boolean).map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Observações</label>
                <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className="input-clou resize-none" />
              </div>
            </div>

            {msg && <p className="text-sm mt-3">{msg}</p>}

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="btn-secondary text-xs !py-2 !px-4">Cancelar</button>
              <button onClick={saveOrder} className="btn-primary text-xs !py-2 !px-4">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}