import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Contato — Clou",
  description:
    "Entre em contato com o Clou. Tire dúvidas, peça ajuda ou envie sugestões. Estamos disponíveis por email e Telegram.",
  alternates: { canonical: "/contato" },
  openGraph: {
    title: "Contato — Clou",
    description: "Fale com a equipe Clou. Email e Telegram.",
    url: "/contato",
    type: "website",
  },
};

const channels = [
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" className="fill-emerald-500/10" />
        <rect x="8" y="12" width="24" height="18" rx="3" className="fill-emerald-400/20 stroke-emerald-400" strokeWidth="1.5" />
        <path d="M10 14l10 7 10-7" className="stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Email",
    desc: "Resposta em até 24h úteis",
    action: { label: "suporte@cloustore.online", href: "mailto:suporte@cloustore.online" },
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" className="fill-emerald-500/10" />
        <path d="M12 22c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8h-4l-4 3v-3.5" className="fill-emerald-400/20 stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="22" r="1.5" className="fill-emerald-400" />
        <circle cx="20" cy="22" r="1.5" className="fill-emerald-400" />
        <circle cx="24" cy="22" r="1.5" className="fill-emerald-400" />
      </svg>
    ),
    title: "Telegram",
    desc: "Resposta rápida em horário comercial",
    action: { label: "@HernesProjectBot", href: "https://t.me/HernesProjectBot" },
  },
];

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="max-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Fale com a gente</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Tem dúvidas sobre nossos serviços, precisa de ajuda com um pedido ou quer
            sugerir algo? Escolha o canal mais prático para você.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
          {channels.map((ch) => (
            <a
              key={ch.title}
              href={ch.action.href}
              target={ch.action.href.startsWith("http") ? "_blank" : undefined}
              rel={ch.action.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="glass-card-hover p-6 text-center block"
            >
              <div className="mb-3 flex justify-center">{ch.icon}</div>
              <h2 className="text-white font-semibold text-sm mb-1">{ch.title}</h2>
              <p className="text-xs text-slate-500 mb-3">{ch.desc}</p>
              <span className="text-xs text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                {ch.action.label}
              </span>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-400 transition-colors">
            ← Voltar ao início
          </Link>
        </div>
      </main>
    </div>
  );
}