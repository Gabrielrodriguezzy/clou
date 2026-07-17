"use client";

import { useState } from "react";
import BuyModal from "@/components/BuyModal";

interface ServiceData {
  id: number;
  name: string;
  description: string | null;
  price: number;
  min_amount: number;
  max_amount: number;
  avg_time: string;
  guarantee: string;
  platform?: { id: number; name: string; slug: string };
  category?: { id: number; name: string };
}

export default function BuyButton({ service, token }: { service: ServiceData; token: string }) {
  const [buying, setBuying] = useState<ServiceData | null>(null);
  return (
    <>
      <button onClick={() => setBuying(service)} className="btn-accent w-full !py-3 mb-3">
        Comprar Agora
      </button>
      <BuyModal
        service={buying}
        isOpen={!!buying}
        onClose={() => setBuying(null)}
        token={token}
      />
    </>
  );
}
