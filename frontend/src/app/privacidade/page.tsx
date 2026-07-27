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
      src={(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/privacidade"}
      className="w-full h-screen border-0"
      title="Política de Privacidade"
    />
  );
}
