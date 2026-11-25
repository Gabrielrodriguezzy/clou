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

export default function TermosPage() {
  return (
    <iframe
      src="https://clou-backend.onrender.com/termos"
      className="w-full h-screen border-0"
      title="Termos de Uso"
    />
  );
}
