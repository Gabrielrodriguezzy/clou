"use client";

interface ServiceCardProps {
  service: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    min_amount: number;
    max_amount: number;
    avg_time: string;
    slug?: string;
  };
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const isPopular = service.id % 3 === 0;
  const isBestValue = service.id % 5 === 0;

  const displayPrice = service.price < 1
    ? `R$ ${(service.price * 1000).toFixed(2).replace(".", ",")}`
    : `R$ ${service.price.toFixed(2).replace(".", ",")}`;

  const serviceUrl = `/servico/${service.slug || service.id}`;

  return (
    <div className="glass-card-hover p-5 flex flex-col h-full animate-fade-in-up relative group">
      {/* Badges */}
      <div className="flex items-center gap-1.5 mb-3 min-h-[20px]">
        {isPopular && (
          <span className="badge-amber">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 glow-pulse-amber" />
            Popular
          </span>
        )}
        {isBestValue && (
          <span className="badge-emerald">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-pulse-emerald" />
            Melhor Preço
          </span>
        )}
      </div>

      {/* Header (link) */}
      <a href={serviceUrl} className="group/link">
        <h3 className="font-semibold text-white text-sm leading-tight mb-1 group-hover/link:text-emerald-400 transition-colors">
          {service.name}
        </h3>
      </a>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700/50">
          {service.min_amount}-{service.max_amount}
        </span>
        <span className="text-[11px] text-slate-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {service.avg_time}
        </span>
      </div>

      {/* Description */}
      {service.description && (
        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed flex-1">
          {service.description}
        </p>
      )}
      {!service.description && <div className="flex-1" />}

      {/* Price + CTA */}
      <div className="pt-3 border-t border-slate-800/50">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] text-slate-600 block">A partir de</span>
            <span className="text-xl font-bold text-white tracking-tight">{displayPrice}</span>
            <span className="text-xs text-slate-500 font-medium ml-0.5">/mil</span>
          </div>
          <a href={serviceUrl} className="btn-accent text-xs !py-1.5 !px-3">
            Comprar
          </a>
        </div>
      </div>
    </div>
  );
}
