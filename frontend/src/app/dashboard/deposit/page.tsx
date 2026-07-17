"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, DepositResponse } from "@/lib/api";

export default function DepositPage() {
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [deposit, setDeposit] = useState<DepositResponse | null>(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("clou_token");
    if (!t) router.push("/login");
    setToken(t || "");
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setDeposit(null);
    const val = parseFloat(amount);
    if (isNaN(val) || val < 1.5) { setError("Valor mínimo: R$ 1,50"); return; }
    setLoading(true);
    try {
      const data = await api.post<DepositResponse>("/deposits", { amount: val }, token);
      setSuccess(`Depósito de R$ ${val.toFixed(2)} criado com sucesso!`);
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
        <h1 className="text-2xl font-bold text-white">Depositar</h1>
        <p className="text-slate-500 text-sm mt-1">Adicione saldo na sua conta via Pix</p>
      </div>

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

        {deposit?.pix_qr_text && (
          <div className="glass-card p-5">
            <p className="text-xs text-slate-500 mb-3 font-medium">Código Pix (copia e cola):</p>
            <pre className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg break-all whitespace-pre-wrap select-all border border-slate-800/50">{deposit.pix_qr_text}</pre>
            <p className="text-xs text-slate-600 mt-3">
              ⏱ Este código expira em 30 minutos. Após o pagamento, o saldo é creditado automaticamente.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
