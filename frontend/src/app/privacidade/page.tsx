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

export default function PrivacidadePage() {
  return (
    <iframe
      src="https://clou-production.up.railway.app/privacidade"
      className="w-full h-screen border-0"
      title="Política de Privacidade"
    />
  );
}
