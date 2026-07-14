"use client";

const items = [
  {
    icon: "🏆",
    title: "Qualidade e Organização",
    desc: "Serviços apresentados de forma clara e funcional, facilitando o uso conforme suas necessidades.",
  },
  {
    icon: "💚",
    title: "Pagamento via Pix",
    desc: "Pagamento instantâneo, aprovado na hora. Seu saldo disponível em segundos.",
  },
  {
    icon: "💰",
    title: "Preços Acessíveis",
    desc: "Valores competitivos para todos os bolsos. Do iniciante ao profissional.",
  },
  {
    icon: "🎧",
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
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
