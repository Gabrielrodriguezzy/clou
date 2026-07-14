"use client";

interface PlatformFilterProps {
  platforms: { id: number; name: string; slug: string }[];
  active: number | null;
  onChange: (id: number) => void;
}

const icons: Record<string, string> = {
  instagram: "📷",
  tiktok: "🎵",
  youtube: "▶️",
  twitter: "🐦",
  facebook: "👍",
  telegram: "✈️",
};

export default function PlatformFilter({ platforms, active, onChange }: PlatformFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {platforms.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${
              active === p.id
                ? "text-emerald-300"
                : "text-slate-400 hover:text-slate-300"
            }`}
          style={
            active === p.id
              ? {
                  background:
                    "linear-gradient(135deg, rgba(5,150,105,0.15), rgba(5,150,105,0.05))",
                  border: "1px solid rgba(5,150,105,0.3)",
                  boxShadow: "0 0 20px rgba(5,150,105,0.08)",
                }
              : { border: "1px solid transparent" }
          }
        >
          <span className="text-base">{icons[p.slug] || "🌐"}</span>
          {p.name}
        </button>
      ))}
    </div>
  );
}
