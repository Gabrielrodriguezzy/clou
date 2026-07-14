import { MetadataRoute } from "next";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clou.gg";

  const pages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  // Service pages
  try {
    const res = await fetch(`${API}/services`, { next: { revalidate: 300 } });
    if (res.ok) {
      const services = await res.json();
      for (const s of services) {
        const slug = s.slug || s.id;
        pages.push({
          url: `${baseUrl}/servico/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        });
      }
    }
  } catch {}

  return pages;
}
