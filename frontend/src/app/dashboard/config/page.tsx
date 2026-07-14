"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ConfigPage() {
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<"perfil" | "senha" | "preferencias">("perfil");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Perfil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");

  // Senha
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  // Preferências
  const [emailNotif, setEmailNotif] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [prefMsg, setPrefMsg] = useState("");
  const [prefError, setPrefError] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) { router.push("/login"); return; }
    setToken(t);

    api.me(t)
      .then((u) => {
        setName(u.name);
        setEmail(u.email);
      })
      .catch(() => {
        localStorage.removeItem("clou_token");
        router.push("/login");
      });

    api.get<{ email_notifications: boolean; marketing_emails: boolean }>("/auth/preferences", t)
      .then((p) => {
        setEmailNotif(p.email_notifications);
        setMarketing(p.marketing_emails);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function handleProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMsg(""); setProfileError(""); setSaving(true);
    try {
      await api.put("/auth/profile", { name }, token);
      setProfileMsg("Nome atualizado com sucesso!");
    } catch (err: any) {
      setProfileError(err.message);
    } finally { setSaving(false); }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg(""); setPwError(""); setSaving(true);
    if (newPw !== confirmPw) { setPwError("Senhas não conferem"); setSaving(false); return; }
    if (newPw.length < 6) { setPwError("Nova senha deve ter no mínimo 6 caracteres"); setSaving(false); return; }
    try {
      await api.post("/auth/change-password", { current_password: currentPw, new_password: newPw }, token);
      setPwMsg("Senha alterada com sucesso!");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      setPwError(err.message);
    } finally { setSaving(false); }
  }

  async function handlePreferences() {
    setPrefMsg(""); setPrefError(""); setSaving(true);
    try {
      await api.put("/auth/preferences", { email_notifications: emailNotif, marketing_emails: marketing }, token);
      setPrefMsg("Preferências salvas!");
    } catch (err: any) {
      setPrefError(err.message);
    } finally { setSaving(false); }
  }

  if (loading) return null;

  const tabs = [
    { id: "perfil" as const, label: "Perfil", icon: "👤" },
    { id: "senha" as const, label: "Senha", icon: "🔒" },
    { id: "preferencias" as const, label: "Preferências", icon: "⚙️" },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie sua conta e preferências</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-800/50 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Perfil */}
      {tab === "perfil" && (
        <div className="max-w-lg">
          <div className="glass-card p-6">
            <h2 className="text-white font-semibold mb-4">Informações do Perfil</h2>
            <form onSubmit={handleProfile} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Email</label>
                <input type="email" value={email} disabled className="input-clou opacity-60 cursor-not-allowed" />
                <p className="text-[10px] text-slate-600 mt-1">O email não pode ser alterado</p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Nome</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-clou" />
              </div>
              {profileMsg && <p className="text-emerald-400 text-sm">{profileMsg}</p>}
              {profileError && <p className="text-red-400 text-sm">{profileError}</p>}
              <button type="submit" disabled={saving} className="btn-accent !py-2">
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Senha */}
      {tab === "senha" && (
        <div className="max-w-lg">
          <div className="glass-card p-6">
            <h2 className="text-white font-semibold mb-4">Alterar Senha</h2>
            <form onSubmit={handlePassword} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Senha Atual</label>
                <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required className="input-clou" />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Nova Senha</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required className="input-clou" minLength={6} />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Confirmar Nova Senha</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required className="input-clou" />
              </div>
              {pwMsg && <p className="text-emerald-400 text-sm">{pwMsg}</p>}
              {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
              <button type="submit" disabled={saving} className="btn-accent !py-2">
                {saving ? "Alterando..." : "Alterar Senha"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Preferências */}
      {tab === "preferencias" && (
        <div className="max-w-lg">
          <div className="glass-card p-6">
            <h2 className="text-white font-semibold mb-4">Preferências</h2>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Notificações por Email</p>
                  <p className="text-xs text-slate-500">Receba atualizações sobre seus pedidos</p>
                </div>
                <button
                  onClick={() => { setEmailNotif(!emailNotif); }}
                  className={`relative w-11 h-6 rounded-full transition-all duration-200 ${emailNotif ? "bg-emerald-500" : "bg-slate-700"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${emailNotif ? "translate-x-5" : ""}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Emails de Marketing</p>
                  <p className="text-xs text-slate-500">Promoções e novidades sobre novos serviços</p>
                </div>
                <button
                  onClick={() => { setMarketing(!marketing); }}
                  className={`relative w-11 h-6 rounded-full transition-all duration-200 ${marketing ? "bg-emerald-500" : "bg-slate-700"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${marketing ? "translate-x-5" : ""}`} />
                </button>
              </div>
              {prefMsg && <p className="text-emerald-400 text-sm">{prefMsg}</p>}
              {prefError && <p className="text-red-400 text-sm">{prefError}</p>}
              <button onClick={handlePreferences} disabled={saving} className="btn-accent !py-2">
                {saving ? "Salvando..." : "Salvar Preferências"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
