"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";

// ─── FAQ Data ──────────────────────────────────────────────────────────

const faqItems = [
  {
    q: "Quem pode participar do programa de afiliados?",
    a: "Qualquer pessoa maior de 18 anos com presença em redes sociais, blog, canal no YouTube, grupo de Telegram ou qualquer canal de divulgação digital pode se cadastrar. Não exigimos experiência.",
  },
  {
    q: "Como funciona a comissão progressiva?",
    a: "Sua comissão começa em 5% e sobe até 15% conforme o volume de vendas do mês. Quanto mais seus indicados compram, maior sua porcentagem. O nível é recalculado automaticamente.",
  },
  {
    q: "Como e quando recebo minhas comissões?",
    a: "Via Pix, toda segunda-feira. O mínimo para pagamento é R$ 20, sem limite máximo. Você recebe exatamente o que gerou de comissão.",
  },
  {
    q: "Existe algum custo para se cadastrar?",
    a: "Não. O cadastro é gratuito. Você só passa a ganhar quando suas indicações compram nossos serviços.",
  },
  {
    q: "Como consigo meus materiais de divulgação?",
    a: "Assim que o cadastro for aprovado, você ganha acesso ao painel com banners, links personalizados e textos prontos.",
  },
  {
    q: "Posso divulgar em qualquer lugar?",
    a: "Pode. Redes sociais, WhatsApp, Telegram, YouTube, blog, grupos de Discord, email. Só pedimos divulgação honesta, sem spam ou páginas enganosas.",
  },
];

// ─── Tiers ─────────────────────────────────────────────────────────────

const tiers = [
  {
    name: "Bronze",
    range: "Até R$ 500",
    commission: "5%",
    color: "text-[#8a8f98]",
    border: "border-[rgba(255,255,255,0.08)]",
    bg: "bg-transparent",
  },
  {
    name: "Prata",
    range: "R$ 500 — R$ 2.000",
    commission: "7%",
    color: "text-[#d0d6e0]",
    border: "border-[rgba(255,255,255,0.12)]",
    bg: "bg-transparent",
  },
  {
    name: "Ouro",
    range: "R$ 2.000 — R$ 5.000",
    commission: "10%",
    color: "text-[#f7f8f8]",
    border: "border-[#5e6ad2]/40",
    bg: "bg-[#5e6ad2]/10",
    featured: true,
  },
  {
    name: "Diamante",
    range: "Acima de R$ 5.000",
    commission: "15%",
    color: "text-[#7170ff]",
    border: "border-[#7170ff]/40",
    bg: "bg-[#7170ff]/10",
  },
];

// ─── Steps ─────────────────────────────────────────────────────────────

