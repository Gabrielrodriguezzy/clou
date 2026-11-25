"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, DepositResponse } from "@/lib/api";

export default function DepositPage() {
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [deposit, setDeposit] = useState<DepositResponse | null>(null);
  const [paid, setPaid] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const router = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) router.push("/login");
    setToken(t || "");
  }, [router]);

  // Buscar saldo atual
  useEffect(() => {
    if (!token) return;
    api.get<{ balance: number }>("/auth/me", token)
      .then(u => setBalance(u.balance))
      .catch(() => {});
  }, [token]);

  // Polling: verifica se o depósito foi pago
  useEffect(() => {
    if (!deposit || paid) return;

    pollRef.current = setInterval(async () => {
      try {
        const updated = await api.get<DepositResponse>(`/deposits/${deposit.id}`, token);
        if (updated.status === "completed" || updated.status === "paid") {
          setPaid(true);
          setSuccess(`✅ Pagamento confirmado! R$ ${deposit.amount.toFixed(2)} creditados na sua conta.`);
          // Atualizar saldo
          const me = await api.get<{ balance: number }>("/auth/me", token);
          setBalance(me.balance);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Tenta de novo na próxima iteração
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [deposit, paid, token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setDeposit(null); setPaid(false);
    const val = parseFloat(amount);
    if (isNaN(val) || val < 1.5) { setError("Valor mínimo: R$ 1,50"); return; }
    setLoading(true);
    try {
      const data = await api.post<DepositResponse>("/deposits", { amount: val }, token);
      setSuccess(`Depósito de R$ ${val.toFixed(2)} criado! Pague o QR Code abaixo.`);
      setDeposit(data);
    } catch (err: any) {
      setError(err.message || "Erro ao criar depósito");
    } finally {
      setLoading(false);
    }
  }

  const presets = [10, 20, 50, 100];

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Depositar</h1>
            <p className="text-slate-500 text-sm mt-1">Adicione saldo na sua conta via Pix</p>
          </div>
          {balance !== null && (
            <div className="glass-card px-4 py-2 text-right">
              <p className="text-xs text-slate-500">Saldo atual</p>
              <p className="text-lg font-bold text-emerald-400">R$ {balance.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      {paid ? (
        <div className="max-w-md">
          <div className="glass-card p-8 text-center border-emerald-500/30">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
            <p className="text-emerald-400 font-semibold mb-4">
              R$ {deposit?.amount.toFixed(2)} creditados na sua conta.
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Seu saldo agora é de <span className="text-white font-medium">R$ {(balance || 0).toFixed(2)}</span>
            </p>
            <div className="flex gap-3 justify-center">
              <a href="/dashboard" className="btn-primary text-sm !py-2 !px-6">
                Ir para o Painel
              </a>
              <button
                onClick={() => { setDeposit(null); setPaid(false); setAmount(""); setSuccess(""); }}
                className="btn-secondary text-sm !py-2 !px-6"
              >
                Novo Depósito
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Valor (R$)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {presets.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(v.toString())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      amount === v.toString()
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-slate-600"
                    }`}
                  >
                    R$ {v.toFixed(2)}
                  </button>
                ))}
              </div>
              <input
                type="number" step="0.01" min="1.5" required
                value={amount} onChange={e => setAmount(e.target.value)}
                className="input-clou"
                placeholder="Ou digite um valor personalizado"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-emerald-400 text-sm">{success}</p>}
            <button
              type="submit" disabled={loading}
              className="btn-accent w-full !py-3"
            >
              {loading ? "Gerando Pix..." : "Gerar Código Pix"}
            </button>
          </form>

          {/* Status: aguardando pagamento */}
          {deposit && !paid && (
            <div className="glass-card p-4 mb-4 text-center border-amber-500/20">
              <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
                <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Aguardando pagamento...
              </div>
            </div>
          )}

          {deposit?.pix_qr_code && (
            <div className="glass-card p-5 mb-4 text-center">
              <p className="text-xs text-slate-500 mb-3 font-medium">Escaneie o QR Code abaixo com seu banco:</p>
              <img
                src={`data:image/png;base64,${deposit.pix_qr_code}`}
                alt="QR Code Pix"
                className="mx-auto w-48 h-48 object-contain"
              />
            </div>
          )}

          {deposit?.pix_qr_text && (
            <div className="glass-card p-5">
              <p className="text-xs text-slate-500 mb-3 font-medium">Ou copie o código Pix (copia e cola):</p>
              <pre className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg break-all whitespace-pre-wrap select-all border border-slate-800/50">{deposit.pix_qr_text}</pre>
              <button
                onClick={() => { navigator.clipboard.writeText(deposit.pix_qr_text || ""); }}
                className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                📋 Copiar código
              </button>
              <p className="text-xs text-slate-600 mt-3">
                ⏱ Este código expira em 30 minutos. Após o pagamento, o saldo é creditado automaticamente.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}