import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { blogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog — Clou",
  description: "Dicas e estratégias para crescer nas redes sociais. Aprenda como aumentar seguidores, engajamento e alcance no Instagram, TikTok, YouTube e mais.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Clou",
    description: "Dicas e estratégias para crescer nas redes sociais.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Blog</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Dicas, estratégias e guias para crescer suas redes sociais. Conteúdo atualizado para ajudar você a impulsionar seu perfil.
          </p>
        </div>

        <div className="space-y-6">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block glass-card-hover p-6 group">
              <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                <span>{post.category}</span>
                <span>•</span>
                <time>{post.date}</time>
                <span>•</span>
                <span>{post.readTime} min de leitura</span>
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
