export const instagramContent = {
  hero: {
    title: "Impulsione seu Instagram",
    subtitle:
      "A plataforma mais completa para crescer no Instagram. Seguidores brasileiros, curtidas reais e visualizações para Reels e Stories. Pagamento via Pix, entrega em minutos.",
    stats: [
      { value: "8", label: "Serviços Instagram", suffix: "" },
      { value: "R$ 0,12", label: "Preço inicial", suffix: "/mil" },
      { value: "0-5", label: "Entrega em", suffix: " min" },
      { value: "💚", label: "Pagamento", suffix: " Pix" },
    ],
  },
  triggers: [
    {
      icon: "📈",
      title: "O algoritmo favorece engajamento rápido",
      desc: "O Instagram prioriza posts com alto engajamento nas primeiras 2 horas. Nosso serviço entrega curtidas e visualizações em minutos — seu conteúdo ganha tração orgânica naturalmente.",
    },
    {
      icon: "👀",
      title: "Perfis com +1.000 seguidores têm 4x mais alcance",
      desc: "Dados reais: usuários confiam mais em perfis estabelecidos. Com seguidores brasileiros de qualidade, seu perfil passa credibilidade e atrai seguidores orgânicos.",
    },
    {
      icon: "🎯",
      title: "Reels é o formato que mais cresce",
      desc: "O Instagram está empurrando Reels com força total em 2026. Vídeos com muitas visualizações nas primeiras horas são impulsionados pelo algoritmo para milhares de pessoas.",
    },
    {
      icon: "🛡️",
      title: "Compra segura com garantia",
      desc: "Todos os serviços têm garantia de reposição. Sua compra protegida, seu perfil seguro. Sem senha — só o link do perfil.",
    },
  ],
  guide: [
    {
      icon: "🌟",
      title: "Quer aparecer?",
      desc: "Curtidas e visualizações",
      items: [
        "Curtidas Instantâneas Non-Drop (R$0,60/mil)",
        "Curtidas Brasileiras c/ Refill (R$0,60/mil)",
        "Visualizações Reels (R$0,12/mil)",
        "Visualizações Stories",
      ],
      cta: "Ver Serviços de Engajamento",
      anchor: "curtidas-instantaneas",
    },
    {
      icon: "👑",
      title: "Quer autoridade?",
      desc: "Seguidores de qualidade",
      items: [
        "Seguidores Brasil 10K/dia (R$5,40/mil)",
        "Seguidores Brasil Feminino c/ Refill (R$5,36/mil)",
        "Seguidores Brasil 20K/dia Alta Retenção",
        "Seguidores Mundiais 100K/dia (R$5,36/mil)",
      ],
      cta: "Ver Serviços de Seguidores",
      anchor: "seguidores-brasil-10k",
    },
    {
      icon: "🚀",
      title: "Quer viralizar?",
      desc: "Reels e Stories",
      items: [
        "Visualizações Reels (R$0,12/mil)",
        "Visualizações Stories",
        "Curtidas 300K/dia — ultra rápido",
        "Combos de engajamento completo",
      ],
      cta: "Ver Serviços de Viralização",
      anchor: "visualizacoes-reels",
    },
  ],
  faq: [
    {
      q: "Preciso dar minha senha do Instagram?",
      a: "Não. Nunca pedimos sua senha. Você só informa o link do seu perfil, post ou Reels. Sua conta fica 100% segura.",
    },
    {
      q: "Os seguidores são brasileiros?",
      a: "Temos serviços específicos com seguidores brasileiros (como 'Seguidores Brasil 10K/dia' e 'Seguidores Brasil Feminino'). Também temos seguidores mundiais para quem busca o melhor custo-benefício.",
    },
    {
      q: "Quanto tempo leva para começar a entrega?",
      a: "A entrega começa em minutos após a confirmação do pagamento. Curtidas instantâneas aparecem em segundos. Seguidores podem levar de 30 min a algumas horas dependendo do volume.",
    },
    {
      q: "O que significa 'Non-Drop' nas curtidas?",
      a: "Significa que as curtidas não caem com o tempo. Diferente de serviços comuns, nossas curtidas instantâneas permanecem no seu post permanentemente.",
    },
    {
      q: "Tem garantia se os seguidores caírem?",
      a: "Sim. Nossos serviços com 'Refill' ou 'Garantia' oferecem reposição automática por 30 a 365 dias. Se cair, a gente repõe sem custo.",
    },
    {
      q: "Funciona para qualquer tipo de conta?",
      a: "Sim. Perfis pessoais, empresas, criadores de conteúdo, lojas — todos podem usar. Basta ter um perfil público ou link válido.",
    },
    {
      q: "Como faço o pedido?",
      a: "Crie uma conta no Clou, deposite via Pix, escolha o serviço desejado, informe o link do seu perfil/post e confirme. Pronto — o processo começa automaticamente.",
    },
  ],
};

export const instagramServiceTags: Record<string, { badge: string; variant: "popular" | "best-value" | "fast" | "guarantee" }> = {
  "seguidores-brasil-10k": { badge: "🔥 Popular", variant: "popular" },
  "seguidores-brasil-feminino": { badge: "🛡️ Refill 30d", variant: "guarantee" },
  "seguidores-brasil-reais": { badge: "⚡ 20K/dia", variant: "fast" },
  "seguidores-mundiais": { badge: "💰 Menor Preço", variant: "best-value" },
  "curtidas-instantaneas": { badge: "⚡ Non-Drop", variant: "fast" },
  "curtidas-brasileiras-refill": { badge: "🛡️ Refill 30d", variant: "guarantee" },
  "curtidas-300k-dia": { badge: "🚀 300K/hora", variant: "fast" },
  "visualizacoes-reels": { badge: "🎬 Reels", variant: "popular" },
  "visualizacoes-stories": { badge: "📱 Stories", variant: "popular" },
};