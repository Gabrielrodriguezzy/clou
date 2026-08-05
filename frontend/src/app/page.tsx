"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ServiceCard from "@/components/ServiceCard";
import PlatformFilter from "@/components/PlatformFilter";
import Testimonials from "@/components/Testimonials";
import Diferenciais from "@/components/Diferenciais";
import { api, StatsResponse } from "@/lib/api";
import { SkeletonServiceGrid } from "@/components/Skeletons";

interface Platform {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  min_amount: number;
  max_amount: number;
  avg_time: string;
  platform_id: number;
  platform?: Platform;
}

const plans = [
  {
    name: "Iniciante",
    price: "R$ 19,90",
    features: [
      "100 seguidores Instagram",
      "50 curtidas por post",
      "50 visualizações stories",
      "Suporte por email",
    ],
    highlighted: false,
  },
  {
    name: "Profissional",
    price: "R$ 49,90",
    features: [
      "500 seguidores Instagram",
      "200 curtidas por post",
      "200 visualizações stories",
      "100 visualizações Reels",
      "Suporte prioritário",
    ],
    highlighted: true, id: "profissional",
  },
  {
    name: "Business",
    price: "R$ 99,90",
    features: [
      "1.000 seguidores Instagram",
      "500 curtidas por post",
      "500 visualizações stories",
      "300 visualizações Reels",
      "100 inscritos YouTube",
      "Suporte VIP 24h",
    ],
    highlighted: false, id: "business",
  },
];

const faqs = [
  { q: "Preciso dar minha senha?", a: "Não! Você só precisa fornecer o link do seu perfil. Nunca pedimos sua senha." },
  { q: "Quanto tempo leva para entregar?", a: "A maioria dos serviços é entregue em até 24 horas. Alguns serviços premium podem levar até 48h." },
  { q: "Os seguidores são reais?", a: "Trabalhamos com perfis reais e ativos. Oferecemos garantia de reposição." },
  { q: "Como funciona o pagamento?", a: "Você deposita saldo via Pix e usa esse saldo para comprar os serviços." },
  { q: "Tem garantia?", a: "Sim! Oferecemos garantia de 30 dias para a maioria dos serviços. Se cair, a gente repõe." },
];

