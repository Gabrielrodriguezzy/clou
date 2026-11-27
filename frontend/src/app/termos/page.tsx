import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso — Clou",
  description: "Termos e condições de uso da plataforma Clou — serviços de impulsionamento digital.",
  alternates: {
    canonical: "/termos",
  },
  openGraph: {
    title: "Termos de Uso — Clou",
    description: "Termos e condições de uso da plataforma Clou — serviços de impulsionamento digital.",
    url: "/termos",
    type: "website",
  },
};

function Section({ title, content, list, contentAfter, listAfter, contentEnd }: any) {
  const items = (
    <>
      {content?.map((p: string) => (
        <p key={p.slice(0, 30)} className="mb-2" dangerouslySetInnerHTML={{ __html: p }} />
      ))}
      {list && <ul className="list-disc pl-6 mt-1 mb-2 space-y-1">{
        list.map((item: string) => (
          <li key={item.slice(0, 30)} dangerouslySetInnerHTML={{ __html: item }} />
        ))
      }</ul>}
      {contentAfter?.map((p: string) => (
        <p key={p.slice(0, 30)} className="mb-2 mt-2" dangerouslySetInnerHTML={{ __html: p }} />
      ))}
      {listAfter && <ul className="list-disc pl-6 mt-1 mb-2 space-y-1">{
        listAfter.map((item: string) => (
          <li key={item.slice(0, 30)} dangerouslySetInnerHTML={{ __html: item }} />
        ))
      }</ul>}
      {contentEnd?.map((p: string) => (
        <p key={p.slice(0, 30)} className="mb-2" dangerouslySetInnerHTML={{ __html: p }} />
      ))}
    </>
  );
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-[#f7f8f8] mb-3">{title}</h2>
      {items}
    </section>
  );
}

const sections = [
  {
    title: "1. Aceitação dos Termos",
    content: [
      'Ao acessar ou utilizar a plataforma Clou ("Serviço"), você ("Usuário", "Cliente") declara ter lido, compreendido e aceitado integralmente estes Termos de Uso e a Política de Privacidade.',
      "Caso não concorde com qualquer disposição destes Termos, você não deve utilizar o Serviço.",
    ],
  },
  {
    title: "2. Definições",
    list: [
      "<strong>Plataforma / Clou:</strong> sistema web que intermedia serviços de impulsionamento digital junto a provedores terceiros.",
      "<strong>Serviços:</strong> entregas de engajamento digital (seguidores, curtidas, visualizações) em plataformas de terceiros (Instagram, TikTok, YouTube, Telegram, Twitter/X).",
      "<strong>Provedor:</strong> empresa terceira que executa tecnicamente os serviços contratados.",
      "<strong>Saldo:</strong> crédito pré-pago depositado para aquisição de Serviços.",
    ],
  },
  {
    title: "3. Natureza do Serviço",
    content: [
      "3.1. O Clou é uma plataforma de intermediação digital entre o Usuário e Provedores terceiros.",
      '3.2. O Clou <strong>não garante</strong> que seguidores, curtidas ou visualizações entregues sejam de contas ativas, reais ou brasileiras, salvo quando expressamente especificado.',
      '3.3. O Clou <strong>não é afiliado ou parceiro</strong> do Instagram, TikTok, YouTube ou qualquer outra plataforma social.',
    ],
  },
  {
    title: "4. Depósitos e Saldo",
    content: [
      '4.1. O Clou opera exclusivamente em regime <strong>pré-pago</strong> via Pix.',
      '4.2. O saldo depositado <strong>não é reembolsável</strong>, exceto nas hipóteses previstas no item 7.',
    ],
  },
  {
    title: "5. Contratação de Serviços",
    content: [
      "5.1. Ao solicitar um Serviço, o valor é deduzido do saldo no momento da solicitação.",
      '5.2. Uma vez deduzido o saldo, <strong>não é possível cancelar</strong> a solicitação.',
      "5.3. Prazos de entrega são estimativas, não garantias.",
    ],
  },
  {
    title: "6. Cupons de Desconto",
    content: [
      "6.1. Cupons são válidos dentro do período e condições especificados.",
      "6.2. O Clou pode revogar cupons a qualquer momento, sem aviso prévio.",
    ],
  },
  {
    title: "7. Reembolsos e Garantia",
    content: [
      '7.1. Garantia de <strong>reposição (refill)</strong> nos serviços que indicarem essa cobertura.',
      "7.2. Reembolsos concedidos exclusivamente se:",
    ],
    list: [
      "O pedido ficar em status pendente/processando por mais de 72h.",
      "O serviço não iniciar entrega em até 48h.",
      "Erro técnico comprovado do sistema Clou.",
    ],
    contentEnd: [
      '7.3. Não estão cobertos: arrependimento, perda fora do período de garantia, bloqueio na rede social, ou insatisfação com a qualidade.',
      "7.4. Reembolsos são creditados como saldo na plataforma.",
    ],
  },
  {
    title: "8. Limitação de Responsabilidade",
    list: [
      "Ações dos Provedores, incluindo atrasos ou falhas.",
      "Bloqueio ou suspensão aplicados pelas plataformas sociais ao perfil do Usuário.",
      "Danos diretos ou indiretos decorrentes do uso do Serviço.",
    ],
  },
  {
    title: "9. Privacidade e Dados",
    content: [
      'O tratamento de dados pessoais é regido pela <a href="/privacidade" class="text-[#7170ff] hover:text-[#5e6ad2]">Política de Privacidade</a> do Clou.',
    ],
  },
  {
    title: "10. Disposições Gerais",
    content: [
      "10.1. Estes Termos são regidos pela legislação brasileira.",
      "10.2. Foro eleito: Comarca de Franco da Rocha, SP.",
      "10.3. O Clou pode alterar estes Termos com aviso prévio de 15 dias.",
    ],
  },
];

export default function TermosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <a href="/" className="text-sm text-[#7170ff] hover:text-[#5e6ad2] transition-colors mb-8 inline-block">
        ← Voltar ao início
      </a>
      <h1 className="text-4xl font-bold text-[#f7f8f8] mb-2">Termos de Uso</h1>
      <p className="text-xs text-[#62666d] mb-8">Última atualização: 16 de julho de 2026</p>
      <div className="text-sm text-[#8a8f98] leading-relaxed space-y-6">
        {sections.map((s) => Section(s))}
      </div>
      <div className="border-t border-[rgba(255,255,255,0.05)] mt-12 pt-8 text-center text-xs text-[#62666d]">
        <p>Clou — Plataforma de Impulsionamento Digital</p>
        <p className="mt-1">Franco da Rocha, SP — Brasil</p>
      </div>
    </div>
  );
}
