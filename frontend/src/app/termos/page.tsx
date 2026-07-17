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
      src={process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000" + "/termos"}
      className="w-full h-screen border-0"
      title="Termos de Uso"
    />
  );
}
