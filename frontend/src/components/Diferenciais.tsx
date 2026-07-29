"use client";

const items = [
  {
    icon: (
      <svg className="w-10 h-10 mx-auto" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" className="fill-emerald-500/10" />
        <path d="M20 8l2.47 5.01 5.53.8-4 3.9.95 5.49L20 20.9l-4.95 2.6.95-5.49-4-3.9 5.53-.8L20 8z" className="fill-emerald-400" />
      </svg>
    ),
    title: "Qualidade e Organização",
    desc: "Serviços apresentados de forma clara e funcional, facilitando o uso conforme suas necessidades.",
  },
  {
    icon: (
      <svg className="w-10 h-10 mx-auto" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" className="fill-emerald-500/10" />
        <rect x="8" y="14" width="24" height="16" rx="3" className="fill-emerald-400/20 stroke-emerald-400" strokeWidth="1.5" />
        <path d="M12 20h5l2 3 3-5 2 3h4" className="stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Pagamento via Pix",
    desc: "Pagamento instantâneo, aprovado na hora. Seu saldo disponível em segundos.",
  },
  {
    icon: (
      <svg className="w-10 h-10 mx-auto" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" className="fill-emerald-500/10" />
        <path d="M12 28V12h10l6 8-6 8H12z" className="fill-emerald-400/20 stroke-emerald-400" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M18 18h2M18 22h4" className="stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Preços Acessíveis",
    desc: "Valores competitivos para todos os bolsos. Do iniciante ao profissional.",
  },
  {
    icon: (
      <svg className="w-10 h-10 mx-auto" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" className="fill-emerald-500/10" />
        <path d="M12 22c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8h-4l-4 3v-3.5" className="fill-emerald-400/20 stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="22" r="1" className="fill-emerald-400" />
        <circle cx="20" cy="22" r="1" className="fill-emerald-400" />
        <circle cx="24" cy="22" r="1" className="fill-emerald-400" />
      </svg>
    ),
    title: "Suporte ao Cliente",
    desc: "Equipe disponível para esclarecer dúvidas e auxiliar no uso da plataforma.",
  },
];

export default function Diferenciais() {
  return (
    <section className="max-w-6xl mx-auto px-4 mb-20">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Por que escolher o Clou?
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Combinamos qualidade, acessibilidade e suporte para oferecer a melhor experiência
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="glass-card-hover p-5 text-center animate-fade-in-up"
          >
            <div className="mb-3 flex justify-center">{item.icon}</div>
            <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