const steps = [
  {
    number: "1",
    title: "Cadastre-se",
    desc: "Preencha o formulário ali embaixo. A análise é rápida e você recebe seu link na hora.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" className="fill-teal-500/10" />
        <path d="M12 28v-2a4 4 0 014-4h8a4 4 0 014 4v2" className="stroke-teal-400" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="20" cy="16" r="4" className="stroke-teal-400" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Divulgue seu link",
    desc: "Copie seu link exclusivo e compartilhe com amigos, seguidores e grupos. Acompanhe tudo pelo painel.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" className="fill-teal-500/10" />
        <path d="M16 24l8-8" className="stroke-teal-400" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="26" r="3" className="fill-teal-400/20 stroke-teal-400" strokeWidth="1.5" />
        <circle cx="26" cy="14" r="3" className="fill-teal-400/20 stroke-teal-400" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "Ganhe comissão",
    desc: "Você ganha um percentual de cada venda dos seus indicados. Quanto mais vendem, maior sua fatia.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" className="fill-teal-500/10" />
        <path d="M20 12v16M12 20h16" className="stroke-teal-400" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="20" cy="20" r="10" className="fill-teal-400/20 stroke-teal-400" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    number: "4",
    title: "Receba via Pix",
    desc: "Seu pagamento cai direto na sua chave Pix toda semana, sem burocracia. Mínimo de R$ 20 para saque.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" className="fill-teal-500/10" />
        <rect x="10" y="14" width="20" height="14" rx="2" className="fill-teal-400/20 stroke-teal-400" strokeWidth="1.5" />
        <path d="M14 18h12M14 22h8" className="stroke-teal-400" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ─── Benefits ──────────────────────────────────────────────────────────

const benefits = [
  {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" className="fill-emerald-500/10" />
        <path d="M16 30l4-4 4 4 8-8" className="stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="24" r="12" className="fill-emerald-400/10 stroke-emerald-400" strokeWidth="1.5" />
      </svg>
    ),
    title: "Comissão progressiva",
    desc: "Comece com 5%. Chegue até 15% conforme o volume de vendas sobe.",
  },
  {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" className="fill-emerald-500/10" />
        <rect x="12" y="16" width="24" height="20" rx="3" className="fill-emerald-400/20 stroke-emerald-400" strokeWidth="1.5" />
        <path d="M16 22h16M16 28h10" className="stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="34" cy="34" r="8" className="fill-amber-400/20 stroke-amber-400" strokeWidth="1.5" />
        <path d="M34 30v8M30 34h8" className="stroke-amber-400" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Pagamento via Pix",
    desc: "Toda semana, sem pedir. O valor cai direto na sua chave Pix.",
  },
  {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" className="fill-emerald-500/10" />
        <rect x="10" y="14" width="28" height="20" rx="4" className="fill-emerald-400/20 stroke-emerald-400" strokeWidth="1.5" />
        <path d="M18 24l4 4 8-8" className="stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 22h6M32 22h6" className="stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Materiais de divulgação",
    desc: "Banners, textos prontos e links personalizados. É só copiar e postar.",
  },
];

// ─── Component ─────────────────────────────────────────────────────────

export default function AfiliadosPage() {
  const [form, setForm] = useState({ name: "", email: "", pix_key: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    ref_code: string;
    referral_link: string;
    message: string;
  } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/partners/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          pix_key: form.pix_key || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || data.message || "Erro ao cadastrar. Tente novamente.");
        setLoading(false);
        return;
      }

      setSuccess(data);
      setLoading(false);
    } catch (err) {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
      setLoading(false);
    }
  };

  const copyRefLink = async () => {
    if (!success?.referral_link) return;
    try {
      await navigator.clipboard.writeText(success.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = success.referral_link;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main>
        {/* ─── HERO ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-20">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(94,106,210,0.15)] border border-[#5e6ad2]/30 text-[#7170ff] text-xs font-semibold tracking-wide mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7170ff]" />
                Programa de Afiliados
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#f7f8f8] mb-5 leading-tight">
                Ganhe dinheiro
                <br />
                divulgando o{" "}
                <span className="text-[#7170ff]">
                  Clou
                </span>
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                Você divulga, a gente paga. Compartilhe seu link com quem quer
                crescer nas redes e ganhe comissão em cada compra que vier dele.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#cadastro"
                  className="btn-primary text-base px-8 py-3 glow-pulse-emerald"
                >
                  Quero ser afiliado
                </a>
                <a
                  href="#como-funciona"
                  className="btn-secondary text-base px-8 py-3"
                >
                  Como funciona
                </a>
              </div>
            </div>

            {/* Benefits cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="glass-card-hover p-6 text-center"
                >
                  <div className="mb-4 flex justify-center">{b.icon}</div>
                  <h3 className="text-white font-semibold text-sm mb-2">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── COMO FUNCIONA ──────────────────────────────────── */}
        <section id="como-funciona" className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-3">
                Como funciona
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Quatro passos entre você e a primeira comissão.
              </p>
            </div>

            <div className="relative">
              {/* Vertical line (desktop) */}
              <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-emerald-500/30 via-emerald-500/10 to-transparent" />

              <div className="space-y-8 md:space-y-12">
                {steps.map((step, i) => (
                  <div
                    key={step.number}
                    className={`flex flex-col md:flex-row items-center gap-6 ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"} text-center`}
                    >
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {step.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
                        {step.desc}
                      </p>
                    </div>

                    {/* Step badge */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-14 h-14 rounded-full glass-card flex items-center justify-center border-emerald-500/20">
                        {step.icon}
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {step.number}
                      </div>
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── TABELA DE COMISSÕES ────────────────────────────── */}
        <section className="py-16 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/3 blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-3">
                Tabela de comissões
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Quanto mais você vende, maior sua comissão. Os tiers são
                atualizados automaticamente a cada mês.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative glass-card p-6 text-center transition-all duration-300 ${
                    tier.featured
                      ? "border-[#5e6ad2]/40 scale-[1.02]"
                      : ""
                  }`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5e6ad2] text-white text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                      Mais popular
                    </div>
                  )}

                  <h3 className={`text-lg font-bold ${tier.color} mb-1`}>
                    {tier.name}
                  </h3>
                  <p className="text-xs text-[#8a8f98] mb-4">{tier.range}</p>
                  <div className="text-3xl font-bold text-[#f7f8f8]">
                    {tier.commission}
                  </div>
                  <p className="text-[10px] text-[#62666d] mt-1 uppercase tracking-wider">
                    de comissão
                  </p>
                </div>
              ))}
            </div>

            {/* Extra info */}
            <div className="glass-card p-5 mt-6 max-w-2xl mx-auto text-center">
              <p className="text-sm text-slate-400">
                <span className="text-[#7170ff] font-semibold">Como conta:</span>{" "}
                a comissão sai do valor líquido de cada venda. O nível é definido
                pelo volume acumulado no mês.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FORMULÁRIO DE CADASTRO ─────────────────────────── */}
        <section id="cadastro" className="py-16 lg:py-20">
          <div className="max-w-2xl mx-auto px-4">
            <div className="glass-card p-8 md:p-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Quero ser afiliado
                </h2>
                <p className="text-slate-500 text-sm">
                  Preencha os dados abaixo e receba seu link de indicação
                  exclusivo.
                </p>
              </div>

              {success ? (
                /* ─── Success State ─── */
                <div className="text-center animate-fade-in-up">
                  <div className="w-16 h-16 rounded-full bg-[#5e6ad2]/20 mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-[#7170ff]"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Cadastro enviado!
                  </h3>
                  <p className="text-sm text-slate-400 mb-6">
                    {success.message || "Vamos analisar seu cadastro e ativar em breve!"}
                  </p>

                  <div className="glass-card p-5 mb-6 text-left">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">
                      Seu código de afiliado
                    </p>
                    <p className="text-2xl font-bold text-[#7170ff] text-center mb-4">
                      {success.ref_code}
                    </p>

                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">
                      Seu link de indicação
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={success.referral_link}
                        className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none"
                      />
                      <button
                        onClick={copyRefLink}
                        className={`btn-accent text-sm !py-2 !px-4 whitespace-nowrap ${copied ? "!bg-emerald-600" : ""}`}
                      >
                        {copied ? "Copiado! ✓" : "Copiar"}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    Guarde seu código e link. Você também receberá estas
                    informações por email.
                  </p>
                </div>
              ) : (
                /* ─── Form ─── */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs text-slate-400 mb-1.5 font-medium"
                    >
                      Nome completo <span className="text-[#7170ff]">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      className="input-clou"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs text-slate-400 mb-1.5 font-medium"
                    >
                      Email <span className="text-[#7170ff]">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      className="input-clou"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="pix_key"
                      className="block text-xs text-slate-400 mb-1.5 font-medium"
                    >
                      Chave Pix{" "}
                      <span className="text-slate-600">(opcional)</span>
                    </label>
                    <input
                      id="pix_key"
                      name="pix_key"
                      type="text"
                      value={form.pix_key}
                      onChange={handleChange}
                      placeholder="CPF, email, telefone ou chave aleatória"
                      className="input-clou"
                    />
                    <p className="text-[10px] text-slate-600 mt-1">
                      Informe sua chave Pix para receber as comissões mais
                      rápido.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full text-base !py-3"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        Cadastrando...
                      </span>
                    ) : (
                      "Quero ser afiliado"
                    )}
                  </button>

                  <p className="text-[10px] text-slate-600 text-center">
                    Ao se cadastrar, você concorda com nossos{" "}
                    <Link
                      href="/termos"
                      className="text-[#7170ff] hover:text-[#828fff] underline"
                    >
                      Termos de Uso
                    </Link>{" "}
                    e{" "}
                    <Link
                      href="/privacidade"
                      className="text-[#7170ff] hover:text-[#828fff] underline"
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ─── FAQ ────────────────────────────────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-3">
                Perguntas frequentes
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Dúvidas comuns sobre o programa de afiliados do Clou.
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className="glass-card overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-sm font-medium text-white pr-4">
                      {item.q}
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-300 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === i ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ──────────────────────────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="glass-card p-10">
              <h2 className="text-2xl font-bold text-white mb-3">
                Pronto para começar?
              </h2>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                Cadastre-se agora e comece a ganhar dinheiro divulgando o Clou
                para sua audiência.
              </p>
              <a
                href="#cadastro"
                className="btn-accent text-base px-10 py-3 inline-block"
              >
                Quero ser afiliado
              </a>
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="text-sm text-slate-600 hover:text-slate-400 transition-colors"
              >
                ← Voltar ao início
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}