"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { api } from "@/lib/api";

interface OrderStatus {
  id: number;
  service_name: string;
  link: string;
  quantity: number;
  charge: number;
  status: string;
  start_count: number | null;
  remains: number | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
}

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "Pendente", color: "text-yellow-400", icon: "⏳" },
  processing: { label: "Processando", color: "text-blue-400", icon: "⚙️" },
  in_progress: { label: "Em Andamento", color: "text-emerald-400", icon: "🚀" },
  completed: { label: "Concluído", color: "text-green-400", icon: "✅" },
  partial: { label: "Parcial", color: "text-amber-400", icon: "⚠️" },
  cancelled: { label: "Cancelado", color: "text-red-400", icon: "❌" },
  refunded: { label: "Reembolsado", color: "text-purple-400", icon: "💳" },
  error: { label: "Erro", color: "text-red-500", icon: "🔴" },
};

const statusOrder = ["pending", "processing", "in_progress", "completed"];

function ProgressBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.min(Math.round((current / max) * 100), 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{current.toLocaleString()} entregue</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-600 mt-1">de {max.toLocaleString()} solicitados</p>
    </div>
  );
}

function Timeline({ currentStatus }: { currentStatus: string }) {
  const currentIdx = statusOrder.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-0">
      {statusOrder.map((s, i) => {
        const st = statusLabels[s];
        const done = i <= currentIdx && currentStatus !== "error" && currentStatus !== "cancelled";
        const isCurrent = i === currentIdx;
        return (
          <div key={s} className="flex-1 relative">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  done
                    ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500"
                    : "bg-slate-800 text-slate-600 border-2 border-slate-700"
                } ${isCurrent ? "scale-110 shadow-lg shadow-emerald-500/20" : ""}`}
              >
                {done ? "✓" : i + 1}
              </div>
              <p className={`text-[10px] mt-1 text-center ${done ? "text-emerald-400" : "text-slate-600"}`}>
                {st.label}
              </p>
            </div>
            {i < statusOrder.length - 1 && (
              <div
                className={`absolute top-4 left-[60%] w-[80%] h-[2px] ${
                  i < currentIdx ? "bg-emerald-500" : "bg-slate-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PedidoPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("clou_token");
    if (!token) return;

    api.get<OrderStatus>(`/orders/${params.id}`, token)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-800 rounded w-1/3" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
            <div className="h-32 bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-white mb-2">Pedido não encontrado</h1>
          <p className="text-slate-500 text-sm mb-6">{error || "Este pedido não existe ou foi removido."}</p>
          <Link href="/dashboard/pedidos" className="text-emerald-400 hover:text-emerald-300 text-sm">← Meus Pedidos</Link>
        </div>
      </div>
    );
  }

  const st = statusLabels[order.status] || statusLabels.error;
  const remains = order.remains ?? 0;
  const delivered = order.quantity - remains;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-600 mb-8">
          <Link href="/dashboard" className="hover:text-slate-400">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard/pedidos" className="hover:text-slate-400">Pedidos</Link>
          <span>/</span>
          <span className="text-slate-400">#{order.id}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{order.service_name}</h1>
            <p className="text-slate-500 text-sm mt-1">Pedido #{order.id}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            st.color.includes("emerald") ? "bg-emerald-500/10" :
            st.color.includes("red") ? "bg-red-500/10" :
            st.color.includes("yellow") ? "bg-yellow-500/10" :
            st.color.includes("blue") ? "bg-blue-500/10" : "bg-slate-800"
          } border border-current/20`}>
            <span className={st.color}>{st.icon}</span>
            <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-sm font-medium text-white mb-4">Progresso</h2>
          <Timeline currentStatus={order.status} />
        </div>

        {/* Barra de Progresso */}
        {(order.status === "in_progress" || order.status === "partial" || order.status === "completed") && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-sm font-medium text-white mb-3">Entrega</h2>
            <ProgressBar current={delivered} max={order.quantity} />
          </div>
        )}

        {/* Detalhes */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-sm font-medium text-white mb-4">Detalhes do Pedido</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Link</p>
              <p className="text-slate-300 truncate">{order.link}</p>
            </div>
            <div>
              <p className="text-slate-600">Quantidade</p>
              <p className="text-slate-300">{order.quantity.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-600">Valor</p>
              <p className="text-slate-300">R$ {order.charge.toFixed(2).replace(".", ",")}</p>
            </div>
            <div>
              <p className="text-slate-600">Criado em</p>
              <p className="text-slate-300">{new Date(order.created_at).toLocaleString("pt-BR")}</p>
            </div>
            {order.start_count != null && (
              <div>
                <p className="text-slate-600">Contagem inicial</p>
                <p className="text-slate-300">{order.start_count.toLocaleString()}</p>
              </div>
            )}
            {order.remains != null && (
              <div>
                <p className="text-slate-600">Restante</p>
                <p className="text-slate-300">{order.remains.toLocaleString()}</p>
              </div>
            )}
          </div>
          {order.notes && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-slate-600 text-sm mb-1">Observações</p>
              <p className="text-slate-400 text-sm">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/pedidos" className="btn-secondary text-sm !py-2 !px-4">
            ← Voltar
          </Link>
          <Link href="/dashboard/comprar" className="btn-accent text-sm !py-2 !px-4">
            Comprar Novamente
          </Link>
        </div>
      </main>
    </div>
  );
}
