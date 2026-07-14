"use client";

const testimonials = [
  {
    name: "Vitor Felipe",
    role: "Instagram",
    text: "A experiência foi positiva e o painel é fácil de usar. Recomendo!",
    rating: 5,
  },
  {
    name: "Júlia Martins",
    role: "TikTok",
    text: "A plataforma ajudou a estruturar melhor a gestão das campanhas. Atendimento claro e organizado.",
    rating: 5,
  },
  {
    name: "João Oliveira",
    role: "YouTube",
    text: "Ferramenta prática para centralizar serviços de divulgação. O painel é simples de navegar.",
    rating: 4,
  },
  {
    name: "Vitória F.",
    role: "Instagram",
    text: "Tive uma boa experiência com a plataforma e com o suporte oferecido. Resultados rápidos!",
    rating: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? "text-amber-400" : "text-slate-700"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-4 mb-20">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          O que nossos clientes dizem
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Feedbacks reais de quem já usa o Clou para impulsionar suas redes
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="glass-card-hover p-5 animate-fade-in-up"
          >
            {/* Stars */}
            <Stars count={t.rating} />
            {/* Text */}
            <p className="text-sm text-slate-400 mt-3 mb-4 leading-relaxed">
              &ldquo;{t.text}&rdquo;
            </p>
            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-slate-600">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
