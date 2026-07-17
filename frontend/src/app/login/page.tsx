import type { Metadata } from "next";
import LoginPage from "./login-client";

export const metadata: Metadata = {
  title: "Entrar — Clou",
  description:
    "Acesse sua conta Clou para gerenciar seus pedidos, saldo e serviços de impulsionamento digital.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPageWrapper() {
  return <LoginPage />;
}
