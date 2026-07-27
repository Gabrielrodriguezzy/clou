import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import { blogPosts, BlogPost } from "@/data/blog-posts";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return { title: "Post não encontrado — Clou Blog" };

  return {
    title: `${post.title} — Clou Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${params.slug}` },
    openGraph: {
      title: `${post.title} — Clou Blog`,
      description: post.excerpt,
      url: `/blog/${params.slug}`,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cloustore.online";

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        {!post ? (
          <div className="text-center py-20">
            <h1 className="text-xl font-bold text-white mb-2">Post não encontrado</h1>
            <Link href="/blog" className="text-emerald-400 hover:text-emerald-300 text-sm">← Voltar ao blog</Link>
          </div>
        ) : (
          <>
            <Link href="/blog" className="text-emerald-400 hover:text-emerald-300 text-sm mb-6 inline-block">← Todos os posts</Link>
            <article>
              <header className="mb-8">
                <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
                  <span>{post.category}</span>
                  <span>•</span>
                  <time>{post.date}</time>
                  <span>•</span>
                  <span>{post.readTime} min de leitura</span>
                </div>
                <h1 className="text-3xl font-bold text-white leading-tight">{post.title}</h1>
                <p className="text-slate-400 mt-3 text-lg">{post.excerpt}</p>
              </header>

              <div className="prose prose-invert prose-slate max-w-none">
                {post.content.split("\n\n").map((paragraph, i) => {
                  if (paragraph.startsWith("## ")) {
                    return <h2 key={i} className="text-xl font-semibold text-white mt-8 mb-4">{paragraph.replace("## ", "")}</h2>;
                  }
                  if (paragraph.startsWith("- **")) {
                    const items = paragraph.split("\n").filter(l => l.startsWith("-"));
                    return (
                      <ul key={i} className="space-y-2 my-4">
                        {items.map((item, j) => (
                          <li key={j} className="text-slate-400 text-sm flex items-start gap-2">
                            <span className="text-emerald-400 mt-1 shrink-0">•</span>
                            {item.replace("- ", "").replace(/\*\*/g, "")}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.startsWith("> ")) {
                    return (
                      <blockquote key={i} className="border-l-2 border-emerald-500/30 pl-4 my-4 text-slate-500 italic text-sm">
                        {paragraph.replace("> ", "")}
                      </blockquote>
                    );
                  }
                  return <p key={i} className="text-slate-400 leading-relaxed mb-4 text-sm">{paragraph}</p>;
                })}
              </div>

              {/* CTA no final do post */}
              <div className="glass-card p-6 mt-10 text-center">
                <p className="text-white font-medium mb-2">Pronto para impulsionar suas redes?</p>
                <p className="text-slate-500 text-sm mb-4">Crie sua conta no Clou e comece agora.</p>
                <Link href="/register" className="btn-accent text-sm !py-2 !px-6 inline-block">Criar Conta Grátis</Link>
              </div>
            </article>

            {/* Schema Article */}
            <JsonLd data={{
              "@context": "https://schema.org",
              "@type": "Article",
              headline: post.title,
              description: post.excerpt,
              datePublished: post.date,
              author: { "@type": "Organization", name: "Clou" },
              publisher: { "@type": "Organization", name: "Clou", url: baseUrl },
              url: `${baseUrl}/blog/${params.slug}`,
            }} />
          </>
        )}
      </main>
    </div>
  );
}
