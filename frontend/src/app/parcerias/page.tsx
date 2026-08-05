"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";

// ─── FAQ Data ──────────────────────────────────────────────────────────

const faqItems = [
  {
    q: "O que eu preciso para ser parceiro?",
    a: "Ter um grupo de divulgação no Instagram, Telegram, WhatsApp ou qualquer comunidade digital com pessoas que queiram crescer nas redes sociais. Não tem tamanho mínimo de grupo.",
  },
  {
    q: "Quanto vou ganhar?",
    a: "A comissão é combinada diretamente comigo. O percentual varia conforme o tamanho e atividade do seu grupo. Os valores são pagos toda semana, sem falta.",
  },
  {
    q: "Como recebo o pagamento?",
    a: "Via Pix, toda semana. Na sexta ou sábado eu fecho os números e pago direto na sua chave. Sem burocracia, sem taxas.",
  },
  {
    q: "Posso divulgar para outras pessoas fora do grupo?",
    a: "Pode e é bem-vindo. Seu link é seu — toda venda que vier dele entra na sua comissão, independente de onde a pessoa veio.",
  },
  {
    q: "Preciso criar conta no Clou?",
    a: "Não precisa. O link já é personalizado com seu código. Quem clica e compra já fica vinculado a você automaticamente. Eu cuido de todo o resto.",
  },
  {
    q: "Tem contrato ou fidelidade?",
    a: "Não. Parceria é na base da confiança e do resultado. Seu link continua ativo enquanto você quiser divulgar. Pode parar quando quiser, sem multa nem burocracia.",
  },
];

// ─── Steps ─────────────────────────────────────────────────────────────

const steps = [
  {
    number: "1",
    title: "Chama no direct",
    desc: "Me manda uma mensagem falando do seu grupo. Digo o tamanho, quantos membros ativos, qual nicho. É rapidinho.",
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
    title: "Ganho seu link",
    desc: "Te envio um link exclusivo com seu código. Ele já fica pronto pra você compartilhar no seu grupo. É copiar e colar.",
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
    title: "Todo mundo compra",
    desc: "Seus membros acessam o link e compram seguidores, curtidas e visualizações. A entrega é automática, você não faz nada.",
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
    title: "Pix na sua conta",
    desc: "Fecho a conta da semana e mando o Pix direto pra sua chave. Semanalmente, sem precisar cobrar, sem atraso.",
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
    title: "Comissão combinada",
    desc: "Você não fica preso a uma taxa fixa. A % é conversada e justa pro tamanho do seu grupo.",
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
    title: "Pix semanal",
    desc: "Sem esperar fechar mês. Toda semana o dinheiro cai na sua conta. Sempre em dia.",
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
    title: "Link exclusivo",
    desc: "Seu código personalizado. Toda venda que bater nele é sua. Você acompanha tudo comigo.",
  },
  {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" className="fill-emerald-500/10" />
        <path d="M12 22c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8h-4l-4 3v-3.5" className="fill-emerald-400/20 stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 20l2 2 4-4" className="stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Suporte direto",
    desc: "Não é robô nem chat. Você fala comigo direto. Qualquer dúvida, eu resolvo na hora.",
  },
];

// ─── Gamification Tiers ────────────────────────────────────────────────

const tiers = [
  {
    name: "Bronze",
    range: "Até R$ 500",
    commission: "5%",
    bonus: "",
    color: "text-[#8a8f98]",
    border: "border-[rgba(255,255,255,0.08)]",
    bg: "bg-transparent",
  },
  {
    name: "Prata",
    range: "R$ 500 — R$ 2.000",
    commission: "7%",
    bonus: "",
    color: "text-[#d0d6e0]",
    border: "border-[rgba(255,255,255,0.12)]",
    bg: "bg-transparent",
  },
  {
    name: "Ouro",
    range: "R$ 2.000 — R$ 5.000",
    commission: "10%",
    bonus: "Bônus de R$ 50",
    color: "text-[#f7f8f8]",
    border: "border-[#5e6ad2]/40",
    bg: "bg-[#5e6ad2]/10",
    featured: true,
  },
  {
    name: "Diamante",
    range: "Acima de R$ 5.000",
    commission: "15%",
    bonus: "Bônus de R$ 150",
    color: "text-[#7170ff]",
    border: "border-[#7170ff]/40",
    bg: "bg-[#7170ff]/10",
  },
];

