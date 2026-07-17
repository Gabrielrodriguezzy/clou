# Diagnóstico SEO — Clou

> **Data:** 16/07/2026
> **Ferramentas utilizadas:** Análise estática de HTML, validação de sitemap/robots, extração de cabeçalhos HTTP, Lighthouse (tentativa), PageSpeed Insights (indisponível para localhost).
> **Status:** MVP funcional em localhost. Sem Google Search Console ou Analytics configurados (pendente deploy).

---

## 1. SEO Técnico

### 🔴 Críticos

| # | Problema | Evidência | Impacto | Esforço |
|---|----------|-----------|---------|---------|
| 1 | **robots.txt ausente** (404) | GET /robots.txt → 404. Next.js não tem rota explícita. | **Alto** — crawlers podem encontrar dificuldade em descobrir URLs, ou pior, indexar páginas de dashboard com conteúdo sensível. | Baixo |
| 2 | **Sitemap incompleto** | Apenas 3 URLs no XML (/ , /login, /register). Faltam 9 páginas: termos, privacidade, serviços dinâmicos, dashboard pages. | **Alto** — Google descobre menos conteúdo, páginas de serviço não são indexadas. | Baixo |
| 3 | **Canonical tags ausentes** em todas as páginas | Nenhuma página tem `<link rel="canonical">`. | **Alto** — risco de conteúdo duplicado, especialmente com parâmetros de sessão/query. | Baixo |
| 4 | **Páginas de dashboard indexáveis** | Nenhuma tag `<meta name="robots" content="noindex">` em páginas internas como /dashboard/*. Usuários logados podem ter conteúdo exposto. | **Alto** — vazamento de conteúdo privado e thin content. | Baixo |

### 🟡 Importantes

| # | Problema | Evidência | Impacto | Esforço |
|---|----------|-----------|---------|---------|
| 5 | **Sitemap aponta para domínio errado** | URLs usam `https://clou.gg` (domínio futuro), não `http://localhost:3000` (ambiente atual). Não quebra em produção se o domínio for configurado, mas precisa de ajuste. | **Médio** — se deploy for feito em VPS com IP, as URLs estarão erradas. | Baixo |
| 6 | **Sem dados estruturados (Schema.org)** | Nenhum JSON-LD ou microdata implementado — nem Organization, nem WebSite, nem BreadcrumbList, nem Product (para serviços). | **Médio** — sem rich results nas SERPs. | Médio |
| 7 | **Sem Open Graph / Twitter Cards** | Nenhuma página tem `og:title`, `og:description`, `og:image`, ou `twitter:card`. | **Médio** — links compartilhados em redes sociais não têm preview. | Baixo |
| 8 | **H1 ausente em todas as páginas** | Landing page usa apenas H2+ (18 H2s). Nenhum H1 em nenhuma página. | **Médio** — quebra a hierarquia de headings; Google entende menos a estrutura do conteúdo. | Baixo |

### 🟢 Recomendados

| # | Problema | Evidência | Impacto | Esforço |
|---|----------|-----------|---------|---------|
| 9 | **Performance não medida** | Lighthouse não pode rodar (Chromium não instalado). Necessário validar Core Web Vitals (LCP, CLS, INP) antes do deploy. | Médio | Médio |
| 10 | **Tamanho da página** | Landing page tem ~15KB de HTML + ~127KB de CSS (Tailwind). Sem lazy-loading explícito de componentes abaixo da dobra. | Médio | Médio |
| 11 | **Compressão de imagens** | Landing não carrega imagens além de ícones inline. Sem problemas agora, mas será crítico quando adicionar imagens de serviços/planos. | Baixo | Baixo |
| 12 | **URLs não incluem slug de plataforma** | URLs de serviço: `/servico/[slug]` (ex: `/servico/seguidores-brasil-10k`). Boa prática — mas poderia incluir a plataforma (`/instagram/seguidores-brasil-10k`). | Baixo | Baixo |

---

## 2. SEO On-Page

### 🔴 Críticos

| # | Problema | Evidência | Impacto | Esforço |
|---|----------|-----------|---------|---------|
| 13 | **Title duplicado em login/register** | `/login` e `/register` usam o mesmo title da landing: "Clou — Impulsione suas Redes Sociais". Cada página deve ter title único (ex: "Entrar — Clou", "Criar Conta — Clou"). | **Alto** — canibalização de palavras-chave; Google não sabe qual página ranquear para qual query. | Baixo |
| 14 | **Meta description duplicada** | Mesmo problema do title: login e register herdam a descrição da landing. | **Alto** — baixa CTR nas SERPs para páginas internas. | Baixo |

### 🟡 Importantes

| # | Problema | Evidência | Impacto | Esforço |
|---|----------|-----------|---------|---------|
| 15 | **Deep pages sem meta tags próprias** | Páginas do dashboard (/dashboard/comprar, /dashboard/pedidos, etc.) não têm SEO metadata alguma — herdando a da landing também. | **Médio** — menos crítico se forem noindex. | Baixo |
| 16 | **Alt text em imagens** | Nenhuma imagem `<img>` com `alt` descritivo. Ícones SVG e emojis são usados no lugar de imagens. | **Baixo** — não há imagens de produto ainda. Monitorar quando adicionar. | Baixo |
| 17 | **Links internos com texto âncora genérico** | Footer tem links "Termos", "Privacidade" — bons. Mas na landing, links usam "#" e âncoras sem texto descritivo. | **Médio** — melhor usar âncoras descritivas (ex: "Ver todos os serviços de Instagram"). | Baixo |
| 18 | **Profundidade de conteúdo** | Landing page tem ~380 linhas de JSX, com seções de hero, serviços, diferenciais, FAQ, depoimentos. Conteúdo raso em descrições de serviços (1-2 frases cada). | **Médio** — Google valoriza profundidade E-E-A-T. Serviços precisam de páginas dedicadas ricas. | Alto |

### 🟢 Recomendados

| # | Problema | Evidência | Impacto | Esforço |
|---|----------|-----------|---------|---------|
| 19 | **Palavras-chave no conteúdo** | Palavras-chave primárias (seguidores, curtidas, Instagram) estão presentes e naturais. Porém sem variações de cauda longa. | Baixo | Médio |
| 20 | **Heading hierarchy inconsistente** | Landing usa H2 como nível mais alto (sem H1). Páginas de serviço (`/servico/[slug]`) usam H1 via o título do serviço (bom). | Médio | Baixo |

---

## 3. SEO Off-Page / Autoridade

### 🔴 Críticos

| # | Problema | Evidência | Impacto | Esforço |
|---|----------|-----------|---------|---------|
| 21 | **Sem domínio próprio no ar** | Site rodando apenas em localhost. Sem domínio, não há SEO off-page possível. | **Alto** — blocker absoluto. | Alto |
| 22 | **Zero backlinks** | Sem domínio no ar, não há backlinks naturais. Após o deploy, será necessário construir autoridade. | **Alto** — esperado para site novo. | Alto |
| 23 | **Sem Google Search Console configurado** | Necessário para submeter sitemap, monitorar indexação e identificar problemas de rastreio. | **Alto** — sem ele, opera no escuro. | Baixo |

### 🟡 Importantes

| # | Problema | Evidência | Impacto | Esforço |
|---|----------|-----------|---------|---------|
| 24 | **Sem Google Analytics** | Não é possível medir tráfego, taxa de rejeição, conversões ou comportamento do usuário. | **Médio** — sem dados, não há otimização baseada em evidência. | Baixo |
| 25 | **Sem presença em redes sociais** | Perfil do Clou não identificado em Instagram, TikTok ou YouTube. | **Médio** — sinais de marca importantes para E-E-A-T. | Médio |

---

## 4. Estratégia de SEO / Marketing

### 🟡 Importantes

| # | Observação | Detalhe | Prioridade |
|---|-----------|---------|------------|
| 26 | **Palavras-chave sem mapeamento formal** | Nenhuma pesquisa de volume ou dificuldade foi feita. Palavras atuais no meta keywords são genéricas demais. | **Importante** — necessário mapear antes de criar conteúdo. |
| 27 | **Sem páginas de blog** | Sem conteúdo informacional (artigos, guias) para atrair tráfego de topo de funil. | **Importante** — SEO em SMM depende de conteúdo útil. |
| 28 | **Concorrente identificado (verifiedatacado) inacessível** | O concorrente mencionado não respondeu a crawling. Pode estar offline, bloqueando bots, ou ser inacessível. | **Médio** — necessário encontrar concorrentes acessíveis. |
| 29 | **Funil de conversão orgânico inexistente** | Tráfego orgânico → landing → cadastro → depósito → compra. Não há CTAs baseadas em conteúdo. | **Médio** — precisa ser construído com conteúdo. |

---

## Plano de Ação Priorizado

| # | Ação | Categoria | Impacto | Esforço | Prazo |
|---|------|-----------|---------|---------|-------|
| 1 | Criar `robots.txt` com bloqueio de `/dashboard/*` e `/api/*` | Técnico | 🔴 Alto | 🟢 Baixo | **1 hora** |
| 2 | Atualizar sitemap para incluir todas as 11+ páginas + serviços dinâmicos | Técnico | 🔴 Alto | 🟢 Baixo | **1 hora** |
| 3 | Adicionar `canonical` tags em todas as páginas | Técnico | 🔴 Alto | 🟢 Baixo | **30 min** |
| 4 | Adicionar `noindex` no dashboard/*, login, register (se não forem páginas de destino) | Técnico | 🔴 Alto | 🟢 Baixo | **30 min** |
| 5 | Corrigir title/meta description únicos para login, register, dashboard, termos, privacidade | On-Page | 🔴 Alto | 🟢 Baixo | **1 hora** |
| 6 | Adicionar H1 em todas as páginas (especialmente landing) | On-Page | 🟡 Médio | 🟢 Baixo | **30 min** |
| 7 | Implementar Schema.org JSON-LD (Organization + WebSite + BreadcrumbList + Product para serviços) | Técnico | 🟡 Médio | 🟡 Médio | **2 horas** |
| 8 | Adicionar Open Graph + Twitter Cards em todas as páginas | Técnico | 🟡 Médio | 🟢 Baixo | **1 hora** |
| 9 | Configurar Google Search Console e Analytics (após deploy) | Estratégia | 🔴 Alto | 🟢 Baixo | **30 min** |
| 10 | Comprar domínio (cloustore.online ou clou.gg) e colocar site no ar | Estratégia | 🔴 Alto | 🔴 Alto | **1-2 dias** |
| 11 | Criar página de blog integrada ao Clou | Estratégia | 🟡 Médio | 🔴 Alto | **1 semana** |
| 12 | Pesquisar concorrentes acessíveis e fazer análise de gap | Estratégia | 🟡 Médio | 🟡 Médio | **2 horas** |
| 13 | Criar conteúdo rico para páginas de serviço (descrições detalhadas, FAQ por serviço, screenshots) | On-Page | 🟡 Médio | 🟡 Médio | **4 horas** |
| 14 | Validar Core Web Vitals (LCP, CLS, INP) com PageSpeed Insights após deploy | Técnico | 🟡 Médio | 🟢 Baixo | **30 min** |
| 15 | Estruturar URLs com hierarquia de plataforma (`/instagram/seguidores-brasil`) | Técnico | 🟢 Baixo | 🟡 Médio | **Opcional** |

---

## Lista de Palavras-chave Recomendadas

### Transacionais (intenção de compra)

| Palavra-chave | Volume estimado | Concorrência | Página alvo |
|--------------|----------------|--------------|-------------|
| comprar seguidores Instagram | Alto | Alta | Landing / Página Instagram |
| seguidores Instagram barato | Alto | Alta | Landing / Página Instagram |
| comprar curtidas Instagram | Médio | Média | Página Instagram Curtidas |
| comprar visualizações TikTok | Médio | Média | Página TikTok |
| seguidores TikTok barato | Médio | Média | Página TikTok |
| comprar visualizações YouTube | Baixo | Baixa | Página YouTube |
| painel SMM brasileiro | Médio | Média | Landing |
| comprar inscritos YouTube | Baixo | Baixa | Página YouTube |
| seguidores Instagram 10k | Médio | Alta | Página Instagram |
| comprar membros Telegram | Baixo | Baixa | Página Telegram |

### Informacionais (topo de funil — conteúdo de blog)

| Palavra-chave | Intenção | Página alvo |
|--------------|----------|-------------|
| como conseguir seguidores no Instagram rápido | Informacional | Post de blog |
| dicas para crescer no Instagram em 2026 | Informacional | Post de blog |
| o que é SMM panel | Informacional | Post de blog |
| vale a pena comprar seguidores? | Informacional | Post de blog |
| como funciona painel SMM | Informacional | Post de blog |
| seguidores orgânicos vs pagos | Informacional | Post de blog |

### Navegacionais

| Palavra-chave | Intenção | Página alvo |
|--------------|----------|-------------|
| clou painel | Navegacional | Landing |
| clou seguidores | Navegacional | Landing |
| clou login | Navegacional | Login |

---

## Resumo Executivo

**O Clou tem uma base técnica sólida** — Next.js moderno, FastAPI otimizado, Docker. O SEO atual, no entanto, está em **estágio pré-lançamento** e precisa de correções fundamentais ANTES de ir ao ar.

### Os 5 problemas que mais impactam o negócio:

1. **Sem robots.txt + sitemap incompleto** → Google não descobre nem indexa corretamente o site. Correção de 1 hora.
2. **Title e meta description duplicados** → login, register e dashboard canibalizam a landing. Correção de 1 hora.
3. **Sem Schema.org, OG tags, canonical** → sem rich results, sem preview em redes sociais, risco de duplicidade. Correção de 2-3 horas.
4. **Zero autoridade (sem domínio, sem backlinks, sem Search Console)** → o SEO começa só quando o site for ao ar.
5. **Sem conteúdo informacional (blog)** → o tráfego orgânico para SMM vem 70% de conteúdo útil, não de páginas de venda.

### O que fazer primeiro (ordem):

```
1. HOJE  → robots.txt + sitemap completo + canonical + noindex do dashboard
2. HOJE  → Title/Meta únicos por página + H1 em toda landing
3. AMANHÃ → Schema.org JSON-LD + OG Tags
4. DEPLOY → Search Console + Analytics
5. SEMANA 1 → Pesquisar concorrentes + criar 3 posts de blog
6. SEMANA 2 → Acompanhar indexação, ajustar
```

Com essas correções, o Clou estará **preparado para SEO desde o primeiro dia no ar**, em vez de perder semanas corrigindo problemas básicos enquanto o Google já começou a indexar.

---

*Relatório gerado por Hermes — Especialista Sênior em SEO/SEM*
*16 de julho de 2026*
