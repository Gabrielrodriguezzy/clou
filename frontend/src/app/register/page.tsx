"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.register(email, password, name);
      localStorage.setItem("clou_token", data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-emerald-400">Clou</span>
          </Link>
          <p className="text-slate-500 text-sm mt-2">Crie sua conta</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Nome</label>
            <input
              type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Senha</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? "Criando..." : "Criar Conta"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
