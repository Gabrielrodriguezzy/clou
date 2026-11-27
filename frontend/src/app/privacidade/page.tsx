import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — Clou",
  description: "Política de privacidade da plataforma Clou — como tratamos seus dados pessoais.",
  alternates: {
    canonical: "/privacidade",
  },
  openGraph: {
    title: "Política de Privacidade — Clou",
    description: "Política de privacidade da plataforma Clou — como tratamos seus dados pessoais.",
    url: "/privacidade",
    type: "website",
  },
};

function Section({ title, content, list }: any) {
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
    title: "1. Quem somos",
    content: [
      'O Clou ("nós", "plataforma") é uma plataforma de intermediação de serviços de impulsionamento digital. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)</strong>.',
    ],
  },
  {
    title: "2. Dados que coletamos",
    content: [
      "<strong>2.1. Dados fornecidos por você:</strong> nome, e-mail, senha (criptografada), preferências de notificação.",
      "<strong>2.2. Coletados automaticamente:</strong> endereço IP, User-Agent, cookies de autenticação, páginas acessadas.",
      "<strong>2.3. Dados de transações:</strong> histórico de depósitos, pedidos, saldo disponível.",
    ],
  },
  {
    title: "3. Como usamos seus dados",
    list: [
      "<strong>Prestação dos serviços</strong> — processar pedidos, gerenciar saldo, emitir depósitos.",
      "<strong>Comunicação</strong> — notificações sobre status de pedidos e alterações.",
      "<strong>Segurança</strong> — prevenir fraudes e acessos não autorizados.",
      "<strong>Obrigações legais</strong> — cumprir exigências de órgãos reguladores.",
    ],
  },
  {
    title: "4. Compartilhamento de dados",
    content: [
      '4.1. O Clou <strong>não vende, aluga ou compartilha</strong> seus dados pessoais para fins de marketing.',
      "4.2. Compartilhamos dados estritamente necessários com provedores de pagamento (para processar depósitos) e provedores SMM (apenas link e quantidade, nunca dados pessoais).",
    ],
  },
  {
    title: "5. Armazenamento e segurança",
    content: [
      "5.1. Dados armazenados em servidores seguros com criptografia TLS/SSL e senhas com hash.",
      "5.2. Em caso de incidente de segurança, você será notificado em até 48 horas.",
    ],
  },
  {
    title: "6. Retenção e exclusão",
    content: [
      "6.1. Mantemos dados pelo período necessário às obrigações legais (até 5 anos para fins fiscais).",
      "6.2. Ao excluir sua conta, dados pessoais são anonimizados ou excluídos em 30 dias.",
    ],
  },
  {
    title: "7. Seus direitos (LGPD)",
    content: [
      'Você tem direito a: acesso, correção, exclusão, portabilidade e revogação do consentimento dos seus dados. Para exercer, envie e-mail para <strong>privacidade@clou.com</strong>. Responderemos em até 15 dias úteis.',
    ],
  },
  {
    title: "8. Cookies",
    content: [
      "Utilizamos apenas cookies essenciais (autenticação e preferências de interface). Não usamos cookies de rastreamento ou publicidade.",
    ],
  },
  {
    title: "9. Contato do Encarregado (DPO)",
    content: [
      "<strong>E-mail:</strong> privacidade@clou.com<br /><strong>Horário:</strong> Segunda a Sexta, 9h às 18h",
    ],
  },
];

export default function PrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <a href="/" className="text-sm text-[#7170ff] hover:text-[#5e6ad2] transition-colors mb-8 inline-block">
        ← Voltar ao início
      </a>
      <h1 className="text-4xl font-bold text-[#f7f8f8] mb-2">Política de Privacidade</h1>
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