// ─── Component ─────────────────────────────────────────────────────────

export default function ParceriasPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main>
        {/* ─── HERO ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-20">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(94,106,210,0.15)] border border-[#5e6ad2]/30 text-[#7170ff] text-xs font-semibold tracking-wide mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7170ff]" />
                Programa de Parcerias
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#f7f8f8] mb-5 leading-tight">
                Transforme seu grupo
                <br />
                em <span className="text-[#7170ff]">renda extra</span>
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                Você tem um grupo de divulgação e quer ganhar dinheiro com ele?
                Eu te dou um link exclusivo, e toda venda que vier dele vira Pix
                na sua conta toda semana.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#quero-parceria"
                  className="btn-primary text-base px-8 py-3 glow-pulse-emerald"
                >
                  Quero ser parceiro
                </a>
                <a
                  href="#como-funciona"
                  className="btn-secondary text-base px-8 py-3"
                >
                  Como funciona
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="glass-card py-4 text-center">
                <p className="text-2xl font-bold text-white">
                  5%<span className="text-xs text-slate-500">+</span>
                </p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">Comissão inicial</p>
              </div>
              <div className="glass-card py-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">Pix</p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">Pagamento semanal</p>
              </div>
              <div className="glass-card py-4 text-center">
                <p className="text-2xl font-bold text-white">15%</p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">Comissão máxima</p>
              </div>
              <div className="glass-card py-4 text-center">
                <p className="text-2xl font-bold text-white">R$ 20</p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">Mínimo pra saque</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BENEFITS ───────────────────────────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-3">
                Por que fechar parceria?
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Seu grupo já tem gente que quer crescer nas redes. Você só precisa
                do link certo.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="glass-card-hover p-5 text-center"
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
                Quatro passos entre você e seu primeiro Pix de parceiro.
              </p>
            </div>

            <div className="relative">
              {/* Vertical line (desktop) */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/20 via-indigo-500/20 to-emerald-500/20" />

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

        {/* ─── GAMIFICATION / TIERS ───────────────────────────── */}
        <section className="py-16 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/3 blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-3">
                🏆 Quanto mais vendas, maior sua fatia
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Conforme seus indicados compram, você sobe de nível e ganha mais.
                Bônus extras nos tiers mais altos.
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
                  {tier.bonus && (
                    <div className="mt-3 inline-block px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] font-semibold text-amber-400">
                        🎁 {tier.bonus}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="glass-card p-5 mt-6 max-w-2xl mx-auto text-center">
              <p className="text-sm text-slate-400">
                <span className="text-[#7170ff] font-semibold">Progressão automática:</span>{" "}
                seus níveis são recalculados todo mês. Quanto mais seus indicados
                compram, mais você ganha.
              </p>
            </div>

            {/* Leaderboard preview */}
            <div className="mt-10 glass-card p-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🏅</span>
                <h3 className="text-white font-semibold text-sm">
                  Top Parceiros do Mês
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🥇</span>
                    <span className="text-sm font-medium text-white">[Vaga aberta]</span>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold">R$ 0,00 em comissão</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🥈</span>
                    <span className="text-sm font-medium text-slate-400">[Vaga aberta]</span>
                  </div>
                  <span className="text-xs text-slate-500">R$ 0,00</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🥉</span>
                    <span className="text-sm font-medium text-slate-400">[Vaga aberta]</span>
                  </div>
                  <span className="text-xs text-slate-500">R$ 0,00</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-3 text-center">
                Os 3 primeiros colocados todo mês ganham bônus extra. Pode ser você.
              </p>
            </div>
          </div>
        </section>

        {/* ─── CALL TO ACTION ──────────────────────────────────── */}
        <section id="quero-parceria" className="py-16 lg:py-20">
          <div className="max-w-2xl mx-auto px-4">
            <div className="glass-card p-8 md:p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[#5e6ad2]/20 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#7170ff]" viewBox="0 0 24 24" fill="none">
                  <path d="M20 12H4M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Quero ser parceiro
              </h2>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                Manda uma mensagem agora que a gente acerta os detalhes. Me conta
                qual seu grupo, quantos membros, e eu te explico o resto.
              </p>
              <a
                href="https://wa.me/5511964989003"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent text-base px-10 py-3 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Falar no WhatsApp
              </a>
              <p className="text-xs text-slate-600 mt-4">
                Respondo em até 30 minutos. Combinamos a taxa, crio seu link e já
                começa a ganhar.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FOR SOCIAL MEDIA (extra pitch) ──────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="max-w-3xl mx-auto px-4">
            <div className="glass-card p-6 md:p-8 border-emerald-500/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base mb-2">
                    Pronto pra enviar no direct
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Copia o texto abaixo e manda pra qualquer dono de grupo de
                    divulgação:
                  </p>
                  <div className="bg-slate-900 border border-slate-700/60 rounded-lg p-4 text-sm text-slate-400 leading-relaxed">
                    <p className="mb-2">
                      <span className="text-emerald-400">🎯</span>{" "}
                      <span className="text-white font-medium">Fala, dono do grupo!</span>
                    </p>
                    <p>
                      Te chamei porque quero fazer uma parceria. Você tem um grupo
                      de gente que quer crescer no Instagram, certo? Eu tenho uma
                      plataforma de serviços SMM (seguidores, curtidas, visualizações).
                    </p>
                    <p className="mt-2">
                      A ideia é simples: eu te dou um link exclusivo. Você
                      compartilha no grupo, e toda venda que vier dele, você ganha
                      uma comissão em Pix — toda semana.
                    </p>
                    <p className="mt-2">
                      Zero esforço. Só compartilhar o link. Quer ver os detalhes?
                      Dá uma olhada:{" "}
                      <span className="text-[#7170ff] font-medium">
                        cloustore.online/parcerias
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const text = `🎯 Fala, dono do grupo!\n\nTe chamei porque quero fazer uma parceria. Você tem um grupo de gente que quer crescer no Instagram, certo? Eu tenho uma plataforma de serviços SMM (seguidores, curtidas, visualizações).\n\nA ideia é simples: eu te dou um link exclusivo. Você compartilha no grupo, e toda venda que vier dele, você ganha uma comissão em Pix — toda semana.\n\nZero esforço. Só compartilhar o link. Quer ver os detalhes? Dá uma olhada: cloustore.online/parcerias`;
                      navigator.clipboard.writeText(text);
                    }}
                    className="mt-3 btn-secondary text-sm !py-2 !px-4"
                  >
                    📋 Copiar texto
                  </button>
                </div>
              </div>
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
                Dúvidas comuns sobre o programa de parcerias do Clou.
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
                Bora começar?
              </h2>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                Manda uma mensagem no WhatsApp ou no direct do Instagram.
                Respondo você pessoalmente, combinamos tudo e você começa a
                ganhar ainda essa semana.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://wa.me/5511964989003"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent text-base px-8 py-3 inline-flex items-center gap-2"
                >
                  WhatsApp
                </a>
                <a
                  href="https://instagram.com/seuperfil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-base px-8 py-3 inline-flex items-center gap-2"
                >
                  Direct
                </a>
              </div>
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

      {/* ─── Footer inline ─────────────────────────────────────── */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/logo-clou.png"
                alt="Clou"
                className="w-7 h-7 object-contain"
              />
              <span className="text-sm font-semibold text-white">Clou</span>
              <span className="text-xs text-slate-600">© 2026</span>
            </div>
            <p className="text-xs text-slate-700">
              Parceria é na confiança. Bora crescer juntos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}