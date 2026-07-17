import { Suspense } from "react";
import type { Metadata } from "next";
import PedidoPage from "./pedido-client";

export const metadata: Metadata = {
  title: "Acompanhar Pedido — Clou",
  description:
    "Acompanhe o status do seu pedido de impulsionamento digital em tempo real. Veja progresso, timeline e detalhes.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PedidoPageWrapper() {
  return (
    <Suspense fallback={null}>
      <PedidoPage />
    </Suspense>
  );
}
