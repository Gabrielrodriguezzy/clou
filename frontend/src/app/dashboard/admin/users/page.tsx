"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface UserItem {
  id: number;
  email: string;
  name: string;
  balance: number;
  role: string;
  is_active: boolean;
  created_at: string;
  total_orders: number;
}

export default function AdminUsers() {
  const [token, setToken] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", balance: 0, is_active: true });
  const [saveMsg, setSaveMsg] = useState("");

  const loadUsers = (t: string) => {
    api.get<UserItem[]>(`/admin/users?limit=200${search ? `&search=${encodeURIComponent(search)}` : ""}`, t)
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) return;
    setToken(t);
    loadUsers(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    const t = token;
    const timer = setTimeout(() => loadUsers(t), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const openEdit = (u: UserItem) => {
    setEditing(u);
    setEditForm({ name: u.name, role: u.role, balance: u.balance, is_active: u.is_active });
    setSaveMsg("");
  };

  const saveUser = async () => {
    if (!editing || !token) return;
    try {
      await api.patch(`/admin/users/${editing.id}`, editForm, token);
      setSaveMsg("✅ Salvo com sucesso");
      loadUsers(token);
      setTimeout(() => { setEditing(null); setSaveMsg(""); }, 1200);
    } catch (e: any) {
      setSaveMsg(`❌ ${e.detail || "Erro ao salvar"}`);
    }
  };

  if (loading) return <div className="space-y-4">
    <div className="h-8 w-48 bg-slate-800/60 rounded animate-pulse" />
    <div className="h-10 w-64 bg-slate-800/60 rounded animate-pulse" />
    {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-800/40 rounded animate-pulse" />)}
  </div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuários</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} usuário(s) encontrado(s)</p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar por nome ou email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-clou max-w-md"
      />

      {/* Table */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">ID</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Nome</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Saldo</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Tipo</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Pedidos</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-slate-600 text-sm">Nenhum usuário encontrado</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{u.id}</td>
                <td className="px-4 py-3 text-white text-xs">{u.name}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{u.email}</td>
                <td className="px-4 py-3 text-emerald-400 text-xs font-medium">R$ {u.balance.toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                  u.role === "superadmin" || u.role === "admin"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                }`}>{u.role}</span></td>
                <td className="px-4 py-3 text-slate-400 text-xs">{u.total_orders}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                    u.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>{u.is_active ? "Ativo" : "Inativo"}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(u)} className="text-xs text-slate-400 hover:text-white transition-colors">Editar</button>
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
            <h2 className="text-white font-semibold text-lg mb-4">Editar {editing.name}</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Nome</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-clou" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Tipo</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="input-clou">
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Saldo (R$)</label>
                <input type="number" step="0.01" value={editForm.balance} onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) || 0 })} className="input-clou" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20" />
                <label htmlFor="is_active" className="text-sm text-slate-400">Ativo</label>
              </div>
            </div>

            {saveMsg && <p className="text-sm mt-3">{saveMsg}</p>}

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="btn-secondary text-xs !py-2 !px-4">Cancelar</button>
              <button onClick={saveUser} className="btn-primary text-xs !py-2 !px-4">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}