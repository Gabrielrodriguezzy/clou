import { Suspense } from "react";
import type { Metadata } from "next";
import RegisterPage from "./register-client";

export const metadata: Metadata = {
  title: "Criar Conta — Clou",
  description:
    "Cadastre-se na Clou e comece a impulsionar suas redes sociais. Seguidores, curtidas e visualizações para Instagram, TikTok e YouTube.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={null}>
      <RegisterPage />
    </Suspense>
  );
}
