/**
 * Descrições ricas e FAQs por slug de serviço.
 * Cada entrada melhora o SEO on-page com conteúdo único e relevante.
 */
export interface ServiceContent {
  description: string;
  benefits: string[];
  faq: { q: string; a: string }[];
  keywords: string[];
}

const contentMap: Record<string, ServiceContent> = {
  // ─── Instagram ─────────────────────────────────────────────────
  "seguidores-brasil-10k": {
    description:
      "Aumente sua presença no Instagram com seguidores brasileiros reais e entrega acelerada de até 10 mil seguidores por dia. Ideal para perfis que precisam de crescimento rápido e natural, com seguidores de qualidade que interagem com seu conteúdo. Nosso serviço prioriza entregas consistentes, sem quedas bruscas, para que seu perfil mantenha uma aparência autêntica e profissional.",
    benefits: [
      "Seguidores brasileiros reais — público do seu país",
      "Entrega de até 10.000 seguidores por dia — resultados rápidos",
      "Queda mínima — seguidores estáveis",
      "Sem necessidade de senha — só o link do perfil",
      "Suporte via e-mail para acompanhamento",
    ],
    faq: [
      { q: "Preciso dar minha senha do Instagram?", a: "Não. Forneça apenas o link do seu perfil. Nunca pedimos sua senha." },
      { q: "Quanto tempo leva para começar a entrega?", a: "A entrega inicia em até 30 minutos após a confirmação do pedido, podendo levar até 24h para conclusão total dependendo da quantidade." },
      { q: "Os seguidores caem com o tempo?", a: "Nossos seguidores têm queda mínima. Oferecemos garantia de reposição de 30 dias para garantir sua satisfação." },
      { q: "Posso escolher o perfil alvo?", a: "Sim. Basta informar o link do perfil do Instagram que deseja impulsionar. Pode ser seu perfil pessoal, de empresa ou de cliente." },
      { q: "O que acontece se eu não gostar do serviço?", a: "Entre em contato com nosso suporte. Analisamos cada caso e, dentro da política de garantia, realizamos a reposição ou o reembolso em saldo." },
    ],
    keywords: ["seguidores instagram brasileiros", "comprar seguidores brasil", "seguidores reais instagram", "aumentar seguidores instagram rapido"],
  },
  "seguidores-brasil-feminino": {
    description:
      "Seguidores brasileiros do perfil feminino ideal para perfis de moda, beleza, lifestyle e nichos femininos. Com garantia de 365 dias de reposição, este é nosso serviço mais duradouro. Perfeito para influenciadoras, marcas de beleza e lojas virtuais que querem um público alinhado com seu conteúdo.",
    benefits: [
      "Seguidores brasileiros com perfil feminino — audiência qualificada",
      "Garantia de reposição por 365 dias — a mais longa do mercado",
      "Entregas consistentes e discretas",
      "Ideal para perfis de moda, beleza, lifestyle e nicho feminino",
    ],
    faq: [
      { q: "O que significa 'perfil feminino'?", a: "São contas reais identificadas como do gênero feminino, ideais para perfis que desejam uma audiência compatível com seu nicho." },
      { q: "Como funciona a garantia de 365 dias?", a: "Se os seguidores caírem dentro de 365 dias da compra, a gente repõe gratuitamente. Basta abrir um chamado no suporte." },
    ],
    keywords: ["seguidores femininos instagram", "comprar seguidores femininos", "seguidores Brasil feminino", "aumentar seguidores perfil feminino"],
  },
  "seguidores-brasil-reais": {
    description:
      "Seguidores brasileiros com perfis reais e autênticos, com entrega de até 20 mil por dia. Cada seguidor possui foto, bio e publicações — proporcionando um crescimento natural e crível para seu perfil. Ideal para marcas, empresas e profissionais que precisam de credibilidade real.",
    benefits: [
      "Perfis reais com foto, bio e publicações",
      "Entrega de até 20.000 seguidores por dia",
      "Alta retenção — perfis autênticos caem menos",
      "Perfeito para marcas e perfis profissionais",
    ],
    faq: [
      { q: "Qual a diferença para seguidores comuns?", a: "Nossos seguidores reais possuem foto de perfil, bio e postagens. São contas completas que parecem naturais para qualquer visitante." },
      { q: "Esses seguidores interagem com meu conteúdo?", a: "São contas reais, mas a interação (curtidas, comentários) não é garantida. Se precisa de engajamento, veja nossos serviços de curtidas." },
    ],
    keywords: ["seguidores reais instagram", "comprar seguidores autênticos", "seguidores com foto", "aumentar credibilidade instagram"],
  },
  "seguidores-mundiais": {
    description:
      "A opção mais econômica para impulsionar seu perfil no Instagram. Seguidores mundiais com entrega ultrarrápida de até 500 mil por dia. Perfeito para quem precisa de grande volume com baixo custo. Ideal para perfis que não dependem de público local.",
    benefits: [
      "Preço mais baixo do catálogo — maior custo-benefício",
      "Entrega de até 500.000 seguidores por dia",
      "Perfeito para grande volume com orçamento reduzido",
      "Resultados visíveis em horas",
    ],
    faq: [
      { q: "Os seguidores são de quais países?", a: "São seguidores mundiais, de diversas nacionalidades. O perfil pode não parecer 100% brasileiro." },
      { q: "Esse serviço tem refill?", a: "Não. Por ser o serviço mais econômico, não oferecemos garantia de reposição. Recomendamos os serviços brasileiros para maior estabilidade." },
    ],
    keywords: ["seguidores instagram barato", "comprar seguidores mundiais", "seguidores instagram preço baixo", "aumentar seguidores rapido"],
  },
  "curtidas-instantaneas": {
    description:
      "Curtidas instantâneas para suas fotos do Instagram com entrega non-drop — as curtidas não caem com o tempo. Resultado imediato: suas publicações ganham engajamento em minutos. Essencial para o algoritmo do Instagram, que prioriza posts com alto engajamento inicial.",
    benefits: [
      "Curtidas não caem (non-drop) — engajamento permanente",
      "Entrega instantânea — resultados em minutos",
      "Ajuda o algoritmo a impulsionar seu post organicamente",
      "Funciona em fotos, reels e carrosséis",
    ],
    faq: [
      { q: "O que significa 'non-drop'?", a: "Que as curtidas não caem com o tempo. Diferente de serviços comuns, essas curtidas permanecem no seu post permanentemente." },
      { q: "Em quanto tempo recebo as curtidas?", a: "A entrega é instantânea. Em poucos minutos você já vê as curtidas aparecendo no seu post." },
      { q: "Posso comprar para qualquer post?", a: "Sim. Basta informar o link do post, reels ou carrossel do Instagram." },
    ],
    keywords: ["comprar curtidas instagram", "curtidas instantaneas instagram", "engajamento instagram", "curtidas non drop", "curtidas que nao caem"],
  },
  "curtidas-brasileiras-refill": {
    description:
      "Curtidas brasileiras com garantia de reposição de 30 dias. Perfeito para perfis que precisam de engajamento local e autêntico. Curtidas de usuários brasileiros dão mais credibilidade ao seu perfil e ajudam a atrair seguidores orgânicos naturalmente.",
    benefits: [
      "Curtidas de usuários brasileiros",
      "Garantia de reposição de 30 dias",
      "Maior credibilidade — público local",
      "Ajuda no crescimento orgânico do perfil",
    ],
    faq: [
      { q: "Qual a diferença das curtidas instantâneas?", a: "As curtidas brasileiras são de contas brasileiras, ideais para perfis nacionais. Já as instantâneas são mais rápidas mas de origem mista." },
      { q: "Tem refill se cair?", a: "Sim, 30 dias de garantia de reposição para curtidas que caírem." },
    ],
    keywords: ["curtidas brasileiras instagram", "comprar curtidas Brasil", "curtidas instagram brasileiras", "engajamento Brasil"],
  },
  "curtidas-100k-hora": {
    description:
      "Curtidas com entrega ultrarrápida de até 100 mil por hora. Ideal para campanhas que precisam de impulso imediato de engajamento. Perfeito para lançamentos, posts patrocinados e conteúdos que precisam viralizar rapidamente nas primeiras horas.",
    benefits: [
      "Entrega de até 100.000 curtidas por hora",
      "Resultado visível em minutos",
      "Ideal para lançamentos e campanhas",
      "Ajuda o algoritmo a impulsionar o post",
    ],
    faq: [
      { q: "Em quanto tempo recebo as curtidas?", a: "A entrega é ultrarrápida — você vê resultados em minutos, com velocidade de até 100 mil por hora." },
      { q: "Esse serviço tem refill?", a: "Não. Por ser entrega ultrarrápida, não oferecemos garantia de reposição." },
    ],
    keywords: ["curtidas instagem rapido", "curtidas 100k", "comprar curtidas entrega rapida", "engajamento instagram imediato"],
  },
  "visualizacoes-stories": {
    description:
      "Aumente o alcance dos seus stories no Instagram com visualizações reais. Stories com mais visualizações aparecem com mais frequência para seus seguidores e têm maior chance de aparecer no feed de descoberta. Ideal para marcas que usam stories como canal de vendas.",
    benefits: [
      "Mais visualizações nos stories — maior alcance",
      "Ajuda o algoritmo a priorizar seu conteúdo",
      "Ideal para marcas que vendem pelos stories",
      "Entregas rápidas e consistentes",
    ],
    faq: [
      { q: "Funciona em stories do Instagram?", a: "Sim, específico para stories do Instagram. Informe o link do story desejado." },
      { q: "As visualizações são de perfis reais?", a: "Sim, são visualizações de contas reais que assistem ao seu story." },
    ],
    keywords: ["visualizacoes stories", "comprar visualizacoes stories", "alcance stories instagram", "engajamento stories"],
  },
  "visualizacoes-reels": {
    description:
      "Impulsione seus Reels com visualizações reais. O algoritmo do Instagram favorece Reels com alto número de visualizações nas primeiras horas. Com nosso serviço, seu conteúdo ganha tração mais rápido e alcança mais pessoas organicamente.",
    benefits: [
      "Mais visualizações nos Reels — maior alcance orgânico",
      "Ajuda o algoritmo a impulsionar seu conteúdo",
      "Formato prioritário do Instagram em 2026",
      "Entregas rápidas para aproveitar o momento do post",
    ],
    faq: [
      { q: "Funciona em qualquer Reels?", a: "Sim. Basta informar o link do Reels que deseja impulsionar." },
      { q: "As visualizações contam para o algoritmo?", a: "Sim. O Instagram entende que seu Reels tem alto engajamento e mostra para mais usuários organicamente." },
    ],
    keywords: ["visualizacoes reels", "comprar visualizacoes reels", "impulsionar reels", "alcance reels instagram"],
  },

  // ─── TikTok ────────────────────────────────────────────────────
  "visualizacoes-tiktok-ultrafast": {
    description:
      "Visualizações ultrarrápidas para seus vídeos do TikTok. Dê um impulso inicial ao seu conteúdo e aumente as chances de viralizar. O algoritmo do TikTok recompensa vídeos com alto engajamento nas primeiras horas, e nosso serviço entrega visualizações na velocidade máxima disponível.",
    benefits: [
      "Entrega ultrarrápida — resultados em minutos",
      "Ajuda o algoritmo a impulsionar o vídeo",
      "Aumenta as chances de entrar no For You Page",
      "Perfeito para novos criadores de conteúdo",
    ],
    faq: [
      { q: "Funciona em qualquer vídeo do TikTok?", a: "Sim. Basta informar o link do vídeo que deseja impulsionar." },
      { q: "As visualizações parecem reais?", a: "Sim, são visualizações de contas reais que assistem ao seu conteúdo." },
      { q: "Qual a velocidade de entrega?", a: "Ultrafast — você vê resultados em minutos após a confirmação do pedido." },
    ],
    keywords: ["visualizacoes tiktok", "comprar visualizacoes tiktok", "impulsionar tiktok", "viralizar tiktok", "views tiktok"],
  },
  "visualizacoes-tiktok-free": {
    description:
      "Visualizações para TikTok com entrega gratuita e ilimitada — você só paga uma vez e recebe visualizações contínuas. Ideal para perfis que querem crescimento sustentável sem se preocupar com recorrência de pagamento. Resultados consistentes ao longo do tempo.",
    benefits: [
      "Visualizações ilimitadas — entrega contínua",
      "Pagamento único, sem recorrência",
      "Ideal para crescimento sustentável",
      "Resultados consistentes dia após dia",
    ],
    faq: [
      { q: "O que significa 'Free, Ilimitado'?", a: "Significa que após a compra, as visualizações continuam sendo entregues ao longo do tempo, sem necessidade de novas compras." },
      { q: "Quantas visualizações vou receber por dia?", a: "A entrega é gradual e contínua, variando conforme a demanda do provedor. Você recebe visualizações todos os dias." },
    ],
    keywords: ["visualizacoes tiktok ilimitadas", "comprar views tiktok", "crescimento tiktok", "views tiktok gratis"],
  },
  "visualizacoes-tiktok-500k": {
    description:
      "Visualizações em alta escala para TikTok com capacidade de até 500 mil por hora. A opção ideal para quem precisa de grande volume rapidamente. Perfeito para campanhas promocionais, lançamentos de produtos e conteúdos que precisam de tração imediata.",
    benefits: [
      "Alta capacidade — até 500.000 visualizações por hora",
      "Entrega ultrarrápida para grande volume",
      "Ideal para campanhas e lançamentos",
      "Ajuda a posicionar o vídeo no topo dos algoritmos",
    ],
    faq: [
      { q: "Qual a diferença do serviço Ultrafast?", a: "O Ultrafast é mais rápido para volumes menores. Já este serviço é feito para grandes volumes (milhares de visualizações) com alta velocidade." },
      { q: "Tem garantia se as visualizações caírem?", a: "Visualizações no TikTok geralmente não caem. Mas consulte nossa política de garantia para mais detalhes." },
    ],
    keywords: ["visualizacoes tiktok 500k", "comprar views tiktok alto volume", "impulsionar tiktok rapido", "views tiktok 500 mil"],
  },
  "curtidas-tiktok-refill": {
    description:
      "Curtidas para TikTok com garantia de reposição de 30 dias. Aumente o engajamento dos seus vídeos e melhore sua posição no algoritmo. Vídeos com mais curtidas são priorizados pelo For You Page, gerando mais alcance orgânico.",
    benefits: [
      "Curtidas reais com garantia de reposição",
      "Aumenta o engajamento dos seus vídeos",
      "Melhora a posição no algoritmo do TikTok",
      "Garantia de 30 dias — compra segura",
    ],
    faq: [
      { q: "Funciona em qualquer vídeo?", a: "Sim. Informe o link do vídeo do TikTok que deseja impulsionar." },
      { q: "As curtidas caem com o tempo?", a: "Oferecemos garantia de reposição de 30 dias. Se caírem dentro desse período, a gente repõe." },
    ],
    keywords: ["curtidas tiktok", "comprar curtidas tiktok", "engajamento tiktok", "likes tiktok", "curtidas tiktok refill"],
  },
  "curtidas-tiktok-25k": {
    description:
      "Curtidas para TikTok com entrega de até 25 mil por dia. Ideal para criadores que querem engajamento rápido e consistente em seus vídeos. A combinação perfeita entre velocidade e qualidade para impulsionar seu perfil no TikTok.",
    benefits: [
      "Entrega de até 25.000 curtidas por dia",
      "Resultados rápidos e consistentes",
      "Ajuda a impulsionar o algoritmo",
      "Ideal para crescimento de perfil",
    ],
    faq: [
      { q: "Qual a diferença do serviço com refill?", a: "Este serviço não tem garantia de reposição, mas a entrega é mais rápida (25K/dia). O com refill é mais lento mas com garantia." },
      { q: "Em quanto tempo recebo as curtidas?", a: "A entrega começa em minutos e segue até 25 mil por dia até completar o pedido." },
    ],
    keywords: ["curtidas tiktok 25k", "comprar likes tiktok rapido", "engajamento tiktok diario", "curtidas tiktok entrega rapida"],
  },
  "seguidores-tiktok-refill": {
    description:
      "Seguidores para TikTok com garantia de reposição de 30 dias. Construa uma base sólida de seguidores para seu perfil com segurança. Perfis com mais seguidores têm mais autoridade e aparecem mais nas pesquisas e recomendações do TikTok.",
    benefits: [
      "Seguidores reais com garantia de reposição",
      "Aumenta a autoridade do perfil",
      "Melhora a posição em pesquisas",
      "Garantia de 30 dias — risco zero",
    ],
    faq: [
      { q: "Os seguidores são brasileiros?", a: "Os seguidores são mundiais, mas temos serviços brasileiros no Instagram caso precise de público local." },
      { q: "Preciso dar minha senha?", a: "Não. Apenas o link do seu perfil do TikTok." },
    ],
    keywords: ["seguidores tiktok", "comprar seguidores tiktok", "aumentar seguidores tiktok", "seguidores tiktok refill"],
  },
  "seguidores-tiktok-hq": {
    description:
      "Seguidores de alta qualidade para TikTok com entrega de até 100 mil por dia. Perfis completos com fotos e bios, proporcionando um crescimento crível e profissional. Ideal para marcas, empresas e criadores que precisam de autoridade real.",
    benefits: [
      "Seguidores de alta qualidade — perfis completos",
      "Entrega de até 100.000 seguidores por dia",
      "Aspecto natural e crível",
      "Perfeito para marcas e perfis profissionais",
    ],
    faq: [
      { q: "Qual a diferença para seguidores comuns?", a: "Seguidores HQ têm perfis mais completos (foto, bio, algumas publicações), parecendo mais naturais." },
      { q: "Esses seguidores interagem?", a: "São seguidores para volume. Se precisa de engajamento, veja nossos serviços de curtidas." },
    ],
    keywords: ["seguidores tiktok qualidade", "comprar seguidores tiktok hq", "seguidores tiktok alta qualidade", "aumentar seguidores tiktok profissional"],
  },

  // ─── YouTube ───────────────────────────────────────────────────
  "visualizacoes-youtube-suggested": {
    description:
      "Visualizações para YouTube com entrega sugerida (Suggested) e vitalícia — as visualizações permanecem no seu vídeo para sempre. O YouTube prioriza vídeos com alto número de visualizações, aumentando o alcance orgânico e as chances de aparecer nas sugestões relacionadas.",
    benefits: [
      "Visualizações vitalícias — não caem com o tempo",
      "Ajuda o algoritmo a sugerir seu vídeo",
      "Aumenta o alcance orgânico",
      "Perfeito para canais novos e estabelecidos",
    ],
    faq: [
      { q: "O que significa 'Suggested'?", a: "Significa que as visualizações ajudam seu vídeo a aparecer nas sugestões relacionadas do YouTube, gerando mais tráfego orgânico." },
      { q: "As visualizações são permanentes?", a: "Sim, são vitalícias. Diferente de alguns serviços, essas visualizações não caem com o tempo." },
    ],
    keywords: ["visualizacoes youtube", "comprar visualizacoes youtube", "views youtube", "aumentar visualizacoes youtube", "impulsionar video youtube"],
  },
  "visualizacoes-youtube-50k": {
    description:
      "Visualizações para YouTube com entrega de até 50 mil por dia. Ideal para vídeos que precisam de um impulso rápido de alcance. Perfeito para lançamentos, campanhas e conteúdos que dependem de alto número de views nas primeiras 48 horas.",
    benefits: [
      "Entrega de até 50.000 visualizações por dia",
      "Resultados rápidos para lançamentos",
      "Ajuda o algoritmo a ranquear o vídeo",
      "Compatível com todos os tipos de vídeo",
    ],
    faq: [
      { q: "Qual a diferença do Suggested?", a: "Este serviço foca em velocidade (50K/dia), enquanto o Suggested é vitalício mas mais lento." },
      { q: "Funciona em vídeos privados?", a: "O vídeo precisa estar público ou não listado para receber as visualizações." },
    ],
    keywords: ["visualizacoes youtube 50k", "comprar views youtube rapido", "aumentar visualizacoes youtube 50 mil", "impulsionar video youtube"],
  },
  "visualizacoes-youtube-brasil": {
    description:
      "Visualizações únicas do Brasil para YouTube (RAV — Real Active Views). Para criadores e marcas brasileiras que precisam de público local qualificado. Visualizações de usuários reais no Brasil, com ótima retenção.",
    benefits: [
      "Visualizações exclusivamente brasileiras",
      "Usuários reais e ativos (RAV)",
      "Alta retenção e credibilidade",
      "Ideal para canais brasileiros",
    ],
    faq: [
      { q: "O que significa RAV?", a: "Real Active Views — visualizações de usuários reais e ativos, com maior qualidade e retenção." },
      { q: "As visualizações são apenas do Brasil?", a: "Sim, exclusivamente de usuários localizados no Brasil." },
    ],
    keywords: ["visualizacoes youtube brasil", "comprar views youtube brasileiras", "visualizacoes brasileiras youtube", "RAV youtube brasil"],
  },
  "inscritos-youtube-refill": {
    description:
      "Inscritos para seu canal do YouTube com garantia de reposição de 30 dias. Aumente sua base de inscritos e dê mais credibilidade ao seu canal. Canais com mais inscritos têm maior chance de serem recomendados e aparecerem nas pesquisas.",
    benefits: [
      "Inscritos reais com garantia de reposição",
      "Aumenta a credibilidade do canal",
      "Melhora o ranqueamento nas pesquisas",
      "Garantia de 30 dias",
    ],
    faq: [
      { q: "Os inscritos são brasileiros?", a: "São inscritos mundiais. Para público brasileiro, recomendamos combinar com nossos serviços de visualizações Brasil." },
      { q: "Preciso dar acesso ao meu canal?", a: "Não. Apenas o link do seu canal ou vídeo." },
    ],
    keywords: ["inscritos youtube", "comprar inscritos youtube", "aumentar inscritos youtube", "seguidores youtube", "inscritos youtube refill"],
  },

  // ─── Telegram ──────────────────────────────────────────────────
  "visualizacoes-telegram-posts": {
    description:
      "Visualizações para posts do Telegram com entrega de até 50 mil por dia. Aumente o alcance das suas mensagens em grupos e canais. Posts com mais visualizações passam mais credibilidade e atraem mais membros organicamente.",
    benefits: [
      "Visualizações para posts do Telegram",
      "Entrega de até 50.000 por dia",
      "Aumenta a credibilidade do canal/grupo",
      "Ajuda a atrair membros organicamente",
    ],
    faq: [
      { q: "Funciona em grupos e canais?", a: "Sim, funciona tanto em grupos quanto em canais do Telegram. Informe o link da mensagem." },
      { q: "As visualizações são de contas reais?", a: "Sim, são visualizações de contas reais do Telegram." },
    ],
    keywords: ["visualizacoes telegram", "comprar visualizacoes telegram", "views telegram", "alcance telegram", "engajamento telegram"],
  },
  "visualizacoes-telegram-barato": {
    description:
      "A opção mais econômica para visualizações no Telegram. Ideal para quem precisa de volume com baixo custo. Perfeito para canais que publicam conteúdo regularmente e querem dar mais alcance a cada post sem gastar muito.",
    benefits: [
      "Preço mais baixo para visualizações Telegram",
      "Perfeito para alta frequência de posts",
      "Aumenta o alcance de cada mensagem",
      "Custo-benefício imbatível",
    ],
    faq: [
      { q: "Qual a diferença do serviço de 50K/dia?", a: "Este é mais barato mas a entrega é mais lenta. O de 50K/dia é mais rápido." },
      { q: "Funciona em qualquer post?", a: "Sim, qualquer mensagem pública em canal ou grupo do Telegram." },
    ],
    keywords: ["visualizacoes telegram barato", "comprar views telegram", "alcance telegram baixo custo", "engajamento telegram"],
  },
  "membros-telegram-refill": {
    description:
      "Membros para seu grupo ou canal do Telegram com garantia de reposição de 30 dias. Construa uma comunidade ativa e dê mais credibilidade ao seu projeto. Canais com mais membros aparecem mais nas pesquisas do Telegram e atraem mais inscrições orgânicas.",
    benefits: [
      "Membros reais com garantia de reposição",
      "Aumenta a credibilidade do grupo/canal",
      "Melhora a posição em pesquisas",
      "Garantia de 30 dias",
    ],
    faq: [
      { q: "Funciona em grupos e canais?", a: "Sim. Informe o link do grupo ou canal do Telegram que deseja impulsionar." },
      { q: "Os membros interagem no grupo?", a: "São membros para volume. Se precisa de interação, combine com visualizações de posts." },
    ],
    keywords: ["membros telegram", "comprar membros telegram", "aumentar membros grupo telegram", "seguidores telegram", "membros canal telegram"],
  },
};

export function getServiceContent(slug: string): ServiceContent | null {
  return contentMap[slug] || null;
}

export function getDescriptionFallback(slug: string, name: string): string {
  const platform = slug.includes("tiktok") ? "TikTok" : slug.includes("youtube") ? "YouTube" : slug.includes("telegram") ? "Telegram" : slug.includes("twitter") ? "Twitter/X" : "Instagram";
  const type = slug.includes("seguidores") || slug.includes("membros") || slug.includes("inscritos") ? "seguidores" : slug.includes("curtidas") ? "curtidas" : "visualizações";
  return `Impulsione seu ${platform} com ${name.toLowerCase()}. Entrega rápida e automática, pagamento via Pix. Resultados em horas. Suporte para acompanhamento.`;
}