export default function Home() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [activePlatform, setActivePlatform] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/platforms`).then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`).then((r) => r.json()),
      api.get<StatsResponse>("/stats").catch(() => null),
    ])
      .then(([p, s, st]) => {
        setPlatforms(p);
        setServices(s);
        setStats(st);
        if (p.length > 0) setActivePlatform(p[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  // Determinar quais stats mostrar
  const statsConfig = [
    { label: "Serviços disponíveis", value: stats ? `${stats.total_services}+` : null },
    { label: "Itens entregues", value: stats ? `${stats.total_items_processed || stats.total_orders * 100}+` : null },
    { label: "Disponibilidade", value: "99,9%" },
    { label: "Usuários ativos", value: stats ? `${stats.total_users}` : null },
  ];

  const filtered = activePlatform
    ? services.filter((s) => s.platform_id === activePlatform)
    : services;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="badge-indigo mb-6">
            Pagamento via Pix · Entrega em até 24h
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
            <span className="text-[#f7f8f8]">
              Suas redes sociais
            </span>
            <br />
            <span className="text-[#d0d6e0]">mais fortes, rápido</span>
          </h1>
          <p className="text-[#8a8f98] text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Seguidores, curtidas e visualizações para Instagram, TikTok, YouTube e mais.
            Pedido feito, pedido entregue — em horas, não dias.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#servicos" className="btn-primary text-base !py-3 !px-8">
              Ver Serviços
            </a>
            <a href="#como-funciona" className="btn-secondary text-base !py-3 !px-8">
              Como Funciona
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="surface-card grid grid-cols-2 md:grid-cols-4 divide-x divide-[rgba(255,255,255,0.05)]">
          {statsConfig.map((s, i) => (
            <div key={i} className="py-6 text-center">
              {s.value ? (
                <p className="text-2xl sm:text-3xl font-bold text-[#f7f8f8]">{s.value}</p>
              ) : (
                <div className="h-8 w-20 mx-auto bg-[#191a1b] rounded animate-pulse" />
              )}
              <p className="text-xs text-[#8a8f98] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="max-w-7xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f7f8f8] mb-3">
            Nossos Serviços
          </h2>
          <p className="text-[#8a8f98] max-w-xl mx-auto">
            Clique na plataforma e veja o que temos
          </p>
        </div>

        <PlatformFilter
          platforms={platforms}
          active={activePlatform}
          onChange={setActivePlatform}
        />

        {loading ? (
          <SkeletonServiceGrid count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-600">
                <p className="text-sm">Nenhum serviço encontrado para esta plataforma.</p>
              </div>
            )}
            {filtered.map((s, i) => (
              <div
                key={s.id}
                style={{ animationDelay: `${(i % 8) * 80}ms` }}
                className="animate-fade-in-up"
              >
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Diferenciais */}
      <div className="lazy-section">
        <Diferenciais />
      </div>

      {/* Como Funciona */}
      <section id="como-funciona" className="lazy-section max-w-6xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f7f8f8] mb-3">
            Como Funciona
          </h2>
          <p className="text-[#8a8f98] max-w-xl mx-auto">
            4 passos. Nada de mistério.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "01",
              title: "Crie sua conta",
              desc: "Leva menos de um minuto. Não pedimos cartão de crédito.",
            },
            {
              step: "02",
              title: "Deposite via Pix",
              desc: "Adicione saldo e pague na hora. O depósito cai instantâneo.",
            },
            {
              step: "03",
              title: "Escolha o serviço",
              desc: "Selecione o que quer, cole o link do seu perfil e confirme.",
            },
            {
              step: "04",
              title: "Acompanhe",
              desc: "Acompanhe o pedido pelo painel. A entrega começa em poucas horas.",
            },
          ].map((item) => (
            <div key={item.step} className="surface-card p-6 text-center animate-fade-in-up" style={{ animationDelay: `${parseInt(item.step) * 100}ms` }}>
              <div className="text-xs font-medium text-[#62666d] uppercase tracking-wider mb-3">{item.step}</div>
              <h3 className="text-[#f7f8f8] font-semibold mb-2 text-sm">{item.title}</h3>
              <p className="text-[#8a8f98] text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="lazy-section max-w-6xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f7f8f8] mb-3">
            Kits Recomendados
          </h2>
          <p className="text-[#8a8f98] max-w-xl mx-auto">
            Do básico ao completo — escolhe seu kit
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 ${
                plan.highlighted
                  ? "surface-elevated border-2 border-[#5e6ad2]/40"
                  : "surface-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5e6ad2] text-white text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  Mais Popular
                </div>
              )}
              <h3 className="text-[#f7f8f8] font-semibold text-lg mb-1">{plan.name}</h3>
              <p className="text-3xl font-bold text-[#f7f8f8] mb-1">{plan.price}</p>
              <p className="text-xs text-[#62666d] mb-6">ou monte seu combo</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-[#d0d6e0] flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#7170ff] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full rounded-lg text-sm font-medium transition-all ${
                  plan.highlighted
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
              >
                {plan.highlighted ? "Escolher Plano" : plan.id === "business" ? "Quero Esse" : "Ver Detalhes"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <div className="lazy-section">
        <Testimonials />
      </div>

      {/* FAQ */}
      <section id="faq" className="lazy-section max-w-3xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f7f8f8] mb-3">
            Perguntas Frequentes
          </h2>
          <p className="text-[#8a8f98] max-w-xl mx-auto">
            Tire suas dúvidas sobre nossos serviços
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="surface-card p-4 group cursor-pointer">
              <summary className="text-sm font-medium text-[#d0d6e0] list-none flex items-center justify-between gap-4">
                {faq.q}
                <svg className="w-4 h-4 text-[#62666d] shrink-0 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-sm text-[#8a8f98] mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lazy-section max-w-4xl mx-auto px-4 mb-20">
        <div className="surface-elevated relative overflow-hidden p-8 sm:p-12 text-center">
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#f7f8f8] mb-4">
              Bora fazer sua rede crescer?
            </h2>
            <p className="text-[#8a8f98] mb-8 max-w-lg mx-auto">
              Crie sua conta e receba seguidores, curtidas e visualizações em minutos.
            </p>
            <a
              href="/register"
              className="btn-accent text-base !py-3 !px-10 inline-block"
            >
              Criar Conta Grátis
            </a>
            <p className="text-xs text-[#62666d] mt-4">Sem cartão de crédito · Pagamento via Pix</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/logo-clou.png"
                alt="Clou"
                className="w-7 h-7 object-contain"
              />
              <span className="text-sm font-semibold text-[#f7f8f8]">Clou</span>
              <span className="text-xs text-[#62666d]">© 2026</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/blog" className="text-xs text-[#62666d] hover:text-[#d0d6e0] transition-colors">Blog</a>
              <a href="/termos" className="text-xs text-[#62666d] hover:text-[#d0d6e0] transition-colors">Termos</a>
              <a href="/privacidade" className="text-xs text-[#62666d] hover:text-[#d0d6e0] transition-colors">Privacidade</a>
              <a href="/contato" className="text-xs text-[#62666d] hover:text-[#d0d6e0] transition-colors">Contato</a>
            </div>
            <p className="text-xs text-[#62666d]">Feito no Brasil, pra ajudar sua conta a crescer.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
